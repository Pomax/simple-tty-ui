import { ActionItem } from "./action-item.js";

export class CheckboxItem extends ActionItem {
  static default = {
    text: `missing text`,
    checked: false,
  };

  constructor(text, opts = CheckboxItem.default) {
    super(text, Object.assign({}, CheckboxItem.default, opts));
  }

  get values() {
    return {
      name: this.text,
      value: this.checked,
    };
  }

  async toggle() {
    this.checked = !this.checked;
    this.onToggle?.(this);
    return this.draw();
  }

  async draw(content) {
    const { checked, text } = this;
    content ??= ` [${checked ? `x` : ` `}] ${text}`;
    return super.draw(content);
  }
}
