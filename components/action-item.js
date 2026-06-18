import { Text } from "./text.js";

export class ActionItem extends Text {
  static default = {};

  constructor(text, opts = {}) {
    super(text, Object.assign({}, ActionItem.default, opts));
  }

  get width() {
    return 4 + super.width;
  }

  async select() {
    await this.highlight();
  }

  async unselect() {
    await this.unhighlight();
  }

  toggle() {
    this.onClick?.(this.text);
  }

  async draw(content) {
    content ??= ` ◇  ${this.text}`;
    return super.draw(content);
  }
}
