import { Text } from "./text.js";

export class ActionItem extends Text {
  static default = {
    widthPadding: 5,
  };

  constructor(text, opts = {}) {
    super(text, Object.assign({}, ActionItem.default, opts));
  }

  get width() {
    return super.width + this.widthPadding;
  }

  get height() {
    return 1;
  }

  async select() {
    await this.highlight();
  }

  async unselect() {
    await this.unhighlight();
  }

  async toggle() {
    this.onToggle?.(this);
  }

  async draw(content) {
    content ??= `  ◇  ${this.text}`;
    return super.draw(content);
  }
}
