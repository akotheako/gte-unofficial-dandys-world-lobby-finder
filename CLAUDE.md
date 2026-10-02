# dwlobby

`client/main.tsx` is the whole view of the frontend. `client/lobby/useLogic.ts` is the wiring file
for its logic, so reading it tells you everything that the page can do and every value that it can
show. `server/main.ts` is the wiring file for the backend. Each backend feature lives in its own
module next to it, such as `server/roblox.ts`, and `server/main.ts` mounts it. Code that both the
frontend and the backend can use goes in `shared/`.
`README.md` explains how to run the project and how to recreate it from zero.

## Claude rules

- Don't use python or a Node script or anything weird to make edits to files, just use your Edit Tool.
- Commit only when everything is stable: `npm run lint` and `npm run build` pass, and the changed
  feature works when you run it. Even when the user asks for a commit, report anything that is
  still broken first, and fix it or ask before committing.
- Whenever you change the code, update every piece of documentation that the change affects, such
  as `README.md`, this file and code comments, in the same task. The documentation describes only
  what exists now, so leave out anything that has been removed or replaced, and write no negative
  statements about what the code does not do or no longer has. Say each thing once, and before
  adding a sentence, check that the documentation does not already say it somewhere else.

## Coding rules

- No abstraction for its own sake. Do not wrap things in helpers, classes or new names when the
  plain code works.
- Name every variable, function, type and file so that someone who only knows the page, and has
  never seen the code, understands from the name alone what it is for, and cannot confuse it with
  anything else. Build names from the words that the page itself shows, such as "Find a Team",
  "side window" or "(Leave Empty)". Short names such as `event`, `index` or `name` are fine only
  inside a few lines where nothing else could share their meaning.
- Lay the code out in chronological order whenever possible. Define something exactly where it is
  used, instead of defining it first and using it later. Anything with a single place of use,
  including types, functions, constants and React components, is written directly at that place
  instead of being given a name.
  - The frontend logic is the exception. Every reaction of the page, meaning every click, input,
    drag, drop, fetch or timer, gets its own file in `client/lobby/`, and `useLogic` wires it. All
    state lives in `useLogic`.
  - The view only shows the values that `useLogic` returns, as they are, and passes on the
    functions that it returns. Every label, image path and condition is computed in `useLogic`.
  - The whole page is a single component, written inline in the `render` call with
    `createElement(() => { ... })`, because JSX cannot use an inline function as a tag. The `render`
    call runs only once, so the component is created once and never remounts. Never create a
    component inside another component, because that one is created again on every render, and React then remounts
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
