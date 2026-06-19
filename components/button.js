import { ItemComponent } from "./component.js";
import { ActionItem } from "./action-item.js";

/**
 * ...
 */
export class Button extends ActionItem {
  static default = {
    widthPadding: 2,
  };

  constructor(text, opts = {}) {
    super(text, Object.assign({}, Button.default, opts));
  }

  async draw() {
    return super.draw(`[${this.text}]`);
  }
}

/**
 * ...
 */
export class ButtonGroup extends ItemComponent {
  static default = {
    spacing: 1,
  };

  constructor(name, opts = {}) {
    super(name, Object.assign({}, ButtonGroup.default, opts));
  }

  add(text, opts = {}) {
    const { items, row, column } = this;
    const last = items.at(-1);
    opts.row = row;
    opts.column = last ? last.column + last.width + this.spacing : column;
    const item = new Button(text, opts);
    items.push(item);
    return item;
  }

  reset() {
    const original = this.items;
    this.items = [];
    const { row, column, items } = this;
    for (const item of original) {
      const last = items.at(-1);
      item.row = row;
      item.column = last ? last.column + last.width + this.spacing : column;
      items.push(item);
    }
  }
}
