import util from "node:util";
import { Components } from "./components/index.js";
import { Colors } from "./managers/color.js";
import { Screen } from "./managers/screen.js";
import { exit, write } from "./tty.js";
import { setup, stdout } from "./tty.js";

let current;

function handleKey(str, key) {
  if (key.name === `return` || key.name === `space`) {
    current?.toggle?.();
  }
  if (key.name === `up`) {
    current?.previous?.();
  }
  if (key.name === `down`) {
    current?.next?.();
  }
  if (str === `q`) {
    exit();
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

  const page = new Components.page();
  current = page;

  const list = new Components.list(Components.filterItem);
  page.add(list, 3, 10);

  list.add({ label: `Let's try this.`, checked: true });
  list.add({ label: `Does this work?`, checked: false });
  list.add({ label: `How about this?` });
  list.add({ label: `And this one?` });

  const paragraph = new Components.text({
    text: `This is a paragraph of text`,
  });
  page.add(paragraph, page.lastRow + 2, page.column);

  const button = new Components.button({
    text: `exit`,
    onClick: () => exit(),
  });
  page.add(button, page.lastRow + 2, page.column);

  await page.select();
}

setup(redraw, handleKey);
