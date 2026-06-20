import { ansi, tty } from "./tty.js";



/**
 * Screen management object
 */
export const Screen = new (class {
  rows = 0;
  columns = 0;
  currentRow = 0;
  currentColumn = 0;
  padding = 1; // border by default

  get width() {
    return this.columns;
  }

  get innerWidth() {
    return this.width - this.padding * 2;
  }

  get height() {
    return this.rows;
  }

  get innerHeight() {
    return this.height - this.padding * 2;
  }

  setPadding(padding) {
    this.padding = padding;
  }

  async setCursor(row, column) {
    await ansi(`${row};${column}H`);
  }

  async setCursorForLogging() {
    this.setCursor(this.rows - this.padding, this.padding);
  }

  async getCursor() {
    const pos = await tty(`6n`);
    const [_, r, c] = pos.match(/([0-9]+);([0-9]+)/);
    return [r, c];
  }

  async updateCursor() {
    const pos = await this.getCursor();
    this.currentRow = pos[0];
    this.currentColumn = pos[1];
  }

  async clear() {
    console.clear();
    this.rows = process.stdout.rows;
    this.columns = process.stdout.columns;
  }

  async writeToScreen(
    string,
    row = this.currentRow,
    column = this.currentColumn,
  ) {
    ansi(`${row};${column}H${string}`);
    this.updateCursor();
  }

  restore() {
    ansi(`0m`);
  }
})();
