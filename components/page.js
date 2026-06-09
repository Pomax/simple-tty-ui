import { Component } from "./component.js";
import { Screen } from "../managers/screen.js";
import { Colors } from "../managers/color.js";
import { write } from "../tty.js";
import { log } from "../file-writer.js";

export class Page extends Component {
  static default = {
    ox: 0,
    oy: 0,
  };

  items = [];

  constructor(opts = {}) {
    super(Object.assign({}, Page.default, opts));
    if (this.border) {
      this.ox = 1;
      this.oy = 1;
    }
  }

  get border() {
    return Screen.border;
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
    if (startAtEnd) items.reserve();
    this.selected = items.find((e) => e.select);
    if (startAtEnd) items.reserve();
    await this.selected?.select?.();
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

  add(item, row = this.items?.at(-1)?.lastRow ?? 0 + 1, column = 1) {
    const { items, ox, oy } = this;
    item.row = row + ox + (items.length ? 1 : 0);
    item.column = column + oy;
    items.push(item);
    return item;
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

  async draw() {
    const { border, rows, columns } = Screen;
    const { items } = this;

    if (border) {
      await this.drawBorder(rows, columns);
    }

    for (const item of items) {
      await item.draw();
    }
  }

  async reflow() {
    // Try to fit the content based on positioning constraints

    //    Colors.restore();
    //    Screen.restore();
    //    console.clear();
    //    console.log(`resizing...`);

    const { rows, border, height } = Screen;
    const { resizable, fixed } = getRegions(this);
    const { lastRow } = this;

    // do we need to reflow this content?
    if (this.lastRow - (border ? 1 : 0) > Screen.height) {
      let available = height - fixed;
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
