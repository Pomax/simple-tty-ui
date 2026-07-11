# A Simple TTY UI library

For when you just need a simple terminal-based UI frontend for Node.js code.

## How to install this

Not everything needs a `package.json` file, so just [download it](https://github.com/Pomax/simple-tty-ui/archive/refs/heads/main.zip) and unpack. And as a bonus, there's no auto-update mechanism to change what you downloaded into something else that logs your passwords and runs crypto mining on your GPU.

Of course, if if you insist on using NPM (which is fair enough, no shade) simply tell npm to install from github using `npm install https://github.com/Pomax/simple-tty-ui`, though I'd recommend having a look at what the current master commit hash is first, and then pinning it to that instead of course. Again: why would you want to auto-version-update something as simple as this?

## How to use this

### Creating pages

This UI library (lol) models your front end as one or more `Page`s, which consist of either:

1. `Text` elements, which are plain inert text that auto-wrap based on terminal width.
1. `Button` elements, which can be selected and "do something" when the user presses space or enter.

For convenience, there are a bunch of different ways to present buttons to the user:

1. There's the `ButtonGroup` for putting multiple buttons on the same line, and
1. there are three types of lists for presenting rows of list items:
   1. `ButtonList` gives you a list with unary actions: toggle them, do a thing,
   1. `CheckboxList` gives you the standard binary action: toggle them and then do something with either a true or false state, and
   1. `FilterList` gives you the standard ternary action: toggle them and do something with true, false, or undefined as state.

That last one is particularly useful for UI that presents the user with overlapping options (e.g. "select all things matching X but not Y").

Finally, there is the `InputField` for getting text input from the user.

### Reading out UI state

There are two ways of monitoring UI state:

1. All buttons trigger an `onToggle(button)` when toggled, which lets you do something the moment the user changes your UI state. The `button` argument will have a `.text` property as well as a `.checked` property that can be either `undefined` (button and filter), `true` (checkbox and filter), or `false` (checkbox and filter).
2. `Page` instances have a `.values` property, which gives you a full state representation in the page's user-definable UI elements as an array of standard JS objects with a `name` and either `values` or `value` property. If it's `values` this is an array of `name`/`value` properties (e.g lists), and if it's `value` it's a direct value (e.g. an `InputField`).

### Writing a set of menu pages

- define a draw function
  - clear the screen (probably?)
  - on first draw:
    - define your colors
    - create your pages
  - on redraws
    - redraw the current page

### An example

Run the `demo.js` file and then read through it to see how it does that stuff.

## Components and their API

### `Page`

Models a single page in your menu system. Define as many as you want, and use `Page.load(somePageName)` to activate that page.

```js
import { Components } from "simple-tty-ui";
const { Page } = Components;
const page = new Page(`page name`);
Page.load(`page name`);
```

#### constructor

- `new Page(name, options?)`

While you can specify them, pages do not currently use additional options.

#### properties

- `.values` the current page state as structured object. Each item the either has a value, or contains a bunch of values, has the form `{ name: ..., value: ...}` for direct value elements, or `{name: ... values: ...}` for lists, where `values` is an array of `name`/`value` objects.

#### methods

- `.add(item)` add an item to this page. returns the added item for convenience.

#### static methods

- `.load(pageName)` loads a page as active page, by name.

### Text

It's a text element. You use it to show text . It'll automatically wrap if there is more text than fits in the width of your terminal.

```js
import { Components } from "simple-tty-ui";
const { Page, Text } = Components;
const page = new Page(`page name`);
page.add(new Text(`some text`));
Page.load(`page name`);
```

#### constructor

- `new Text(text)`

That's it, it's a text element. It shows text. It'll auto-wrap if it has to. You don't get to control that behaviour.

### InputField

A variation of the text element: this shows a text label plus an input field for the user to type in if the element is highlighted.

```js
import { Components } from "simple-tty-ui";
const { Page, InputField } = Components;
const page = new Page(`page name`);
page.add(new InputField(`some text`));
Page.load(`page name`);
```

#### constructor

- `new InputField(name, onToggle?, options?)`
  - `name` required string
  - `onToggle` an optional function of the form `(inputField) => { ... }` that triggers when the user hits "enter" while using the field, or navigates away from it after changing the value.
  - `options` an optional object with additional construction properties.

Valid `options` properties are:

- `minWidth`, a number representing the minimal width of the input "field" in characters. Zero by default.
- `emptyChar`, a character that is used to "take up empty space". This is a space by default.
- `onToggle`, the same as the constructor argument, but lets you bypass specifying it as separate constructor argument if you're going to pass additional options.

#### propeties

- `.values` returns an object `{ name:..., value:...}` with the input field name and the current value as obvious content.

### Button

Like plain text, except it can do something!

```js
import { Components } from "simple-tty-ui";
const { Page, Button } = Components;
const page = new Page("page name");
page.add(
  new Button("some text", {
    onToggle: () => doSomething(),
  }),
);
```

This will render as `[some text]` on the screen to make it obvious that it's a button.

#### constructor

- `new Button(text, onToggle?, options?)`.
  - `text` required string
  - `onToggle` an optional function of the form `(button) => { ... }` that triggers when the user hits "enter" or "space" with the button selected.
  - `options` an optional object with additional construction properties.

Additional properties are:

- `padding`, the number of spaces to put between the "button decoration" and the buttoner text. This is 0 by default.
- `onToggle`, the same as the constructor argument, but lets you bypass specifying it as separate constructor argument if you're going to pass additional options.

### ButtonGroup

A convenient way to group multiple buttons on the same line, rather than as distinct page elements.

```js
import { Components } from "simple-tty-ui";
const { Page, ButtonGroup } = Components;
const page = new Page("page name");
const buttons = page.add(new ButtonGroup());
buttons.add("some text", {
  onToggle: () => doSomething(),
});
buttons.add("other text", {
  onToggle: () => doSomethingElse(),
});
```

#### constructor

- `new ButtonGroup(name)`

#### methods

- `.add(text, onToggle?, options?)` calls `new Button(text, onToggle, options)` and adds it to the group.

### ButtonList

It's a button group, except as a list! Each button takes up its own row but without the spacing that you'd get if you added each button as its own on-page element.

```js
import { Components } from "simple-tty-ui";
const { Page, ButtonList } = Components;
const page = new Page("page name");
const actions = page.add(new ButtonList("list name here"));
actions.add(`Do a thing`, {
  onToggle: (name) => doAThing(name),
});
actions.add(`Do another thing`, {
  onToggle: (name) => doAnotherThing(name),
});
```

#### constructor

- `new ButtonList(name, options?)`
  - `name` required name
  - `options` an optional object with additional construction properties.

Additional properties are:

- `resize`, whether or not to automatically resize this list to fit the terminal. This defaults to `true` but some list UI should not be broken up, in which case you can explicitly pass `resize: false`.

#### methods

- `.add(text, onToggle?, options?)` calls `new Button(text, onToggle, options)` and adds it to the list.

### CheckboxList

It's a list of items that you can toggle! These can be either "true" or "false".

```js
import { Components } from "simple-tty-ui";
const { Page, CheckboxList } = Components;
const page = new Page("page name");
const options = page.add(new CheckboxList("list name here"));
function handleOption(name, value) { ... }
options.add(`Do a thing`, { checked: true, onToggle: handleOption });
options.add(`Do another thing`, { onToggle: handleOption });
```

#### constructor

- `new CheckboxList(name, options?)`
  - `name` required name
  - `options` an optional object with additional construction properties.

Additional properties are:

- `resize`, whether or not to automatically resize this list to fit the terminal. This defaults to `true` but some list UI should not be broken up, in which case you can explicitly pass `resize: false`.

#### properties

- `.values` returns an object of the form `{ name: ..., values: [...] }` where each item in the `values` array is a `{ name: ..., value: ... }` corresponding to each item's name and `true`/`false` state.

#### methods

- `.add(text, onToggle?, options?)` calls `new CheckboxItem(text, onToggle, options)` and adds it to the list.

The options may contain:

- `checked` a boolean to prespecify this item's `true` or `false` state, defaulting to `false`.
- `onToggle`, the same as the regular argument, but lets you bypass specifying it as separate function argument if you're going to pass additional options.

### FilterList

A list of filter options, e.g. tristate "true", "false", and "undefined" items. Useful for when you need both positive _and_ negative signals.

```js
import { Components } from "simple-tty-ui";
const { Page, FilterList } = Components;
const page = new Page("page name");
const options = page.add(new FilterList("list name here"));
function updateContent(name, value) { ... }
options.add(`Some tag`, { checked: true, onToggle: updateContent });
options.add(`Some other tag`, { checked: false, onToggle: updateContent });
options.add(`And a third one`, { onToggle: updateContent });
```

Filter items behave the same as checkbox items, except their `checked` property has three possible values, `true` for positive, `false` for negative, and `undefined ` (the default) to indicate "unspecified".

<!--
### Doing Color Stuff

Colors are handled via the `Colors` object.

```js
import { Colors } from "simple-tty-ui";
```

This object has `setColors(fb, bg)`, `setColor(fg)` and `setBackground(bg)` functions for setting a new color before writing text to the terminal, but what those functions do and the format for the foreground and background colors depend entirely on what color depth the terminal uses, which can be checked using `Colors.bits`. This will either be 3, 4, 8, or 24.

#### 3 bit color

the classic 8 color palette.

| value | color    |
| ----- | -------- |
| 0     | Black    |
| 1     | Red      |
| 2     | Green    |
| 3     | Brown    |
| 4     | Blue     |
| 5     | Purple   |
| 6     | Teal     |
| 7     | Whiteish |

#### 4 bit color

The classic 8 colors, now with a bright/bold/light version!

| value | color   |
| ----- | ------- |
| 8     | Grey    |
| 9     | Red     |
| 10    | Green   |
| 11    | Yellow  |
| 12    | Blue    |
| 13    | Magenta |
| 14    | Cyan    |
| 15    | White   |

You can either use the color code you want, or you can use the lower codes only with a boolean to trigger whether to add 8 or not:

- `setColors(fg, bg, fgBrightOrNot, bgBrightOrNot)`
- `setColor(fg, brightOrNot)`
- `setBackground(bg, brightOrNot)`

#### 8 bit color

A delightfully insane combo-mode that allows for either 4 bit color, an RGB value in a 5x5x5 color cube, or one of 24 levels of grey.

For 4 bit color behaviour, simply call the color functions in the same way as for 4 bit color.

For grayscale, call them with array inputs with gray level 0-23 as first value, and `true` as second value.

For "RGB" colors, call them with [r,g,b] arrays. This will use _the nearest cube LUT_ color, which will look approximately like what you thought you were asking for, but will almost certainly not be the _exact_ color you asked for.

#### 24 bit color

For exact colors, only 24 bit color terminals will do what you want. You call the functions with [r,g,b] array inputs.

-->

## This library is still 0.x

It works, it does what I need, but there's still a bunch of code that's "more work than it should be" if you just need some menu pages so the API and default behaviour is still likely to change until I lock this as a v1 and walk away from it because "it just does what it needs to do and will never need to do more than that".

## What's with the node warning?

Update to Node 26 or later and you won't get it anymore. You can suppress it on older versions of Node by using `node --no-warnings blah.js`.

## How come I can't do [...]??

File an issue because obviously _I_ don't need that, but if I can see the use-case for it I have no problems adding it so that _you_ can use it.

## Contact

If you find bugs or have ideas, hit up the issue tracker. For everything else, feel free to contact me [on Mastodon](https://mastodon.social/@TheRealPomax).
