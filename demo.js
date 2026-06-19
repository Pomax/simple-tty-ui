import util from "node:util";
import { Components, Colors, Screen, exit, setup } from "./index.js";
const { ActionList, ButtonGroup, CheckboxList, FilterList, Page, Text } =
  Components;

// Some colors, for doing a full menu recolor
const colors = {
  default: [`Default coloring`, [255, 255, 240], [20, 120, 55]],
  safe: [`Safe content coloring`, [255, 255, 240], [20, 55, 120]],
  danger: [`Not so safe coloring`, [255, 255, 240], [120, 55, 55]],
};

/**
 * Create our first (and currently only) page!
 */
async function createMenu() {
  const menu = new Page("main page");

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
  Object.values(colors).forEach(([text, ...profile]) => {
    actions.add(text, { onClick: () => setColorProfile(profile) });
  });

  menu.add(
    new Text(
      `And another paragraph of text, followed by a "reset" and "exit" button:`,
    ),
  );

  // And a handy little button group
  const buttons = menu.add(new ButtonGroup(`buttons`));
  buttons.add(`reset`, {
    onClick: async () => await draw(false),
  });
  buttons.add(`exit`, { onClick: () => exit() });

  // Then we return this page
  return menu;
}

/**
 * Helper function to set global colors.
 */
async function setColorProfile(profile) {
  await Colors.setColors(...profile);
  await draw();
}

/**
 * Fully draw our menus. This only gets called sparingly.
 */
async function draw(redraw = true) {
  if (!redraw) {
    // If this is our first draw, set up default colors
    const [text, fg, bg] = colors.default;
    await Colors.setColors(fg, bg);
  }
  await Screen.clear();
  if (!redraw) {
    // And if this is our first draw, create our
    // menu and then select the first selectable.
    Page.current = await createMenu();
    await Page.current.select();
  }
  Page.current.draw();
}

// let's start our terminal app
await setup(draw);
