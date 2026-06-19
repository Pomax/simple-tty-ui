import { Text } from "./text.js";

export class ActionItem extends Text {
  static default = {
    widthPadding: 4,
  };

  constructor(text, opts = {}) {
    super(text, Object.assign({}, ActionItem.default, opts));
  }

  get width() {
    return super.width + this.widthPadding;
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
