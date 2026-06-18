import { Colors } from "../managers/color.js";
import { Screen } from "../managers/screen.js";
import { ansi, tty, write, exit } from "../tty.js";
import { log } from "../file-writer.js";

export class Component {
  static default = {
    row: 1,
    column: 1,
    resize: false,
  };

  constructor(opts = {}) {
    Object.assign(this, Component.default, opts);
    if (!this.text) {
      this.text = this.__proto__.constructor.name;
    }
  }

  get width() {
    return 0;
  }

  get height() {
    return 0;
  }

  move(rows = 0, columns = 0) {
    if (!rows && !columns) return;
    this.row += rows;
    this.column += columns;
    const items = this.items ?? [];
    for (const item of items) item.move(rows, columns);
  }

  async highlight() {
    this.highlighted = true;
    await this.draw();
  }

  async unhighlight() {
    this.highlighted = undefined;
    await this.draw();
  }

  async draw(content = ``) {
    const { row, column, highlighted } = this;
    await Colors.setHiglight(highlighted);
    const lines = content.split(`\n`).map((line, i) => ({ line, i }));
    for (const { line, i } of lines) {
      await Screen.setCursor(row + i, column);
      write(line);
    }
  }

  async reflow(rows, total) {
    return 0;
  }
}
