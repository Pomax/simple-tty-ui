import { Component } from "./component.js";

import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";

export class List extends Component {
  static Checkbox = CheckboxItem;
  static Filter = FilterItem;

  static default = {
    row: 0,
    column: 0,
  };

  items = [];

  constructor(type, opts = {}) {
    super(Object.assign({}, List.default, opts));
    this.type = type;
  }

  async select(startAtEnd = false) {
    const { items } = this;
    if (!this.selected && items.length) {
      this.selected = items.at(startAtEnd ? -1 : 0);
      await this.selected?.highlight();
    }
  }

  async unselect() {
    await this.selected?.unhighlight();
    this.selected = undefined;
  }

  async next() {
    const { items, selected } = this;
    const next = items.indexOf(selected) + 1;
    await this.selected?.unhighlight();
    if (next >= items.length) {
      await this.unselect();
      return false;
    }
    this.selected = items[next];
    await this.selected.highlight();
    return true;
  }

  async previous() {
    const { items, selected } = this;
    const prev = items.indexOf(selected) - 1;
    await this.selected?.unhighlight();
    if (prev < 0) {
      await this.unselect();
      return false;
    }
    this.selected = items[prev];
    await this.selected?.highlight();
    return true;
  }

  async toggle() {
    await this.selected?.toggle();
  }

  add(opts) {
    const { items } = this;
    opts.row = this.row + items.length;
    opts.column = this.column;
    const item = new this.type(opts);
    items.push(item);
    return item;
  }

  async draw() {
    const { row, column, items } = this;
    for (const item of items) {
      await item.draw();
    }
  }
}
