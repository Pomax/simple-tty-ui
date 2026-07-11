import { ItemComponent } from "./component.js";
import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";
import { ActionItem } from "./action-item.js";

const { ceil, max } = Math;

export class List extends ItemComponent {
  static default = {
    resize: true,
  };

  constructor(name, type, opts = {}) {
    opts.text = name;
    super(name, Object.assign({}, List.default, opts));
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

  add(text, opts = {}) {
    const { items, row, column, height, type: ItemType } = this;
    opts.row = row + height;
    opts.column = column;
    const item = new ItemType(text, opts);
    items.push(item);
    return item;
  }

  reset() {
    const original = this.items;
    this.items = [];
    this.skipSize = 1;
    const { row, column, items } = this;
    for (const item of original) {
      item.row = row + items.length;
      item.column = column;
      items.push(item);
    }
  }

  /**
   * ...docs go here...
   */
  async reflow(rows, total) {
    if (!this.resize) return 0;

    const { items, column, row } = this;
    const currentHeight = this.height;

    // Then check if we need to reflow
    let ideal = ceil(rows / (total + 1));
    if (currentHeight <= ideal) return 0;

    // If we do, let's assume we have the entire width available: what's a decent cutoff?
    const bottom = Screen.padding + Screen.innerHeight;
    while (ideal > 1 && row + ideal >= bottom) ideal--;
    this.skipSize = ideal;
    const skipSize = max(1, this.skipSize)

    const { length } = items;
    const d = ceil(length / skipSize);
    const step = (Screen.width / d) | 0;

    // Then update our item row/column values accordingly
    for (let s = 0; s < d; s++) {
      const c = s * step;
      for (let r = 0; r < skipSize; r++) {
        const i = items[r + s * skipSize];
        if (!i) continue;
        i.row = row + r;
        i.column = column + c;
      }
    }

    // then return the difference in height due to reflow
    return currentHeight - this.height;
  }
}

export class ButtonList extends List {
  constructor(name, opts = {}) {
    super(name, ActionItem, opts);
  }

  add(text, onToggle, opts = {}) {
    opts.onToggle ??= onToggle;
    return super.add(text, opts);
  }
}

export class CheckboxList extends List {
  constructor(name, opts = {}) {
    super(name, CheckboxItem, opts);
  }
  get values() {
    return {
      name: this.text,
      values: this.items.map((item) => item.values),
    };
  }
}

export class FilterList extends List {
  constructor(name, opts = {}) {
    super(name, FilterItem, opts);
  }
  get values() {
    return {
      name: this.text,
      values: this.items.map((item) => item.values),
    };
  }
}
