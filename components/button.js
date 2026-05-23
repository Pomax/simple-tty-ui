import { Text } from "./text.js";

export class Button extends Text {
  static default = {};

  constructor(opts = {}) {
    super(Object.assign({}, Text.default, opts));
  }

  async select() {
    await this.highlight();
  }

  async unselect() {
    await this.unhighlight();
  }

  toggle() {
    this.onClick?.();
  }

  async draw() {
    return super.draw(`[${this.text}]`);
  }
}
