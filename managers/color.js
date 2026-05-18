import { ansi, tty, write } from "../tty.js";
const { stdin, stdout } = process;

/**
 * Color management object
 */
export const Colors = new (class {
  predefined = {
    Black: 0,
    Red: 1,
    Green: 2,
    Yellow: 3,
    Blue: 4,
    Magenta: 5,
    Cyan: 6,
    White: 7,
  };

  async restore() {
    const [fg, bg] = [await tty(`10`, true), await tty(`11`, true)].map(
      (codes) => {
        console.log(codes);
        const [_, r, g, b] = codes.match(
          /rgb:([0-9a-f]+)\/([0-9a-f]+)\/([0-9a-f]+)/,
        );
        return [r, g, b].map((v) => parseInt(v.substring(0, 2), 16));
      },
    );
    this.setColor(...fg);
    this.setBackground(...bg);
  }

  setColor(r, g, b) {
    if (g === undefined && b === undefined) {
      return ansi(`${30 + r}m`);
    }
    ansi(`38;2;${r};${g};${b}m`);
  }

  setBackground(r, g, b) {
    if (g === undefined && b === undefined) {
      return ansi(`${40 + r}m`);
    }
    ansi(`48;2;${r};${g};${b}m`);
  }

  reset() {
    ansi(`0m`);
  }
})();
