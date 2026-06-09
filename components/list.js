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
    return this.items.reduce((t, e) => t + e.height, 0);
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
    return;

    const { items, height } = this;
    const { length } = items;

    const ideal = ceil(rows / total);

    // do we even need to reflow?
    if (height < ideal) {
      return rows - height;
    }

    console.clear();
    console.log(`we need to reflow`);
    exit(false);

    // for now let's assume we have the entire width availabe: what's a decent cutoff?
    const d = ceil(length / ideal);
    log(`length: ${length}, rows: ${ideal}, total: ${total}, d: ${d}`);
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

    // ...compute new height...
    return rows - ideal - 2;
  }
}
