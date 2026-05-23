import { Screen } from "../managers/screen.js";
import { Component } from "./component.js";

export class CheckboxItem extends Component {
  static default = {
    label: `missing label`,
    checked: false,
  };

  constructor(opts = CheckboxItem.default) {
    super(Object.assign({}, CheckboxItem.default, opts));
  }

  async toggle() {
    this.checked = !this.checked;
    return this.draw();
  }

  async draw(content) {
    const { checked, label } = this;
    content ??= `[${checked ? `x` : ` `}] ${label}`;
    return super.draw(content);
  }
}
