import { Colors } from "../managers/color.js";
import { Screen } from "../managers/screen.js";
import { write } from "../managers/tty.js";

/**
 * Base component class
 */
export class Component {
  static default = {
    row: 1,
    column: 1,
    resize: false,
    widthPadding: 0,
  };

  constructor(opts = {}) {
    Object.assign(this, Component.default, opts);
    this.text ??= this.name ?? this.__proto__.constructor.name;
  }

  get state() {
    return {};
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
    await Colors.standard();
  }

  async reflow(_rows, _total) {
    return 0;
  }
}

/**
 * Anything that has a list of contained ".items"
 */
export class ItemComponent extends Component {
  static default = {
    skipSize: 1,
  };

  items = [];

  constructor(name, opts = {}) {
    opts.name = name;
    super(Object.assign({}, ItemComponent.default, opts));
  }

  add() {
    throw new Error(
      `Missing implementation for add() in ${this.__proto__.constructor.name}`,
    );
  }

  get state() {
    return this.items.reduce((acc, item) => {
      const { stateful, text, state } = item;
      if (stateful) acc[text] = state;
      return acc;
    }, {});
  }

  async select(startAtEnd = false) {
    const { items, skipSize } = this;
    if (!this.selected && items.length) {
      const selected = items.at(
        startAtEnd ? (skipSize > 1 ? skipSize - 1 : -1) : 0,
      );
      this.selected = selected;
      await this.selected?.highlight();
    }
  }

  async unselect() {
    this.selected = await this.selected?.unhighlight();
  }

  async _move_to(pos) {
    const { items } = this;
    await this.unselect();
    if (pos < 0 || pos >= items.length) return false;
    this.selected = items[pos];
    await this.selected.highlight();
    return true;
  }

  async next(skip = false) {
    if (skip) return this.skipNext();
    const { items, selected, skipSize } = this;
    const next = items.indexOf(selected) + 1;
    if (skipSize > 1 && next % skipSize === 0) {
      await this.unselect();
      return false;
    }
    return this._move_to(next);
  }

  async previous(skip = false) {
    if (skip) return this.skipPrevious();
    const { items, selected, skipSize } = this;
    const prev = items.indexOf(selected) - 1;
    if (skipSize > 1 && (prev + 1) % skipSize === 0) {
      await this.unselect();
      return false;
    }
    return this._move_to(prev);
  }

  async skipNext() {
    const { items, selected } = this;
    const curr = items.indexOf(selected);
    let next = curr + this.skipSize;
    if (next >= items.length) next = next % items.length;
    return this._move_to(next);
  }

  async skipPrevious() {
    const { items, selected } = this;
    const curr = items.indexOf(selected);
    let prev = items.indexOf(selected) - this.skipSize;
    if (prev < 0) prev = items.length + prev;
    return this._move_to(prev);
  }

  async toggle() {
    await this.selected?.toggle();
  }

  async draw() {
    for (const item of this.items) await item.draw();
  }
}
