import { ItemComponent } from "./component.js";
import { CheckboxItem } from "./checkbox-item.js";
import { FilterItem } from "./filter-item.js";
import { Screen } from "../managers/screen.js";
import { log } from "../file-writer.js";
import { write, exit } from "../tty.js";
import { ActionItem } from "./action-item.js";

const { ceil, max } = Math;

export class List extends ItemComponent {
  static default = {
    resize: true,
  };

  constructor(name, type, opts = {}) {
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
    opts.column = column + 1;
    const item = new ItemType(text, opts);
    items.push(item);
    return item;
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
    super(name, ActionItem, opts);
  }
}

export class CheckboxList extends List {
  constructor(name, opts = {}) {
    super(name, CheckboxItem, opts);
  }
}

export class FilterList extends List {
  constructor(name, opts = {}) {
    super(name, FilterItem, opts);
  }
}
