# dwlobby

A website with a React frontend and a Hono backend, all in TypeScript.

- The whole view of the frontend lives in `client/main.tsx`. The whole page is one component, written inline in the `render` call with `createElement`, and it only shows the values and calls the functions that `useLogic` returns. Each reaction of the page has its own file in `client/lobby/`, and `client/lobby/useLogic.ts` holds the state and wires the reactions. UI that appears more than once, such as the `DesktopWindow` icon-and-window pair, is a component defined above the `render` call. The site is a single page at `/`.
- `server/main.ts` wires the backend together, and each backend feature lives in its own module next to it, such as `server/roblox.ts`. Code that both the frontend and the backend can use, such as `shared/genericTypes.ts`, lives in `shared/`, which both `tsconfig.app.json` and `tsconfig.node.json` include. The backend answers the API routes under `/api`, and in production it also serves the built frontend from `dist/`.
- Node 24 runs `server/main.ts` directly, without a build step, because Node can strip TypeScript types on its own. That only works for TypeScript syntax that can be erased, which `tsconfig.node.json` enforces with `erasableSyntaxOnly`.
- Users verify their Roblox account by pasting a code such as "This is my verification code for DW Team Finder! 🌈✨🦋🍓🌙💖🐝🍀", made of a fixed sentence and 8 random emojis out of 31, into the About section of their Roblox profile, which only the owner of the account can edit. `server/roblox.ts` and the Roblox reactions in `client/lobby/` implement this. The server reads the profile through the public `users.roblox.com` API, and once it finds the code, it stores their Roblox user ID and username in a signed cookie that lasts 30 days. Verified users then see a checklist of 14 Dandy's World badges, which the server reads from the public `inventory.roblox.com` API. That only works when the user's Roblox inventory is public. The server stores the badges in the same signed session cookie, so they load instantly afterwards, and an Update Badges button fetches them from Roblox again. When that fails, the badges from before stay in view, with a red error line below them. There are no other accounts.
- Every open page checks in with `server/checkIn.ts` under a random page id, every 5 seconds while it takes part in a team and every 15 seconds otherwise, and a change of the search or of the invites checks in again right away. The check-in is the page's only timer. It answers with both counters at the bottom of the screen, and it keeps the page's team in a Postgres database on Neon while the team searches or has an "Invite friend" row. `server/database.ts` holds the connection, and the check-in creates its tables on its first request. A page counts as gone after 90 seconds without a check-in, because browsers run the timers of hidden tabs only once a minute while players wait in Roblox, and closing the tab ends its team right away.
- The Player column of the Find a Team table sets who each row is for. "Find any player" rows are searched for among every player, and "Find verified player" rows only among players with a verified Roblox account, meaning a verified "Me" row or an invited friend. Only a "Find verified player" row can ask for badges, since nobody can confirm an unverified player's badges, so the server drops the badges of a "Find any player" row. Exactly one row is "Me", an "Unverified friend" row holds a place for someone whom nothing checks, and an "Invite friend" row gets a "Copy invite link" button. The link, `/?invite=<invite code>&row=<row index>`, puts a verified friend who opens it into that exact row with the badges from their own signed cookie. The friend sees the host's team, its changes and later its search, but cannot change anything, and closing the Find a Team window takes them out of the team. An invite link stops working once the team searches, or once someone else used it. The server keeps only the badges that the signed session cookie lists as owned on the "Me" row, and none on "Unverified friend" rows, so nobody can claim a badge that Roblox did not confirm.
- On each check-in of a searching team, the server tries to merge it with another search that has the same TEAM SETTINGS, where a Region of Any matches every region. A merge needs a server link from at least one of the two searches, both searches must have the same number of rows that are not "(Leave Empty)", and a merge never puts the same verified Roblox account into one team twice. The players of one search, the joiner, take the rows that find a player in the other search, the host, and the host's players must also fit the joiner's rows that find a player, so both teams get what they asked for. A row fits when its toon and trinkets match, where "(Any)" matches anything on either side, when the player has every badge that the row asks for or a harder badge of the same category, and when the player does every role that the row asks for. The older search hosts, and a search that others joined can only host. The host's rows then show the names of the players who joined, and everyone, including invited friends, gets a link to the host's server, or to the joiner's server when the host left the link empty. When a search ends, the rows that its players took open up again. The "looking for a team" counter shows how many searches have not joined a team yet, and the "online" counter shows how many pages checked in during the last 90 seconds. Both counters show "…" until the page's first check-in answers.

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

