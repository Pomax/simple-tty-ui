import { Component } from "./component.js";
import { Screen } from "../managers/screen.js";
import { Colors } from "../managers/color.js";
import { exit, write } from "../tty.js";
import { log } from "../file-writer.js";

export class Page extends Component {
  static default = {};

  items = [];

  constructor(opts = {}) {
    super(Object.assign({}, Page.default, opts));
    const { padding } = Screen;
    this.row = 1 + padding;
    this.column = 1 + padding;
  }

  get width() {
    return Screen.innerWidth;
  }

  get height() {
    const { items } = this;
    if (!items.length) return 0;
    return items.length - 1 + items.reduce((t, e) => t + e.height, 0);
  }

  async toggle() {
    await this.selected?.toggle?.();
  }

  async select(startAtEnd = false) {
    const { items } = this;
    if (!items.length) return;
    if (startAtEnd) items.reverse();
    const selected = items.find((e) => e.select);
    if (startAtEnd) items.reverse();
    this.selected = selected;
    await this.selected?.select?.();
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

  add(item) {
    const { items } = this;
    item.row = this.row + this.height + (items.length ? 1 : 0);
    item.column = this.column;
    items.push(item);
    return item;
  }

  async draw() {
    const { padding, width, height } = Screen;
    const { items } = this;

    if (padding > 0) {
      await this.drawBorder(height, width);
    }

    for (const item of items) {
      await item.draw();
    }
  }

  async drawBorder(rows, columns) {
    Colors.standard();

    const topLine = `╔${`═`.repeat(columns - 2)}╗`;
    await Screen.setCursor(1, 1);
    write(topLine);

    for (let i = 2; i < rows; i++) {
      await Screen.setCursor(i, 1);
      write(`║`);
      await Screen.setCursor(i, columns);
      write(`║`);
    }

    const bottomLine = `╚${`═`.repeat(columns - 2)}╝`;
    await Screen.setCursor(rows, 1);
    write(bottomLine);
  }

  async reflow() {
    return;

    // Try to fit the content based on positioning constraints

    //    Colors.restore();
    //    Screen.restore();
    //    console.clear();
    //    console.log(`resizing...`);

    const { rows, padding, innerHeight } = Screen;
    const { resizable, fixed } = getRegions(this);
    const { row, height } = this;
    const lastRow = row + height;

    // do we need to reflow this content?
    if (lastRow + padding > innerHeight) {
      let available = innerHeightÏ - fixed;
      log(
        `There are ${available} rows for reflow over ${resizable} components`,
      );
      let top = this.row;
      for (const r of this.items) {
        r.row = top;
        available = await r.reflow(available, resizable);
        top = r.lastRow + 2;
      }
    }
  }
}

function getRegions(page) {
  const info = {
    fixed: 0,
    height: 0,
    resizable: 0,
  };
  for (const i of page.items) {
    if (i.resize) {
      info.resizable++;
    } else {
      info.fixed += i.height;
    }
    info.height += i.height;
  }
  return info;
}
