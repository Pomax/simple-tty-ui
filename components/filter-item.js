import { CheckboxItem } from "./checkbox-item.js";

export class FilterItem extends CheckboxItem {
  static default = (() => {
    const d = CheckboxItem.default;
    d.checked = undefined;
    return d;
  })();

  constructor(text, opts = {}) {
    super(text, Object.assign({}, FilterItem.default, opts));
  }

  async toggle() {
    this.checked =
      this.checked === true ? false : this.checked === false ? undefined : true;
    this.onClick?.(this);
    return this.draw();
  }

  async draw() {
    const { checked, text } = this;
    const content = ` [${checked === true ? `+` : checked === false ? `-` : ` `}] ${text}`;
    return super.draw(content);
  }
}
