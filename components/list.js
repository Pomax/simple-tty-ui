import { Component } from "./component.js";
import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";
import { log } from "../file-writer.js";
import { write, exit } from "../tty.js";

const { ceil, max } = Math;

export class List extends Component {
  static Checkbox = CheckboxItem;
  static Filter = FilterItem;

  static default = {};

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
    const { items, row, column, height, type: ItemType } = this;
    opts.row = row + height;
    opts.column = column + 1;
    const item = new ItemType(opts);
    items.push(item);
    return item;
  }

  async draw() {
    for (const item of this.items) await item.draw();
  }

  async reflow(rows, total) {
    const height = this.height;
    const { items } = this;
    const { length } = items;

    const ideal = ceil(rows / total);

    // do we even need to reflow?
    if (height <= ideal) {
      return 0;
    }

    // for now let's assume we have the entire width availabe: what's a decent cutoff?
    const d = ceil(length / ideal);
    const step = (Screen.width / d) | 0;
    for (let s = 0; s < d; s++) {
      const c = s * step;
      for (let r = 0; r <= ideal; r++) {
        const i = items[r + s * ideal];
        if (!i) continue;
        i.row = this.row + r;
        i.column = this.column + c;
      }
    }

    return height - this.height;
  }
}
