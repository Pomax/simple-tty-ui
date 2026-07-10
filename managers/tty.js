import util from "node:util";

import { initColors } from "./color.js";
import { Screen } from "./screen.js";
import { emitKeypressEvents } from "node:readline";
import { Page } from "../components/page.js";

const { stdin, stdout } = process;
export { stdin, stdout };

// Use a keepalive so we only exit via exit()...
// We need this to deal with process spawns, as
// we rely on TTY input, which Node does not consider
// "active code" and so the moment we spawn a process
// control gets handed over to that process and then
// when it exits, Node thinks nothing is running.
// And now your program's gone. So... keepalive.
setInterval(() => {}, 6000 * 60);

const mark = `\x1b`;

/**
 * Hide the cursor in the terminal.
 */
export const hideCursor = () => ansi("?25l");

/**
 * Show the cursor in the terminal.
 */
export const showCursor = () => ansi("?25h");

/**
 * Write data to stdout.
 */
export const write = async (string) => {
  stdout.write(string);
};

export const log = async (string) => {
  await Screen.setCursorForLogging();
  const { width } = Screen;
  string =
    `LOG: ` + string + ` `.repeat(width - string.length - Screen.padding * 2);
  return write(string);
};

/**
 * Run an ANSI coded command to stdout.
 */
export const ansi = (string, question) =>
  write(
    `${mark}${question ? `]` : `[`}${string}${question ? `;?${mark}\\` : ``}`,
  );

/**
 * Write data to the TTY, and capture the result if
 * we're dealing with an ANSI command by checking
 * stdin for data.
 */
export function tty(query, question = false, raw = false) {
  return new Promise((resolve) => {
    stdin.once(`data`, (data) => {
      resolve(util.inspect(data.toString()));
    });
    if (raw) {
      write(query);
    } else {
      ansi(query, question);
    }
  });
}

/**
 * Enable rebinding the terminal's dimensions
 * on a window resize, with a redraw callback
 */
export function enableResize(draw) {
  stdout.on(`resize`, async () => {
    const { columns, rows } = process.stdout;
    Object.assign(Screen, { rows, columns });
    await Page.current.unselect();
    await Page.setCurrentPage(Page.current);
    await draw();
  });
}

/**
 * Revert the TTY to a normal state, restoring
 * the original colors, the cursor, and input mode.
 */
export async function revert(clearScreen = true) {
  Screen.restore();
  if (clearScreen) await Screen.clear();
  stdin.setRawMode(false);
  stdin.pause();
  await showCursor();
}

/**
 * Revert and then kill the running process.
 */
export async function exit(clearScreen = true) {
  revert(clearScreen);
  process.exit();
}

/**
 * Set up TTY handling.
 */
export async function setup(draw, handleKey, handleEsc = true) {
  emitKeypressEvents(stdin);
  initColors(stdout.getColorDepth());

  if (process.stdout.isTTY) {
    process.stdout.write("\x1b[?2004h");

    // We want to be able to deal with user input,
    // even if we don't show key presses.
    stdin.setRawMode(true);
    stdin.on("keypress", async (str, key) => {
      const { sequence, name, ctrl } = key ?? {};
      const { current } = Page;

      if (ctrl && name === "c") {
        return exit();
      } else if (name === `up`) {
        current?.previous?.();
      } else if (name === `down`) {
        current?.next?.();
      } else if (current?.selected?.handleKey) {
        await current.selected.handleKey(str, key);
      } else if (name === `left`) {
        current?.previous?.(true);
      } else if (name === `right`) {
        current?.next?.(true);
      } else if (str === `q`) {
        exit();
      } else if (name === `return` || name === `space`) {
        current?.toggle?.();
      }

      await handleKey?.(str, key);
    });

    // This part's kinda bizarre, but Node.js has a 500ms default
    // timeout between receiving it as data event, and forwarding
    // it as parsed key event. And quit should be immediate.
    if (handleEsc) {
      stdin.on(
        "data",
        (data) => data.length === 1 && data[0] === 0x1b && exit(),
      );
    }

    // TODO: this should just be a pure `data` handler without relying
    //       on Node's emitKeypressEvents because it's fucking useless
    //       for things like pasting text, instead sending the paste as
    //       individual letters in raw mode, without any flag that says
    //       it was part of a paste action.
  }

  hideCursor();
  await enableResize(draw);
  await draw(false);
}
