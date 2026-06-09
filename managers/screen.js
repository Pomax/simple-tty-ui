import { ansi, tty, write } from "../tty.js";

const { stdin, stdout } = process;

/**
 * Screen management object
 */
export const Screen = new (class {
  rows = 0;
  columns = 0;
  currentRow = 0;
  currentColumn = 0;
  border = false;

  restore() {
    ansi(`0m`);
  }

  get width() {
    return this.columns - (this.border ? 2 : 0);
  }

  get height() {
    return this.rows - (this.border ? 2 : 0);
  }

  async setCursor(row, column) {
    await ansi(`${row};${column}H`);
  }

  async setCursorForLogging() {
    this.setCursor(this.rows - (this.border ? 1 : 0), this.border ? 2 : 1);
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
})();
