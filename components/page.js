import { Component } from "./component.js";

export class Page extends Component {
  static default = {};

  items = [];

  constructor(opts = {}) {
    super(Object.assign({}, Page.default, opts));
  }

  get lastRow() {
    return this.items.at(-1).lastRow ?? this.row;
  }

  async toggle() {
    await this.selected?.toggle?.();
  }

  async select(startAtEnd = false) {
    const { items } = this;
    if (!items.length) return;
    this.selected = items.at(startAtEnd ? -1 : 0);
    await this.selected.select();
    await this.draw();
  }

  async unselect() {
    if (this.selected) {
      await this.selected.unselect();
      this.selected = undefined;
    }
  }

  async next() {
    const { items, selected } = this;
    await selected?.unhighlight();
    const result = await this.selected?.next?.();
    if (!result) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at((idx + 1) % items.length);
      if (this.selected?.select) {
        this.selected.select();
      } else {
        this.next();
      }
    }
  }

  async previous() {
    const { items, selected } = this;
    await selected?.unhighlight();
    const result = await this.selected?.previous?.();
    if (!result) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at(idx - 1);
      if (this.selected?.select) {
        this.selected?.select(true);
      } else {
        this.previous();
      }
    }
  }

  add(item, row = 0, column = 0) {
    const { items } = this;
    item.row = row;
    item.column = column;
    items.push(item);
  }

  async draw() {
    for (const item of this.items) {
      await item.draw();
    }
  }
}
