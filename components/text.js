import { Component } from "./component.js";
import { write } from "../tty.js";

export class Text extends Component {
  static default = {};

  constructor(opts = {}) {
    super(Object.assign({}, Text.default, opts));
  }

  async draw(content) {
    return super.draw(content ?? this.text);
  }
}
