# dwlobby

A website with a React frontend and a Hono backend, all in TypeScript.

- The whole frontend lives in `client/main.tsx`. The whole page is one component, written inline in the `render` call with `createElement`, and all of its state sits at the top of that component. UI that appears more than once, such as the `DesktopWindow` icon-and-window pair, is a component defined above the `render` call. The site is a single page at `/`.
- `server/main.ts` wires the backend together, and each backend feature lives in its own module next to it, such as `server/roblox.ts`. Code that both the frontend and the backend can use, such as `shared/genericTypes.ts`, lives in `shared/`, which both `tsconfig.app.json` and `tsconfig.node.json` include. The backend answers the API routes under `/api`, and in production it also serves the built frontend from `dist/`.
- Node 24 runs `server/main.ts` directly, without a build step, because Node can strip TypeScript types on its own. That only works for TypeScript syntax that can be erased, which `tsconfig.node.json` enforces with `erasableSyntaxOnly`.
- Users verify their Roblox account by pasting a code such as "This is my verification code for GTE! 🌈✨🦋🍓🌙💖🐝🍀", made of a fixed sentence and 8 random emojis out of 31, into the About section of their Roblox profile, which only the owner of the account can edit. `server/roblox.ts` and the window in `client/main.tsx` implement this. The server reads the profile through the public `users.roblox.com` API, and once it finds the code, it stores their Roblox user ID and username in a signed cookie that lasts 30 days. Verified users then see a checklist of 14 Dandy's World badges, which the server reads from the public `inventory.roblox.com` API. That only works when the user's Roblox inventory is public. The server stores the badges in the same signed session cookie, so they load instantly afterwards, and an Update Badges button fetches them from Roblox again. There are no other accounts and no database.

## Running it

The server needs a secret for signing its cookies before it starts. Create a `.env` file in the project folder, which git ignores:

```sh
COOKIE_SECRET=any long random string, for example the output of: openssl rand -hex 32
```

During development, `npm run dev` starts both the frontend and the backend, and labels their output `[web]` and `[api]`. Vite serves the frontend on http://localhost:5173 and forwards every `/api` request to the backend on port 3000, which restarts on every change. Stopping either process stops both.

```sh
npm install
npm run dev
```

In production, build the frontend once and then run only the server, which serves both the site and the API on port 3000, or on `PORT` when it is set.

```sh
npm run build   # type-check everything and build the frontend into dist/
npm start
```

On Vercel, which deploys every push to the connected GitHub repo, there is no long-running server. Vercel serves `dist/` itself, and `api/index.ts` hands every `/api` request to the same Hono app as a serverless function. A rewrite in `vercel.json` sends every `/api/...` path to that one function, and `vercel.json` also bundles `public/` into that function, because the images route reads those folders. The `COOKIE_SECRET` goes into the Vercel project's settings, under Environment Variables.

Lint everything with `npm run lint`.

## Recreating the project from zero

These commands were run from an empty `dwlobby` folder in Git Bash, with Node 24.

1. Scaffold the Vite React TypeScript template into the current folder:

   ```sh
   npm create vite@latest . -- --template react-ts --no-interactive
   ```

2. Remove the template files that this project does not use, including the template's Oxlint linter, its React plugin for Vite, and its `preview` script, which would serve the frontend without the API:

   ```sh
   rm -r src/App.tsx src/App.css src/index.css src/assets public/icons.svg README.md .oxlintrc.json
   npm pkg delete devDependencies.oxlint scripts.lint scripts.preview devDependencies.@vitejs/plugin-react
   ```

   Then rename the template's `src` folder to `client`, so that the frontend, the backend in `server/` and the code that both of them use in `shared/` sit side by side:

   ```sh
   mv src client
   sed -i 's#/src/main.tsx#/client/main.tsx#' index.html
   sed -i 's#"include": \["src"\]#"include": ["client", "shared"]#' tsconfig.app.json
   ```

   Then delete the `react` import and the `plugins: [react()]` line from `vite.config.ts`. The plugin's only benefit is hot reload that keeps component state, and that cannot work for components in a file with no exports. Vite compiles JSX on its own, using the `"jsx": "react-jsx"` setting in `tsconfig.app.json`.

