import util from "node:util";
import readline from "node:readline";

import { initColors } from "./managers/color.js";
import { Screen } from "./managers/screen.js";
import { emitKeypressEvents } from "node:readline";

const { stdin, stdout } = process;

export { stdin, stdout };

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
  string = string + ` `.repeat(width - string.length - Screen.padding * 2);
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
    raw ? write(query) : ansi(query, question);
  });
}

/**
 * Enable rebinding the terminal's dimensions
 * on a window resize, with a redraw callback
 */
export function enableResize(redraw) {
  stdout.on(`resize`, () => {
    const { columns, rows } = process.stdout;
    Object.assign(Screen, { rows, columns });
    redraw();
  });
}

/**
 * Revert the TTY to a normal state, restoring
 * the original colors, the cursor, and input mode.
 */
export async function revert(clearScreen = true) {
  Screen.restore();
  if (clearScreen) await Screen.clear();
  showCursor();
  stdin.setRawMode(false);
  stdin.pause();
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
    // We want to be able to deal with user input,
    // even if we don't show key presses.
    stdin.setRawMode(true);
    stdin.on("keypress", (str, key) => {
      if (key && key.ctrl && key.name === "c") {
        return exit();
      }
      handleKey(str, key);
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
  }

  hideCursor();
  enableResize(draw);
  await draw(false);
}
