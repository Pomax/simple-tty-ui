import { Screen } from "../managers/screen.js";
import { ActionItem } from "./action-item.js";

export class CheckboxItem extends ActionItem {
  static default = {
    label: `missing label`,
    checked: false,
  };

  constructor(opts = CheckboxItem.default) {
    super(Object.assign({}, CheckboxItem.default, opts));
  }

  get width() {
    return this.label.length + 4;
  }

  get height() {
    return 1;
  }

  async toggle() {
    this.checked = !this.checked;
    this.onClick?.(this.label, this.checked);
    return this.draw();
  }

  async draw(content) {
    const { checked, label } = this;
    content ??= `[${checked ? `x` : ` `}] ${label}`;
    return super.draw(content);
  }
}