3. Install the template's remaining dependencies:

   ```sh
   npm install
   ```

4. Add ESLint:

   ```sh
   npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks globals @stylistic/eslint-plugin
   npm pkg set scripts.lint="eslint ."
   ```

   Then write `eslint.config.js` by hand, because `npm init @eslint/config` only runs as an interactive questionnaire. The config does the following for every `.js`, `.ts`, and `.tsx` file:

   - It enables the recommended rules from `@eslint/js`, `typescript-eslint`, and `eslint-plugin-react-hooks`.
   - It enables the formatting rules from `@stylistic/eslint-plugin` that enforce the layout in `CLAUDE.md`: tabs, no semicolons, trailing commas on multiline code, lines of 100 characters or fewer after the indentation (`tabWidth: 0` makes the rule count tabs as zero), and one property per line for objects, destructuring, type literals, and JSX attributes that have more than one property.
   - It leaves out `eslint-plugin-react-refresh`, because that plugin reports an error for every component in a file that has no exports, and `client/main.tsx` is deliberately that kind of file.

5. Switch the template's config files from spaces to tabs, and declare the tab width in `.editorconfig`, so that editors and GitHub display each tab as 4 columns:

   ```sh
   for f in package.json tsconfig.json tsconfig.app.json tsconfig.node.json index.html vite.config.ts; do
     sed -i -E ':a;s/^(\t*)  /\1\t/;ta' "$f"
   done
   printf 'root = true\n\n[*]\nindent_style = tab\nindent_size = 4\ntab_width = 4\nend_of_line = lf\ninsert_final_newline = true\n\n[*.md]\nindent_style = space\nindent_size = 3\n' > .editorconfig
   ```

   The `npm pkg` commands keep whatever indentation `package.json` already has, so later steps keep the tabs.

6. Add Hono for the backend:

   ```sh
   npm install hono @hono/node-server
   npm install -D concurrently
   npm pkg set scripts.dev='concurrently -k -n web,api "vite" "node --env-file-if-exists=.env --watch server/main.ts"' scripts.start="node --env-file-if-exists=.env server/main.ts"
   printf '\n.env\n' >> .gitignore
   ```

   The `--env-file-if-exists` flag makes Node load the settings from `.env` when that file exists, and the `.gitignore` line keeps the secrets out of git.

   Then make these three edits by hand:

   - Write the server into `server/main.ts`: an exported Hono `app`, a `serveStatic` handler for `dist/`, and the call to `serve` on port 3000, which is skipped when the `VERCEL` environment variable is set. Write `api/index.ts`, which only re-exports that `app` as its default export, and `api/tsconfig.json`, which sets `rewriteRelativeImportExtensions`, because Vercel compiles each `.ts` file into a `.js` file and the `.ts` imports would otherwise point at files that do not exist there. Also write `vercel.json`, which sets the framework to `vite`, adds `public/**` to that function's `includeFiles`, and rewrites `/api/(.*)` to `/api`. Write the Roblox `code`, `check`, `me`, `badges` and `logout` routes into `server/roblox.ts`, and mount them under `/api/roblox` in `server/main.ts`. Write a route into `server/images.ts` that lists the `.png` files in `public/toons` or `public/trinkets`, and mount it under `/api/images`.
   - Add `"server"` and `"shared"` to the `include` list in `tsconfig.node.json`, so that `npm run build` type-checks the server and the shared code with the Node settings.
   - Add a `server.proxy` entry to `vite.config.ts` that forwards `/api` to `http://localhost:3000`.

