import { CheckboxItem } from "./checkbox-item.js";

export class FilterItem extends CheckboxItem {
  static default = (() => {
    const d = CheckboxItem.default;
    d.checked = undefined;
    return d;
  })();

  constructor(opts = {}) {
    super(Object.assign({}, FilterItem.default, opts));
  }

  async toggle() {
    this.checked =
      this.checked === true ? false : this.checked === false ? undefined : true;
    this.onClick?.(this.label, this.checked);
    return this.draw();
  }

  async draw() {
    const { checked, label } = this;
    const content = `[${checked === true ? `+` : checked === false ? `-` : ` `}] ${label}`;
    return super.draw(content);
  }
}
