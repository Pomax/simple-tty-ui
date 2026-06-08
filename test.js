import util from "node:util";
import { Components } from "./components/index.js";
import { Colors } from "./managers/color.js";
import { Screen } from "./managers/screen.js";
import { exit, write, log, setup, stdout } from "./tty.js";

const foreground = [255, 255, 240];
const background = [20, 120, 55];
const border = true;

Screen.border = border;

let current;

/**
 * Even though we don't want users to be able to
 * type in the TTY in the traditional sense, we do
 * want to know what keys they're pressing in order
 * to navigate our pages.
 */
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

/**
 * Create our first (and currently only) page!
 */
function createFirstPage(rows, columns) {
  const page = new Components.page("main page", { border });

  const title = new Components.text({
    text: `Test Application (dims = ${columns} by ${rows}, ${Colors.bits} bit color)`,
  });
  page.add(title);

  const list = page.add(
    new Components.list(Components.filterItem, {
      resize: true,
    }),
  );

  for (let i = 0; i < 10; i++) {
    list.add({ label: `Let's try this.`, checked: true });
    list.add({ label: `Does this work?`, checked: false });
    list.add({ label: `How about this?` });
    list.add({ label: `And this one?` });
  }

  page.add(
    new Components.text({
      text: `This is a paragraph of text`,
    }),
  );

  const options = page.add(
    new Components.list(Components.selectableItem, {
      resize: true,
    }),
  );

  options.add({ label: `Default`, onClick: () => {} });
  options.add({ label: `Safe for work`, onClick: () => {} });
  options.add({ label: `Not safe for work`, onClick: () => {} });

  page.add(
    new Components.text({
      text: `And another paragraph of text`,
    }),
  );

  const button = page.add(
    new Components.button({
      text: `exit`,
      onClick: () => exit(),
    }),
  );

  return page;
}

/**
 * Fully draw our menus. This only gets called sparingly.
 */
async function draw() {
  Colors.setColor(...foreground);
  Colors.setBackground(...background);

  await Screen.clear();
  const { rows, columns } = Screen;

  // create a a page
  const page = createFirstPage(rows, columns);

  // set our "current" page to that
  current = page;

  // and then select the first thing on that page.
  log(`selecting...`);
  await page.select();
  await page.reflow();
}

// let's start our terminal app
await setup(draw, handleKey);