7. Write the frontend into `client/main.tsx`: the `render` call that places each feature on the page. That includes the Roblox verification, which sits in a native `<dialog>` modal that a desktop-style icon in the top-left corner opens. The icon is the `Gossip_Bud.webp` picture from `public/`, which a hidden SVG filter makes blocky and reduces to a few colors, like an old Windows icon, with a "Roblox Verification" label under it, in the style of an old computer desktop. The modal looks like an old grey window, with a navy title bar and an × button that closes it. The window opens with `show()` instead of `showModal()`, so it has no dark backdrop and the rest of the page stays clickable, and opening one window closes any other open window. The window grows out of the icon when it opens and shrinks back into it when it closes, and the icon and the × button react to hovering and clicking. The icon and the window are one `DesktopWindow` component, which a second icon to the right of the first reuses, with the `All_Together.webp` picture, for a "Find a Team" window. Under its "Server link:" field, a "How do I get a server link?" link opens another window on top, which shows `howtomakeprivateserver1.webp` and `howtomakeprivateserver2.webp` from `public/`, and a Find Players button sits on the right. Find Players shows a red message instead of starting when no row has a toon without being reserved, when no reserved row has a toon (the user's own row), when the server link is empty, or when the link does not look like `https://www.roblox.com/share?code=<32 hex characters>&type=Server` with a full-width table, a "Server link:" field and a centered Find Players button. The table has the columns Toon, Trinket A, Trinket B and Reserved, which is a checkbox, and 8 rows. Two smaller windows hang outside it, one with the toons from `public/toons` to the lower left and one with the trinkets from `public/trinkets` to the upper right. They get their file lists from `/api/images/toons` and `/api/images/trinkets`, so a new image only needs to be dropped into its folder. Dragging an image into a matching cell replaces what was there, and the image stays in its side window, so it can be placed again. An image in the table can be dragged to another matching cell, which moves it, or dropped anywhere else, which empties its cell. A row cannot hold the same trinket in both trinket columns, so such a drop does nothing. The toons window starts with an "(Any)" text tile, which drops into Toon cells like an image and shows as text there. Once the user is verified, the table gets a Badges column before Reserved, and a third side window below the trinkets lists the Dandy's World badges that the user owns, by name. Dragging a badge name into a Badges cell adds it to the names stacked in that cell, and it replaces any badge of the same category there. The categories are Speed Walker, Long Distance Runner and Marathon Runner; Machine Enthusiast, Machine Master and THE Machine; Clocked In and Overtime; Hissy Fit; Just Keep Swimming; and Double Digits!, Skilled Toon!, Super Skilled Pro! and Twisteds Fear Me. A badge in the table moves or leaves the table the same way as an image, and badge names get a slightly darker background on hover. Once Find Players starts, its button reads "Finding Players (Click to Cancel)" and cancels when clicked, the table and the server link stop accepting changes, and each row that has a toon and is not reserved shows a smaller, left-aligned "Finding player" with dots that appear one by one in place of its checkbox, while empty rows that are not reserved lose their checkbox. The team and the server link are saved in localStorage, so they survive a reload. Then add `<meta name="color-scheme" content="dark" />` to the `<head>` of `index.html`, which makes the browser draw the page, the buttons and the fields in dark colors. Put the wallpaper image `Gardenview_Rainbow_Print.webp` into `public/`, and give the `<body>` in `index.html` the inline style `margin: 0; min-height: 100vh; background: url(/Gardenview_Rainbow_Print.webp) center / cover fixed`, so that the image covers the whole window like a desktop wallpaper.

8. Write `CLAUDE.md` with the project's coding rules, and write this `README.md`.

9. Fix the formatting of every code file, and then verify that the project lints and builds:

   ```sh
   npx eslint . --fix
   npm run lint
   npm run build
   ```

10. Initialize git and make the first commit. The template's `.gitignore` already excludes `node_modules`, `dist`, logs, and editor files. The `.gitattributes` file makes git keep LF line endings, which matches `.editorconfig`, even on Windows machines that convert to CRLF by default.

    ```sh
    git init -b main
    printf '* text=auto eol=lf\n' > .gitattributes
    git add .
    git commit -m "Initial commit"
    ```
