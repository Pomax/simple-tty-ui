import { Screen } from "../managers/screen.js";
import { Component } from "./base-component.js";

export class CheckboxItem extends Component {
  static default = {
    label: `missing label`,
    checked: false,
  };

  constructor(opts = CheckboxItem.default) {
    super(Object.assign({}, CheckboxItem.default, opts));
  }

  toggle() {
    this.checked = !this.checked;
    this.draw();
  }

  async draw(content) {
    const { checked, label } = this;
    content ??= `[${checked ? `x` : ` `}] ${label}`;
    super.draw(content);
  }
}
