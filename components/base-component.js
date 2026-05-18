import { Screen } from "../managers/screen.js";
import { ansi, tty, write } from "../tty.js";

export class Component {
  static default = {
    row: 0,
    column: 0,
    active: false,
  };

  constructor(opts = {}) {
    Object.assign(this, Component.default, opts);
  }

  async draw(content) {
    const { row, column } = this;
    await Screen.setCursor(row, column);
    write(content);
  }
}
