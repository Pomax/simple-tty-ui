import { Colors } from "../managers/color.js";
import { Screen } from "../managers/screen.js";
import { ansi, tty, write, log } from "../tty.js";

export class Component {
  static default = {
    row: 1,
    column: 1,
    resize: false,
  };

  constructor(opts = {}) {
    Object.assign(this, Component.default, opts);
    if (!this.label) {
      this.label = this.__proto__.constructor.name;
    }
  }

  get height() {
    return this.lastRow - this.row + 1;
  }

  get lastRow() {
    return this.row;
  }

  async highlight() {
    this.highlighted = true;
    await log(`highlighting item "${this.label}"`);
    await this.draw();
  }

  async unhighlight() {
    this.highlighted = undefined;
    await this.draw();
  }

  async draw(content) {
    const { row, column } = this;
    await Screen.setCursor(row, column);
    if (this.highlighted) {
      await Colors.highlight();
    } else {
      await Colors.standard();
    }
    return write(content);
  }

  async reflow(rows) {
    if (!this.resize) return;
    console.log(`reflowing over ${rows}...`);
  }
}
