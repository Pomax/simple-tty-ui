import { Component } from "./component.js";

export class Page extends Component {
  static default = {
    row: 0,
    column: 0,
  };

  items = [];

  constructor(opts = {}) {
    super(Object.assign({}, Page.default, opts));
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
    const { items } = this;
    const result = await this.selected?.next();
    if (result === false) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at((idx + 1) % items.length);
      this.selected?.select();
    }
  }

  async previous() {
    const { items } = this;
    const result = await this.selected?.previous();
    if (result === false) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at(idx - 1);
      this.selected?.select(true);
    }
  }

  add(item) {
    const { items } = this;
    items.push(item);
  }

  async draw() {
    for (const item of this.items) {
      await item.draw();
    }
  }
}
