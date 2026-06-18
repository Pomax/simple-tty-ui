import { Component } from "./component.js";
import { Screen } from "../managers/screen.js";
import { write } from "../tty.js";

const { max } = Math;

function cleanText(opts) {
  if (!opts.text) return;
  opts.text = opts.text.replaceAll(`\n`, ` `).replace(/\s+/g, ` `).trim();
}

export class Text extends Component {
  static default = {};

  constructor(text, opts = {}) {
    opts.text = text;
    cleanText(opts);
    super(Object.assign({}, Text.default, opts));
  }

  get width() {
    return max(...this.text.split(`\n`).map((s) => s.length));
  }

  get height() {
    return 1 + (this.text?.match(/\n/g)?.length ?? 0);
  }

  async reflow() {
    const { innerWidth } = Screen;
    cleanText(this);
    let { text } = this;
    if (text.length <= innerWidth) return;
    let lines = 1;
    for (let i = innerWidth; i < text.length; i += innerWidth) {
      i = text.lastIndexOf(` `, i);
      text = text.slice(0, i) + `\n` + text.slice(i + 1);
      lines++;
    }
    this.text = text;
    this.height = lines;
  }

  async draw(content) {
    return super.draw(content ?? this.text);
  }
}