7. Write the view of the frontend into `client/main.tsx`, as the `render` call that places each feature on the page, and write each reaction of the page into its own file in `client/lobby/`, wired together by `client/lobby/useLogic.ts`. The features include the Roblox verification, which sits in a native `<dialog>` modal that a desktop-style icon in the top-left corner opens. The icon is the `Gossip_Bud.webp` picture from `public/`, which a hidden SVG filter makes blocky and reduces to a few colors, like an old Windows icon, with a "Roblox Verification" label under it, in the style of an old computer desktop. The modal looks like an old grey window, with a navy title bar and an × button that closes it. The window opens with `show()` instead of `showModal()`, so it has no dark backdrop and the rest of the page stays clickable, and opening one window closes any other open window. The window grows out of the icon when it opens and shrinks back into it when it closes, and the icon and the × button react to hovering and clicking. The icon and the window are one `DesktopWindow` component, which a second icon to the right of the first reuses, with the `All_Together.webp` picture, for a "Find a Team" window. Under its "Server link (recommended):" field, a "How do I get a server link?" link opens another window on top, which shows `howtomakeprivateserver1.webp` and `howtomakeprivateserver2.webp` from `public/`. Below the link, an old-style etched group box titled "TEAM SETTINGS" holds two columns. The left column has a "Dandy Run" checkbox, with the tooltip "Don't buy anything in Dandy's shop!!", and an "Early Dyle" checkbox, with the tooltip `Vote the special "TIME'S UP" card as soon as it appears`. The right column has a "Region:" dropdown with Any, Africa, Asia, Europe, North America, South America and Oceania, which starts on Any, and a "Floor goal:" dropdown with 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100 and 100+, which starts on 50. Each checkbox is centered vertically with the dropdown next to it. A Find Players button sits on the right, below the box. Find Players shows a red message instead of starting when no row finds a player, when not exactly one row is "Me", or when the link is filled in but does not look like `https://www.roblox.com/share?code=<32 hex characters>&type=Server`, and the message disappears once the table, the server link or the TEAM SETTINGS change. The table has the columns Toon, Trinket A, Trinket B, Role and Player, which is a dropdown with "Find any player", "Find verified player", "Me", "Unverified friend" and "Invite friend", and 8 rows. Choosing "Me" on one row turns the old "Me" row into "Find any player". An "Invite friend" row shows a "Copy invite link" button, which reads "Copied!" for 3 seconds, and a grey line below it that reads "Waiting for your friend..." until it reads "@name joined". Each Role cell starts with "Extractor" in it. Two smaller windows hang outside it, one with the toons from `public/toons` to the lower left and one with the trinkets from `public/trinkets` to the upper right. They get their file lists from `/api/images/toons` and `/api/images/trinkets`, so a new image only needs to be dropped into its folder. A small grey "Drag onto the table" line sits under the title of each of them. Dragging an image into a matching cell replaces what was there, and the image stays in its side window, so it can be placed again. An image in the table can be dragged to another matching cell, which moves it, or dropped anywhere else, which empties its cell. A row cannot hold the same trinket in both trinket columns, so such a drop does nothing. An empty Toon or Trinket cell shows a grey "(Any)" text, which cannot be dragged. Once the user is verified, the table gets a Badges column before Role. An empty Badges or Role cell shows a grey "(none required)" text, and clicking the cell opens a window in the middle of the screen, which lists the Dandy's World badges that the user owns, or the roles, with a checkbox each. The checked names are stacked in the cell, and checking a badge unchecks any badge of the same category. The categories are Speed Walker, Long Distance Runner and Marathon Runner; Machine Enthusiast, Machine Master and THE Machine; Clocked In and Overtime; Hissy Fit; Just Keep Swimming; and Double Digits!, Skilled Toon!, Super Skilled Pro! and Twisteds Fear Me. The roles are "Distracts Pebble", "Distracts grabbers", "Distracts the rest", "Babysits Glisten", "Solar Support" and "Extractor". Solar Support is grey and crossed out in every row whose toon is not Bobette, with the tooltip "Only Bobette can help with Solar Distracting", and the server never receives it for those rows. The badges of a "Find any player" row are crossed out the same way, with the tooltip "Badges cannot be verified for unverified players". Once Find Players starts, its button reads "Finding Players (Click to Cancel)" and cancels when clicked, and the table, the server link and the TEAM SETTINGS stop accepting changes. In the Player column, each row that finds a player then shows a smaller, left-aligned "Finding player" with dots that appear one by one, and every other row shows the grey name of its player, such as "(@name)", "(Friend of @name)", "(Unverified friend)" or "(Invite not accepted)". A row that a player from another search took shows their name the same way, and a search that joined a host shows the host's players in its own rows that find a player. While a search runs without a server link, a small grey line under Find Players reads "Without a server link, you can only match a team that has one. Adding yours finds a team faster." Once players got together, a "Team found!" window opens on top, with `Everyone_at_elevator.webp` from `public/` sitting on top of it at a third of its width, through the same SVG filter as the icons, and with a line such as "Players joined your team! Everyone meets in this server:" and the link to the team's Roblox server on the next line, and the team's status on the page keeps showing players who join later. When the team falls apart, such as when the host closes their page, its last status stays until Find a Team is closed. A player who joined someone else's team sees that window and a Leave Team button, and the spinner stops once the team joined another team or every row of it is taken. A friend who opened an invite link gets the Find a Team window opened for them, with the line "You are in @name's team. Closing this window takes you out of it." in place of the server link field, the host's table and TEAM SETTINGS locked, and no Find Players button. The team, the server link and the TEAM SETTINGS are saved in localStorage, so they survive a reload. Then add `<meta name="color-scheme" content="dark" />` to the `<head>` of `index.html`, which makes the browser draw the page, the buttons and the fields in dark colors. Put the wallpaper image `Gardenview_Rainbow_Print.webp` into `public/`, and give the `<body>` in `index.html` the inline style `margin: 0; min-height: 100vh; background: url(/Gardenview_Rainbow_Print.webp) center / cover fixed`, so that the image covers the whole window like a desktop wallpaper.

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
