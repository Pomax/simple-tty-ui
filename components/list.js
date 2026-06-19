import { Component } from "./component.js";
import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";
import { log } from "../file-writer.js";
import { write, exit } from "../tty.js";
import { ActionItem } from "./action-item.js";

const { ceil, max } = Math;

export class List extends Component {
  static default = {
    resize: true,
    skipSize: 1,
  };

  items = [];

  constructor(type, opts = {}) {
    super(Object.assign({}, List.default, opts));
    this.type = type;
  }

  get width() {
    return max(...this.items.map((e) => e.width));
  }

  get height() {
    const { items } = this;
    const bins = {};
    items.forEach((item) => {
      bins[item.column] ??= 0;
      bins[item.column]++;
    });
    const values = Object.values(bins);
    if (values.length === 0) return 0;
    return max(...values);
  }

  async select(startAtEnd = false) {
    const { items } = this;
    if (!this.selected && items.length) {
      const selected = items.at(startAtEnd ? -1 : 0);
      this.selected = selected;
      await this.selected?.highlight();
    }
  }

  async unselect() {
    this.selected = await this.selected?.unhighlight();
  }

  async _move_to(pos) {
    const { items, selected } = this;
    await this.unselect();
    if (pos < 0 || pos >= items.length) {
      return false;
    }
    this.selected = items[pos];
    await this.selected.highlight();
    return true;
  }

  async next(skip = false) {
    if (skip) return this.skipNext();
    const { items, selected } = this;
    const next = items.indexOf(selected) + 1;
    return this._move_to(next);
  }

  async skipNext() {
    const { items, selected } = this;
    let next = items.indexOf(selected) + this.skipSize;
    if (next > items.length) next = items.length - 1;
    return this._move_to(next);
  }

  async previous(skip = false) {
    if (skip) return this.skipPrevious();
    const { items, selected } = this;
    const prev = items.indexOf(selected) - 1;
    return this._move_to(prev);
  }

  async skipPrevious() {
    const { items, selected } = this;
    let prev = items.indexOf(selected) - this.skipSize;
    if (prev < 0) prev = 0;
    return this._move_to(prev);
  }

  async toggle() {
    await this.selected?.toggle();
  }

  add(text, opts = {}) {
    const { items, row, column, height, type: ItemType } = this;
    opts.row = row + height;
    opts.column = column + 1;
    const item = new ItemType(text, opts);
    items.push(item);
    return item;
  }

  async draw() {
    for (const item of this.items) await item.draw();
  }

  /**
   * ...docs go here...
   */
  async reflow(rows, total) {
    const height = this.height;
    const { items } = this;
    const { length } = items;

    let ideal = ceil(rows / (total + 1));

    // do we even need to reflow?
    if (height <= ideal) {
      return 0;
    }

    // for now let's assume we have the entire width availalbe: what's a decent cutoff?
    const bottom = Screen.rows - Screen.padding;
    while (ideal > 1 && this.row + ideal >= bottom) ideal--;

    this.skipSize = ideal;

    const d = ceil(length / ideal);
    const step = (Screen.width / d) | 0;

    for (let s = 0; s < d; s++) {
      const c = s * step;
      for (let r = 0; r < ideal; r++) {
        const i = items[r + s * ideal];
        if (!i) continue;
        i.row = this.row + r;
        i.column = this.column + c;
      }
    }

    return height - this.height;
  }
}

export class ActionList extends List {
  constructor(name, opts = {}) {
    opts.name = name;
    super(ActionItem, opts);
  }
}

export class CheckboxList extends List {
  constructor(name, opts = {}) {
    opts.name = name;
    super(CheckboxItem, opts);
  }
}

export class FilterList extends List {
  constructor(name, opts = {}) {
    opts.name = name;
    super(FilterItem, opts);
  }
}
