import util from "node:util";
import { Components } from "./components/index.js";
import { Colors } from "./managers/color.js";
import { Screen } from "./managers/screen.js";
import { write } from "./tty.js";
import { setup, stdout } from "./tty.js";

let current;

function handleKey(str, key) {
  if (str === `\r`) {
    current.toggle();
  }
}

async function redraw() {
  Colors.setColor(255, 255, 240);
  Colors.setBackground(20, 20, 55);

  await Screen.clear();
  const { columns, rows } = Screen;

  write(
    `Test Application (dims = ${columns} by ${rows}, ${Colors.bits} bit color)`,
  );

  current = new Components.filterItem({
    row: 3,
    column: 10,
    label: `Does this work?`,
  });

  current.draw();
}

setup(redraw, handleKey);
