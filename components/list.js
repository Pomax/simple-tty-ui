import { Component } from "./component.js";
import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";
import { log } from "../file-writer.js";

const { ceil } = Math;

export class List extends Component {
  static Checkbox = CheckboxItem;
  static Filter = FilterItem;

  static default = {};

  items = [];

  constructor(type, opts = {}) {
    super(Object.assign({}, List.default, opts));
    this.type = type;
  }

  get lastRow() {
    return this.items.at(-1)?.row ?? this.row;
  }

  async select(startAtEnd = false) {
    const { items } = this;
    if (!this.selected && items.length) {
      this.selected = items.at(startAtEnd ? -1 : 0);
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
    const { items } = this;
    opts.row = this.row + items.length;
    opts.column = this.column;
    const item = new this.type(opts);
    items.push(item);
    return item;
  }

  async draw() {
    const { row, column, items } = this;
    for (const item of items) await item.draw();
  }

  async reflow(rows, total) {
    const { items } = this;
    const { length } = items;

    const height = this.lastRow - this.row;
    const ideal = ceil(rows / total);

    // do we even need to reflow?
    if (height < ideal) {
      return rows - height;
    }

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
