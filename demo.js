import util from "node:util";
import {
  Components,
  Colors,
  Screen,
  exit,
  revert,
  setup,
  log as ttyLog,
} from "./index.js";
const { ActionList, Button, CheckboxList, FilterList, Page, Text } = Components;

Screen.setPadding(1);

const colors = {
  default: [
    [255, 255, 240],
    [20, 120, 55],
  ],
  safe: [
    [255, 255, 240],
    [20, 55, 120],
  ],
  danger: [
    [255, 255, 240],
    [120, 55, 55],
  ],
};

let menu;

/**
 * Even though we don't want users to be able to
 * type in the TTY in the traditional sense, we do
 * want to know what keys they're pressing in order
 * to navigate our pages.
 */
function handleKey(str, key) {
  if (key.name === `return` || key.name === `space`) {
    menu?.toggle?.();
  } else if (key.name === `up`) {
    menu?.previous?.();
  } else if (key.name === `down`) {
    menu?.next?.();
  } else if (str === `q`) {
    exit();
  }
}

// Helper function to set global colors
async function setColorProfile(profile) {
  await Colors.setColors(...profile);
  await Screen.clear();
  await menu.draw();
}

/**
 * Create our first (and currently only) page!
 */
async function createMenu() {
  menu = new Page("main page");

  // some general information
  const { bits } = Colors;
  const { rows, columns, innerWidth, innerHeight } = Screen;
  menu.add(
    new Text(`
        Test Application (dims = ${columns} x ${rows}, inner dims = ${innerWidth} x ${innerHeight}, ${bits} bit color).
        Press 'q' or 'esc' to exit.
      `),
  );

  // A filter list, with "yes/no/ignore" options:
  const selection = menu.add(new FilterList(`filters`));
  const test = 4;
  for (let i = 0; i < test; i++) {
    selection.add(`Let's try this.`, { checked: true });
    selection.add(`Does this work?`, { checked: false });
    selection.add(`How about this?`);
    selection.add(`And this one?`);
  }

  menu.add(new Text(`This is a paragraph of text, followed by a checklist:`));

  // A checkbox list, with "yes/no" options:
  const checks = menu.add(new CheckboxList(`checks`));
  for (let i = 0; i < test; i++) {
    checks.add(`Yes or no?`, { checked: true });
    checks.add(`What about maybe?`);
    checks.add(`Are you sure?`, { checked: true });
    checks.add(`No really?`);
  }

  menu.add(
    new Text(
      `Then another paragraph of text, followed by a list of possible actions:`,
    ),
  );

  // An action list, where each option "does something"
  const actions = menu.add(new ActionList(`actions`));
  actions.add(`Default coloring`, {
    onClick: () => setColorProfile(colors.default),
  });
  actions.add(`Safe content coloring`, {
    onClick: () => setColorProfile(colors.safe),
  });
  actions.add(`Not so safe coloring`, {
    onClick: () => setColorProfile(colors.danger),
  });

  menu.add(
    new Text(
      `And another paragraph of text, followed by an explicit "exit" button:`,
    ),
  );

  // And a handy little "exit" button.
  const button = menu.add(new Button(`exit`, { onClick: () => exit() }));

  // Then, make sure everythings fits on the screen, and
  // auto-select the first selectable thing in the menu.
  await menu.reflow();
  await menu.select();
}

/**
 * Fully draw our menus. This only gets called sparingly.
 */
async function draw(redraw = true) {
  if (!redraw) await Colors.setColors(...colors.default);
  await Screen.clear();
  await createMenu();
  menu.draw();
}

// let's start our terminal app
await setup(draw, handleKey);
