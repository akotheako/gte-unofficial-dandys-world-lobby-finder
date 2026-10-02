# dwlobby

A website with a React frontend and a Hono backend, all in TypeScript.

- The whole view of the frontend lives in `client/main.tsx`. The whole page is one component, written inline in the `render` call with `createElement`, and it only shows the values and calls the functions that `useLogic` returns. Each reaction of the page has its own file in `client/lobby/`, and `client/lobby/useLogic.ts` holds the state and wires the reactions. UI that appears more than once, such as the `DesktopWindow` icon-and-window pair, is a component defined above the `render` call. The site is a single page at `/`.
- `server/main.ts` wires the backend together, and each backend feature lives in its own module next to it, such as `server/roblox.ts`. Code that both the frontend and the backend can use, such as `shared/genericTypes.ts`, lives in `shared/`, which both `tsconfig.app.json` and `tsconfig.node.json` include. The backend answers the API routes under `/api`, and in production it also serves the built frontend from `dist/`.
- Node 24 runs `server/main.ts` directly, without a build step, because Node can strip TypeScript types on its own. That only works for TypeScript syntax that can be erased, which `tsconfig.node.json` enforces with `erasableSyntaxOnly`.
- Users verify their Roblox account by pasting a code such as "This is my verification code for DW Team Finder! 🌈✨🦋🍓🌙💖🐝🍀", made of a fixed sentence and 8 random emojis out of 31, into the About section of their Roblox profile, which only the owner of the account can edit. `server/roblox.ts` and the Roblox reactions in `client/lobby/` implement this. The server reads the profile through the public `users.roblox.com` API, and once it finds the code, it stores their Roblox user ID and username in a signed cookie that lasts 30 days. Verified users then see a checklist of 14 Dandy's World badges, which the server reads from the public `inventory.roblox.com` API. That only works when the user's Roblox inventory is public. The server stores the badges in the same signed session cookie, so they load instantly afterwards, and an Update Badges button fetches them from Roblox again. When that fails, the badges from before stay in view, with a red error line below them. There are no other accounts.
- Every open page checks in with `server/checkIn.ts` under a random page id, every 5 seconds while it takes part in a team and every 15 seconds otherwise, and a change of the search or of the invites checks in again right away. The check-in is the page's only timer. It answers with both counters at the bottom of the screen, and it keeps the page's team in a Postgres database on Neon while the team searches or once its invite link was copied. `server/database.ts` holds the connection, and the check-in creates its tables on its first request. A page counts as gone after 90 seconds without a check-in, because browsers run the timers of hidden tabs only once a minute while players wait in Roblox, and closing the tab ends its team right away.
- The Player column of the Find a Team table sets who each row is for. A row can hold a chip from the Reserved window, which is "Me", a verified friend or an unverified friend. A chip can sit on several rows, which means that its player takes whichever of those rows fits best, and every row that ends up without its own player is searched for among other players. The "Verified only" checkbox of a row lets only players with a verified Roblox account take it, and only such a row can ask for badges, since nobody can confirm an unverified player's badges. An unverified friend holds a place for someone whom nothing checks. Every verified friend joins with the same invite link, `/?invite=<invite code>`, which adds them to the team with the badges from their own signed cookie, and their chip shows their username. A verified account can only join a team once at a time. The friend sees the host's team, its changes and later its search, but cannot change anything, and closing the Find a Team window takes them out of the team. The invite link stops letting new friends in once the team searches, and stops letting in a friend whom the host removed. The badges of the host come only from the signed session cookie, so nobody can claim a badge that Roblox did not confirm.
- On each check-in of a searching team, the server tries to merge it with another search that has the same TEAM SETTINGS, where a Region of Any matches every region. A merge needs a server link from at least one of the two searches, both searches must have the same number of rows that are not "(Leave Empty)", and a merge never puts the same verified Roblox account into one team twice. One search, the joiner, joins the other search, the host, and every player of the merged team has to fit a different row of every table in it, so every search gets what it asked for. A search's own players can only take rows reserved for them in its own table. A player fits a row of another table when one of the rows reserved for them matches its toon and trinkets, where "(Any)" matches anything on either side, and does every role that the row asks for. A "Verified only" row also needs a verified player who has every badge that the row asks for or a harder badge of the same category. The older search hosts, and a search that others joined can only host. Each table then shows the names of the players in its rows, and everyone, including invited friends, gets a link to the host's server, or to the joiner's server when the host left the link empty. When a search ends, the rows that its players took open up again. The "looking for a team" counter shows how many searches have not joined a team yet, and the "online" counter shows how many pages checked in during the last 90 seconds. Both counters show "…" until the page's first check-in answers.

