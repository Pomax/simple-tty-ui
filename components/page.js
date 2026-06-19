import { ItemComponent } from "./component.js";
import { Screen } from "../managers/screen.js";
import { Colors } from "../managers/color.js";
import { write } from "../tty.js";

export class Page extends ItemComponent {
  static default = {};

  static current;

  static async setCurrentPage(page) {
    Page.current = page;
    page.reset();
    await page.reflow();
    await Page.current.select();
  }

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
    const len = items.length;
    if (!len) return 0;
    return len - 1 + items.reduce((t, e) => t + e.height, 0);
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

  async next(skip = false) {
    const { items, selected } = this;
    await selected?.unhighlight();
    const result = await this.selected?.next?.(skip);
    if (!result) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at((idx + 1) % items.length);
      if (this.selected?.select) {
        this.selected.select();
      } else {
        this.next(skip);
      }
    }
  }

  async previous(skip = false) {
    const { items, selected } = this;
    await selected?.unhighlight();
    const result = await this.selected?.previous?.(skip);
    if (!result) {
      const idx = items.indexOf(this.selected);
      this.selected = items.at(idx - 1);
      if (this.selected?.select) {
        this.selected?.select(true);
      } else {
        this.previous(skip);
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

  reset() {
    const original = this.items;
    this.items = [];
    for (const item of original) {
      this.add(item).reset?.();
    }
  }

  async draw() {
    const { padding, width, height } = Screen;
    const { items } = this;

    await this.reflow();

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

  /**
   * Try to fit the content based on positioning constraints
   */
  async reflow() {
    const { padding, innerHeight } = Screen;
    let { resizable, fixed } = getRegions(this);
    const { row, height } = this;
    const lastRow = row + height;

    // do we need to reflow this content?
    if (lastRow >= padding + innerHeight) {
      let available = innerHeight - fixed;
      const enumerated = this.items.map((item, i) => ({ item, i }));
      for (const { item, i } of enumerated) {
        if (!item.resize) continue;
        const reduction = await item.reflow(available, resizable--);
        // update all downstream rows
        this.items.slice(i + 1).forEach((item) => {
          item.move(-reduction);
        });
        // then update the available space
        available -= item.height;
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
