import { Colors } from "../managers/color.js";
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

  async highlight() {
    this.hl = true;
    await this.draw();
  }

  async unhighlight() {
    this.hl = undefined;
    await this.draw();
  }

  async draw(content) {
    const { row, column } = this;
    await Screen.setCursor(row, column);
    if (this.hl) {
      await Colors.highlight();
    } else {
      await Colors.standard();
    }
    return write(content);
  }
}
