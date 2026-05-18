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

  restore() {
    ansi(`0m`);
  }

  setCursor(row, column) {
    ansi(`${row};${column}H`);
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
    // reset
    console.clear();

    // move to impossible position, which places the
    // cursor on the last available coordinate
    this.setCursor(9999, 9999);
    const pos = await this.getCursor();

    // get the terminal dimensions based on that.
    this.rows = pos[0];
    this.columns = pos[1];

    // then set the cursor at (0,0)
    await ansi(`0;0H`);
  }

  async writeToScreen(
    string,
    row = this.currentRow,
    column = this.currentColumn,
  ) {
    ansi(`${column};${row}H${string}`);
    this.updateCursor();
  }
})();
