import { ansi, tty, write } from "../tty.js";
const { stdin, stdout } = process;

/**
 * Color management differs depending on the number of
 * bits the terminal supports for color work. This code
 * currently supports 4, 8, and 24 bit color modes.
 */
class Color {
  bits = 0;
  fg = 0;
  bg = 0;

  /**
   * Reset the terminal to its normal colors. This is a
   * little more reliable than just sending \0330m
   */
  async restore() {
    const [fg, bg] = [await tty(`10`, true), await tty(`11`, true)].map(
      (codes) => {
        const [_, r, g, b] = codes.match(
          /rgb:([0-9a-f]+)\/([0-9a-f]+)\/([0-9a-f]+)/,
        );
        return [r, g, b].map((v) => parseInt(v.substring(0, 2), 16));
      },
    );
    this.setColor(...fg);
    this.setBackground(...bg);
  }

  async highlight() {
    return false;
  }

  async standard() {
    return false;
  }
}

/**
 * the standard 8 color palette.
 */
class Color3Bit extends Color {
  bits = 3;

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

  async setColor(c) {
    fg = c;
    return ansi(`${30 + c}m`);
  }

  async setBackground(c) {
    bg = c;
    return ansi(`${40 + c}m`);
  }
}

/**
 * the standard 16 color palette, but with bright variants!
 */
class Color4Bit extends Color3Bit {
  bits = 4;

  async setColor(c, bright = false) {
    fg = c;
    if (!bright) return super.setColor(c);
    return ansi(`${90 + c}m`);
  }

  async setBackground(c, bright = false) {
    bg = c;
    if (!bright) return super.setBackground(c);
    return ansi(`${100 + c}m`);
  }
}

/**
 * A bit of 4 bit, a bit of 6 bit Cube LUT, a bit of grayscale. What a hot mess!
 */
class Color8Bit extends Color {
  bits = 8;

  getColorCode(r, g, b) {
    let c;
    if (b === undefined) {
      if (g === undefined) {
        // plain 0-15 code
        c = r;
      } else {
        // if "g" is truthy, r is grayscale 0 to 23
        c = 232 + r;
      }
    } else {
      // perform a cube mapping where each component is [0,5]
      r = (r / 51) | 0;
      g = (g / 51) | 0;
      b = (b / 51) | 0;
      c = 16 + 36 * r + 6 * g + b;
    }
    return c;
  }

  async setColor(r, g, b) {
    this.fg = [r, g, b];
    return ansi(`38;5;${this.getColorCode(r, g, b)}m`);
  }

  async setBackground(r, g, b) {
    this.bg = [r, g, b];
    return ansi(`48;5;${this.getColorCode(r, g, b)}m`);
  }
}

/**
 * "True" RGB, with 8 bits per channel.
 */
class Color24Bit extends Color {
  bits = 24;

  async setColor(r, g, b) {
    this.fg = [r, g, b];
    return ansi(`38;2;${r};${g};${b}m`);
  }

  async setBackground(r, g, b) {
    this.bg = [r, g, b];
    return ansi(`48;2;${r};${g};${b}m`);
  }

  async standard() {
    const { fg, bg } = this;
    return ansi(`38;2;${fg.join(`;`)};48;2;${bg.join(`;`)}m`);
  }

  async highlight() {
    const { fg, bg } = this;
    return ansi(`38;2;${bg.join(`;`)};48;2;${fg.join(`;`)}m`);
  }
}

// Imports get a live binding to this variable,
// so we can assign it in initColors and everyone
// will "magically" get the same Colors instance.
let Colors;

/**
 * Color management
 */
export function initColors(bitDepth) {
  if (bitDepth === 0) {
    throw new Error(`unknown color bit depth`);
  }
  if (bitDepth === 4) {
    Colors = new Color4Bit();
  }
  if (bitDepth === 8) {
    Colors = new Color8Bit();
  }
  if (bitDepth === 24) {
    Colors = new Color24Bit();
  }
}

export { Colors };