## Running it

The server needs a secret for signing its cookies and the address of a Postgres database before it starts. Create a free Neon database from the Storage tab of the Vercel project, which also adds `DATABASE_URL` to the project's Environment Variables. Then create a `.env` file in the project folder, which git ignores, and copy `DATABASE_URL` into it from the `.env.local` tab of that database in Vercel:

```sh
COOKIE_SECRET=any long random string, for example the output of: openssl rand -hex 32
DATABASE_URL=postgresql://...
```

The server creates its tables on the first requests, so a new database needs no other setup.

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
   npm install hono @hono/node-server @neondatabase/serverless
   npm install -D concurrently
   npm pkg set scripts.dev='concurrently -k -n web,api "vite" "node --env-file-if-exists=.env --watch server/main.ts"' scripts.start="node --env-file-if-exists=.env server/main.ts"
   printf '\n.env\n' >> .gitignore
   ```

   The `--env-file-if-exists` flag makes Node load the settings from `.env` when that file exists, and the `.gitignore` line keeps the secrets out of git.

   Then make these three edits by hand:

   - Write the server into `server/main.ts`: an exported Hono `app`, a `serveStatic` handler for `dist/`, and the call to `serve` on port 3000, which is skipped when the `VERCEL` environment variable is set. Write `api/index.ts`, which only re-exports that `app` as its default export, and `api/tsconfig.json`, which sets `rewriteRelativeImportExtensions`, because Vercel compiles each `.ts` file into a `.js` file and the `.ts` imports would otherwise point at files that do not exist there. Also write `vercel.json`, which sets the framework to `vite`, adds `public/**` to that function's `includeFiles`, and rewrites `/api/(.*)` to `/api`. Write the Roblox `code`, `check`, `me`, `badges` and `logout` routes into `server/roblox.ts`, and mount them under `/api/roblox` in `server/main.ts`. Write a route into `server/images.ts` that lists the `.png` files in `public/toons` or `public/trinkets`, and mount it under `/api/images`. Write the check-in into `server/checkIn.ts`, where `POST /` is the check-in and `POST /leave` ends a closed tab's team, and mount it under `/api/check-in`. Put the badge categories, the server link pattern and the types of the table rows and the check-in answer, which the page and the server both use, into `shared/`.
   - Add `"server"` and `"shared"` to the `include` list in `tsconfig.node.json`, so that `npm run build` type-checks the server and the shared code with the Node settings.
   - Add a `server.proxy` entry to `vite.config.ts` that forwards `/api` to `http://localhost:3000`.

7. Write the view of the frontend into `client/main.tsx`, as the `render` call that places each feature on the page, and write each reaction of the page into its own file in `client/lobby/`, wired together by `client/lobby/useLogic.ts`. The features include the Roblox verification, which sits in a native `<dialog>` modal that a desktop-style icon in the top-left corner opens. The icon is the `Gossip_Bud.webp` picture from `public/`, which a hidden SVG filter makes blocky and reduces to a few colors, like an old Windows icon, with a "Roblox Verification" label under it, in the style of an old computer desktop. The modal looks like an old grey window, with a navy title bar and an × button that closes it. The window opens with `show()` instead of `showModal()`, so it has no dark backdrop and the rest of the page stays clickable, and opening one window closes any other open window. The window grows out of the icon when it opens and shrinks back into it when it closes, and the icon and the × button react to hovering and clicking. The icon and the window are one `DesktopWindow` component, which a second icon to the right of the first reuses, with the `All_Together.webp` picture, for a "Find a Team" window. Under its "Server link (recommended):" field, a "How do I get a server link?" link opens another window on top, which shows `howtomakeprivateserver1.webp` and `howtomakeprivateserver2.webp` from `public/`. Below the link, an old-style etched group box titled "TEAM SETTINGS" holds two columns. The left column has a "Dandy Run" checkbox, with the tooltip "Don't buy anything in Dandy's shop!!", and an "Early Dyle" checkbox, with the tooltip `Vote the special "TIME'S UP" card as soon as it appears`. The right column has a "Region:" dropdown with Any, Africa, Asia, Europe, North America, South America and Oceania, which starts on Any, and a "Floor goal:" dropdown with 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100 and 100+, which starts on 50. Each checkbox is centered vertically with the dropdown next to it. A Find Players button sits on the right, below the box. Find Players is greyed out, with a tooltip that says why, until "Me" is on at least one row, at least one row is left for a player to find, and every verified friend in the table is still in the team. It shows a red message instead of starting when the link is filled in but does not look like `https://www.roblox.com/share?code=<32 hex characters>&type=Server`, and the message disappears once the table, the server link or the TEAM SETTINGS change. The table has the columns Toon, Trinket A, Trinket B, Role and Player, and 8 rows. Each Player cell has a small "Verified only" checkbox, and the Player header explains on hover which rows are left for a player to find. Each Role cell starts with "Extractor" in it. Three smaller windows hang outside it: one with the toons from `public/toons` to the lower left, one with the trinkets from `public/trinkets` to the upper right, and a Reserved window below the trinkets. The Reserved window lists plain names, which look like the badge and role names in their cells and turn light grey with a hand cursor on hover, in three sections with a thin grey line between them: "Me", then every verified friend who opened the invite link followed by a "Copy invite link" button, which reads "Copied!" for 3 seconds, then every "Unverified friend #N" followed by a "+ Add unverified friend" button. A verified friend's chip in the table reads "@name (left the team)" once that friend closed their page. Every friend's chip has an × that removes the friend and their chips from the table. A chip dragged onto a Player cell replaces the cell's chip, the same chip can go on several rows, and a chip in the table moves to another Player cell or empties its cell when dropped anywhere else. Unverified friends are saved in localStorage, and the invite link and the removed verified friends last as long as the tab. An invited friend does not see the Reserved window. They get their file lists from `/api/images/toons` and `/api/images/trinkets`, so a new image only needs to be dropped into its folder. A small grey "Drag onto the table" line sits under the title of each of them. Dragging an image into a matching cell replaces what was there, and the image stays in its side window, so it can be placed again. An image in the table can be dragged to another matching cell, which moves it, or dropped anywhere else, which empties its cell. A row cannot hold the same trinket in both trinket columns, so such a drop does nothing. An empty Toon or Trinket cell shows a grey "(Any)" text, which cannot be dragged. Once the user is verified, the table gets a Badges column before Role. An empty Badges or Role cell shows a grey "(none required)" text, and clicking the cell opens a window in the middle of the screen, which lists the Dandy's World badges that the user owns, or the roles, with a checkbox each. The checked names are stacked in the cell, and checking a badge unchecks any badge of the same category. The categories are Speed Walker, Long Distance Runner and Marathon Runner; Machine Enthusiast, Machine Master and THE Machine; Clocked In and Overtime; Hissy Fit; Just Keep Swimming; and Double Digits!, Skilled Toon!, Super Skilled Pro! and Twisteds Fear Me. The roles are "Distracts Pebble", "Distracts grabbers", "Distracts the rest", "Babysits Glisten", "Solar Support" and "Extractor". Solar Support is grey and crossed out in every row whose toon is not Bobette, with the tooltip "Only Bobette can help with Solar Distracting", and the server never receives it for those rows. The badges of a row whose "Verified only" checkbox is unchecked are crossed out the same way, with the tooltip `Badges cannot be verified for unverified players. Check "Verified only".` Once Find Players starts, its button reads "Finding Players (Click to Cancel)" and cancels when clicked, and the table, the server link and the TEAM SETTINGS stop accepting changes. In the Player column, each row without a player then shows a smaller, left-aligned "Finding player" with dots that appear one by one, and every other row shows the grey name of its player, such as "(@name)", "(Friend of @name)" or "(Unverified player)". A chip on several rows shows its player in only one of them, and a search that joined a host shows every player of the merged team in its own table. While a search runs without a server link, a small grey line under Find Players reads "Without a server link, you can only match a team that has one. Adding yours finds a team faster." Once players got together, a "Team found!" window opens on top, with `Everyone_at_elevator.webp` from `public/` sitting on top of it at a third of its width, through the same SVG filter as the icons, and with a line such as "Players joined your team! Everyone meets in this server:" and the link to the team's Roblox server on the next line, and the team's status on the page keeps showing players who join later. When the team falls apart, such as when the host closes their page, its last status stays until Find a Team is closed. A player who joined someone else's team sees that window and a Leave Team button, and the spinner stops once the team joined another team or every row of it is taken. A friend who opened an invite link gets the Find a Team window opened for them, with the line "You are in @name's team. Closing this window takes you out of it." in place of the server link field, the host's table and TEAM SETTINGS locked, and no Find Players button. The team, the server link and the TEAM SETTINGS are saved in localStorage, so they survive a reload. Then add `<meta name="color-scheme" content="dark" />` to the `<head>` of `index.html`, which makes the browser draw the page, the buttons and the fields in dark colors. Put the wallpaper image `Gardenview_Rainbow_Print.webp` into `public/`, and give the `<body>` in `index.html` the inline style `margin: 0; min-height: 100vh; background: url(/Gardenview_Rainbow_Print.webp) center / cover fixed`, so that the image covers the whole window like a desktop wallpaper.

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
