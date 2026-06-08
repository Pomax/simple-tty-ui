import { Screen } from "../managers/screen.js";
import { Component } from "./component.js";

export class SelectableItem extends Component {
  static default = {
    label: `missing label`,
  };

  constructor(opts = SelectableItem.default) {
    super(Object.assign({}, SelectableItem.default, opts));
  }

  async toggle() {
    // rather than a toggle, this is a "okay do the thing"
    this.onClick?.(this.label, this.checked);
    return this.draw();
  }

  async draw(content) {
    content ??= `- ${this.label}`;
    return super.draw(content);
  }
}
