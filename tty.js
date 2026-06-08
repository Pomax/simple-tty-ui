import util from "node:util";
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
  return write(string);
}

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
 * Make sure we cleanly exit, restoring
 * the original colors, the cursor, and
 * input mode.
 */
export async function exit() {
  Screen.restore();
  await Screen.clear();
  showCursor();
  stdin.setRawMode(false);
  stdin.pause();
  process.exit();
}

/**
 * Set up TTY handling.
 */
export async function setup(draw, handleKey) {
  emitKeypressEvents(stdin);
  initColors(stdout.getColorDepth());

  if (process.stdout.isTTY) {
    // We want to be able to deal with user input,
    // even if we don't show key presses.
    stdin.setRawMode(true);
    stdin.on("keypress", (str, key) => {
      if (key && key.ctrl && key.name === "c") {
        exit();
      }
      if (key.name === `escape`) {
        exit();
      }
      handleKey(str, key);
    });
  }

  hideCursor();
  enableResize(draw);
  await draw();
}
