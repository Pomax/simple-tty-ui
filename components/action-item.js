import { Text } from "./text.js";

export class ActionItem extends Text {
  static default = {};

  constructor(opts = {}) {
    super(Object.assign({}, ActionItem.default, opts));
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
    content ??= ` ◇  ${this.text ?? this.label}`;
    return super.draw(content);
  }
}
