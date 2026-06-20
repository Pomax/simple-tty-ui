
import { ActionItem } from "./action-item.js";

export class CheckboxItem extends ActionItem {
  static default = {
    text: `missing text`,
    checked: false,
  };

  constructor(text, opts = CheckboxItem.default) {
    super(text, Object.assign({}, CheckboxItem.default, opts));
  }

  async toggle() {
    this.checked = !this.checked;
    this.onClick?.(this.text, this.checked);
    return this.draw();
  }

  async draw(content) {
    const { checked, text } = this;
    content ??= ` [${checked ? `x` : ` `}] ${text}`;
    return super.draw(content);
  }
}
