import { Screen } from "../managers/screen.js";
import { Text } from "./text.js";

const { max } = Math;

export class InputField extends Text {
  static default = {
    userInput: ``,
    minWidth: 0,
    emptyChar: ` `,
  };

  cursor = 0;
  #updated = false;

  constructor(text, onToggle, opts = {}) {
    if (typeof onToggle === `object`) {
      opts = onToggle;
    } else {
      opts.onToggle ??= onToggle;
    }
    super(text, Object.assign({}, InputField.default, opts));
  }

  get width() {
    return 2 + super.width + 4 + this.userInput;
  }

  get values() {
    const { text, userInput } = this;
    return {
      name: text,
      value: userInput,
    };
  }

  async select() {
    this.highlight();
  }

  async unselect() {
    this.unhighlight();
  }

  async unhighlight() {
    await this.toggle();
    return super.unhighlight();
  }

  async toggle() {
    if (this.#updated) {
      this.onToggle?.(this);
      this.#updated = false;
    }
  }

  async handleKey(str, key) {
    const { cursor, userInput } = this;
    const original = `${userInput}`;

    if (key.name === `return`) {
      return this.toggle();
    } else if (key.name === `backspace`) {
      if (cursor > 0) {
        this.userInput =
          userInput.slice(0, cursor - 1) + userInput.slice(cursor);
        this.cursor--;
      }
    } else if (key.name === `delete` && cursor < userInput.length) {
      this.userInput = userInput.slice(0, cursor) + userInput.slice(cursor + 1);
    } else if (str) {
      this.userInput += str;
      this.cursor += str.length;
    }

    if (this.userInput !== original) {
      this.#updated = true;
      // This is a silly hack to prevent Node's async paste-as-individual-letters
      // handling from clobbering the redraw.
      if (this.__timeout) clearTimeout(this.__timeout);
      this.__timeout = setTimeout(() => this.draw(), 10);
    }
  }

  async draw() {
    let content = this.userInput;
    if (content.length < this.minWidth) {
      content += this.emptyChar.repeat(this.minWidth - this.userInput.length);
    }
    content = `  ${this.text}: [${content}]`;
    let padding = Screen.innerWidth - content.length;
    content += ` `.repeat(padding);
    return super.draw(content);
  }
}
