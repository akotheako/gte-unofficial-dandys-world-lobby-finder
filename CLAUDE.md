# dwlobby

The whole frontend is `client/main.tsx`, and the whole page is one component inside its `render`
call. `server/main.ts` is the wiring file for the backend. Each backend feature lives in its own
module next to it, such as `server/roblox.ts`, and `server/main.ts` mounts it. Code that both the
frontend and the backend can use goes in `shared/`.
`README.md` explains how to run the project and how to recreate it from zero.

## Claude rules

- Don't use python or a Node script or anything weird to make edits to files, just use your Edit Tool.

## Coding rules

- No abstraction for its own sake. Do not wrap things in helpers, classes or new names when the
  plain code works.
- Lay the code out in chronological order whenever possible. Define something exactly where it is
  used, instead of defining it first and using it later. Anything with a single place of use,
  including types, functions, constants and React components, is written directly at that place
  instead of being given a name.
  - React components need one adjustment. The whole page is a single component, written inline in
    the `render` call with `createElement(() => { ... })`, because JSX cannot use an inline function
    as a tag. All state lives at the top of that component, so that every feature can use every
    other feature's data, and new state is added there as it is needed. The `render` call runs only
    once, so the component is created once and never remounts. Never create a component inside
    another component, because that one is created again on every render, and React then remounts
    it and loses its state. A piece of UI that is used in more than one place becomes a component
    defined at the top level of the file, above the `render` call, and styles that such places
    share go in classes instead of ids.
- Only export what another file actually imports, or what makes up a module's API even when nothing
  imports it yet. Everything else stays private to its file. Config files keep the default export
  that their tool imports.
- Keep comments minimal. Only add a comment when the code does not explain itself.
- In frontend code, a comment describes what an element looks like on the page, such as "Grey ×
  button that closes the window", so that a reader can match the code to the screen. It starts
  with the thing itself, without a leading "A" or "An". The comment sits directly above the element
  or component that it describes, or above that element's `<style>` block when it has one. A
  component gets a comment that sums up what it shows, and each element that it returns gets its
  own comment as well.
- Style elements with a `<style>` block placed directly above the element, and link the two with an
  `id`. Do not use React's `style` prop, so that all styling reads the same way and can use
  pseudo-classes such as `:hover` and `:active`.
- Keep lines short, at 100 characters or fewer, not counting the indentation. Break long lines across
  several lines. Any object with more than one property always gets one property per line, even
  when it would fit on one line. This applies to calls, object literals, destructuring, type
  literals, and JSX attributes.
- Write multiline text, such as a prompt, as a single template literal with real line breaks,
  instead of joining quoted strings with `+`. Break a line only where the text itself has a line
  break, even when that makes the line longer than 100 characters.
- When a function takes more than one parameter, it takes a single object with named properties
  instead of positional arguments, so that every call shows what each value means. Callbacks whose
  shape a library decides, such as Hono handlers, are exempt.
- Indent with tabs, which display as 4 columns, as `.editorconfig` declares. Markdown files are the
  exception and use spaces, because list nesting in Markdown depends on exact indentation.
- Leave out semicolons wherever the code allows it. Every multiline list, object, call and
  parameter list ends with a trailing comma, except in JSON files, which do not allow one.

`npm run lint` enforces the line length, the one-property-per-line layout, tabs, semicolons, and
trailing commas, and `npx eslint . --fix` fixes most of them automatically. The other rules are
judgement calls.
