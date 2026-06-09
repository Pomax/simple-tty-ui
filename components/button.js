import { ActionItem } from "./action-item.js";

export class Button extends ActionItem {
  get width() {
    return super.width + 2;
  }

  async draw() {
    return super.draw(`[${this.text}]`);
  }
}
