import util from "node:util";
import { Components } from "./components/index.js";
import { Colors } from "./managers/color.js";
import { Screen } from "./managers/screen.js";
import { exit, write, log, setup, stdout } from "./tty.js";
import { log as logToFile } from "./file-writer.js";

Screen.setPadding(1);

const colors = {
  default: [
    [255, 255, 240],
    [20, 120, 55],
  ],
  sfw: [
    [255, 255, 240],
    [20, 55, 120],
  ],
  nsfw: [
    [255, 255, 240],
    [120, 55, 55],
  ],
};

let currentPage;

/**
 * Even though we don't want users to be able to
 * type in the TTY in the traditional sense, we do
 * want to know what keys they're pressing in order
 * to navigate our pages.
 */
function handleKey(str, key) {
  if (key.name === `return` || key.name === `space`) {
    currentPage?.toggle?.();
  }

  if (key.name === `up`) {
    currentPage?.previous?.();
  }

  if (key.name === `down`) {
    currentPage?.next?.();
  }

  if (str === `q`) {
    exit();
  }
}

/**
 * Create our first (and currently only) page!
 */
function createFirstPage() {
  const page = new Components.page("main page");

  const { bits } = Colors;
  const { rows, columns, innerWidth, innerHeight } = Screen;

  page.add(
    new Components.text({
      text: `
        Test Application (dims = ${columns} x ${rows}, innder dims = ${innerWidth} x ${innerHeight}, ${bits} bit color).
        Press 'q' or 'esc' to exit.
      `,
    }),
  );

  const selection = page.add(
    new Components.list(Components.filterItem, {
      label: `filters`,
      resize: true,
    }),
  );

  const test = 1;
  for (let i = 0; i < test; i++) {
    selection.add({ label: `Let's try this.`, checked: true });
    selection.add({ label: `Does this work?`, checked: false });
    selection.add({ label: `How about this?` });
    selection.add({ label: `And this one?` });
  }

  page.add(
    new Components.text({
      text: `This is a paragraph of text, followed by a checklist:`,
    }),
  );

  const checks = page.add(
    new Components.list(Components.checkboxItem, {
      label: `checks`,
      resize: true,
    }),
  );

  for (let i = 0; i < test; i++) {
    checks.add({ label: `Yes or no?`, checked: true });
    checks.add({ label: `What about maybe?` });
    checks.add({ label: `Are you sure?`, checked: true });
    checks.add({ label: `No really?` });
  }

  page.add(
    new Components.text({
      text: `Then another paragraph of text, followed by a list of possible actions:`,
    }),
  );

  const options = page.add(
    new Components.list(Components.actionItem, {
      label: `options`,
      resize: true,
    }),
  );

  async function setColorProfile(profile) {
    await Colors.setColors(...profile);
    await Screen.clear();
    await currentPage.draw();
  }

  options.add({
    label: `Default coloring`,
    onClick: () => setColorProfile(colors.default),
  });
  options.add({
    label: `Safe for work coloring`,
    onClick: () => setColorProfile(colors.sfw),
  });
  options.add({
    label: `Not safe for work coloring`,
    onClick: () => setColorProfile(colors.nsfw),
  });

  page.add(
    new Components.text({
      text: `And another paragraph of text, followed by an explicit "exit" button:`,
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
async function draw(redraw = true) {
  if (!redraw) {
    await Colors.setColors(...colors.default);
  }

  await Screen.clear();

  // create a a page
  const page = createFirstPage();

  // set our "current" page to that
  currentPage = page;

  // and then select the first thing on that page.
  await page.reflow();
  await page.select();
  page.draw();
}

// let's start our terminal app
await setup(draw, handleKey);
