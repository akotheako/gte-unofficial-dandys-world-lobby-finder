# Testing dwlobby

This is the list of everything that the site does, written as checks. Each check says what to do
and what should happen.

## Setup

- Run `npm run dev` with a `.env` that holds `COOKIE_SECRET` and a `DATABASE_URL` of a test
  database, because the check-in writes teams into it.
- Use at least three separate browser profiles, because each profile has its own cookies and
  localStorage. Two tabs of one profile share their verified Roblox account.
- Have at least two Roblox accounts that you can verify, at least one of them with a public
  inventory that holds some Dandy's World badges, and one with a private inventory.

## 1. Desktop, icons and windows

- The wallpaper covers the whole window and stays in place when the page scrolls.
- The "Roblox Verification" and "Find a Team" icons look blocky with few colors, and react to
  hovering and clicking.
- A window grows out of its icon when it opens and shrinks back into it when it closes.
- The × button closes its window and reacts to hovering and clicking.
- Opening one window closes any other open window.
- The page has no dark backdrop, so the rest of it stays clickable while a window is open.
- Both counters at the bottom show "…" until the first check-in answers, and numbers afterwards.
- The "Dark mode" checkbox of the Options window swaps the Gardenview wallpaper for the Astro one
  and turns the windows dark purple, and it stays checked after a reload.
- Every checkbox of "WHEN A TEAM IS FOUND" in Options stays as it was after a reload. With each of
  them checked, a found team then:
  - plays one of the four bell sounds, picked at random each time,
  - shows a "Team found!" notification, also on Android, and clicking it opens the server in
    Roblox,
  - opens the server in a new tab once pop-ups are allowed for the site.
- Checking "Show a notification" asks the browser for permission. While the browser waits for an
  answer, a grey line below the box points to the browser's popup or the bell icon in the address
  bar. When the permission is refused, the box stays unchecked with a red line below it.
- At 1920x1080, a tablet size such as 1024x768, and a phone size such as 390x844, every window
  and every side window of Find a Team fits on the screen, and the page never scrolls sideways.
- At 1320px of width or less, the open window covers the desktop icons, and Find a Team shows one
  card per row instead of the table and its side windows.
- Tapping a Toon or Trinket box of a card opens the Toons or Trinkets pick window, and tapping a
  tile puts it in the box and closes the window. "(Any)" empties the box, and the tile that the box
  holds has a navy frame.
- "(Leave Empty)" in the Toons pick window turns the whole card into a grey "(Leave Empty)" box,
  and tapping that box brings the card back.
- Picking for Trinket B the trinket that Trinket A holds moves it out of Trinket A.
- Tapping a Player box opens the Reserved Slots pick window, where tapping a name puts it in the
  box and "(Find a player)" empties it. Its × buttons and its buttons below the names work like
  the ones of the Reserved window.
- Tapping "Verified only" in a card toggles it without opening the pick window.
- While Find Players searches, the boxes of the cards open nothing.
- At 1320px of width or less, Upvote Players shows the last found team as read-only cards, each
  with "Player Slot #N" above it, instead of the table.
- At 640px of width or less, TEAM SETTINGS is one column, and the counters stack in the bottom left corner.

## 2. Roblox Verification

- The emoji code shows the fixed sentence and 8 emojis, and its copy button copies exactly that
  text.
- Verifying fails with a clear message when the code is not in the About section, when the
  username does not exist, and when the field is empty.
- Verifying succeeds once the code is in the About section.
- After a reload, the account is still verified.
- An account with a public inventory sees the 14 badges with the right owned state.
- An account with a private inventory sees an error.
- After a reload, the badges appear instantly.
- When Update Badges fails, the badges from before stay in view with a red error line below them.
- Log Out clears the account and its badges, and they stay gone after a reload.
- Verifying a second, different account shows none of the first account's badges.

## 3. Find a Team table before verifying

- The table has the columns Toon, Trinket A, Trinket B, Role and Player, and 8 rows, with no Badges
  column and no "Verified only" checkboxes.
- Every Role cell starts with "(none required)".
- The toons window sits to the lower left, the trinkets window to the upper right, and the Reserved
  window below the trinkets. The toons and trinkets windows show "Drag onto the table" under their
  titles, with an "N/N Toons" or "N/N Trinkets" button on the right of that line.
- The Toons and Trinkets pick windows of a narrow screen show the same button above their tiles.
- That button opens the My Toons or My Trinkets window, which groups the pictures under category
  titles. Every tile is tinted light grey and slightly see-through, with a big ✅ behind an owned
  tile's picture. Clicking a tile swaps its ✅ for a red X and lowers the count. The marks and the
  counts survive a reload.
- The Toons and Trinkets side windows and pick windows divide choices into separate "Owned" and
  "Missing" sections, omitting either section when it has no choices. Every option remains
  available and draggable/selectable when some are missing.
- A fresh profile starts with Poppy and Boxten owned and no trinkets owned. Missing toons and
  trinkets can still be dragged or selected for other players.
- The My Toons and My Trinkets windows have no "Show all" control.
- While Find Players runs, the "N/N Toons" and "N/N Trinkets" buttons are greyed out, and they
  work again once the search is cancelled.
- A new `.png` in `public/toons` or `public/trinkets` appears after a reload.

## 4. Dragging pictures

- A toon only drops onto a Toon cell, and a trinket only onto a Trinket cell. A drop onto the wrong
  column does nothing.
- A drop replaces the picture that was in the cell, and the picture stays in its side window.
- A picture dragged from the table to another matching cell moves there.
- A picture dragged from the table and dropped anywhere else empties its cell.
- A row refuses the same trinket in both trinket columns, whether it comes from the side window or
  from the other cell.
- An empty Toon or Trinket cell shows a grey "(Any)", which cannot be dragged.
- The "(Leave Empty)" tile marks a row as left empty, and a left-empty row does not count as a row
  that is left for a player to find.
- A toon dropped on a left-empty row brings the row back with the toon in its Toon cell, and a
  trinket brings it back with the trinket in Trinket A. A trinket that the row already holds in
  Trinket B brings the row back and stays where it is.

## 5. Roles and Badges cells

- Clicking a Role cell opens the Roles window in the middle of the screen, with the 6 roles and a
  checkbox each. The checked roles stack in the cell, and an empty cell shows "(none required)".
- Solar Support is crossed out, with the tooltip "Only Bobette can help with Solar Distracting", on
  every row whose toon is not Bobette. It turns normal when Bobette is dropped on the row, and is
  crossed out again when Bobette leaves.
- After verifying, the Badges column appears before Role, and the Badges window lists only the
  badges that the account owns.
- The grey lines in the Badges window sit only where two listed badges of different groups meet,
  which needs an account with only some of the badges to check.
- Checking a badge makes the earlier badges of its category look checked and greyed out, and the
  cell leaves them out.
- An earlier badge that was checked before a later one stays checked after the later one is
  unchecked.
- The badges of a row are crossed out, with their tooltip, while its "Verified only" checkbox is
  unchecked.
- Paste stays greyed out until Copy was clicked in the same window.
- The Badges and Roles windows each remember their own copied names.
- Paste checks exactly the copied names and unchecks the others.
- Each button reads "Copied!" or "Pasted!" for 3 seconds.
- Solar Support pasted onto a row without Bobette shows crossed out, and the server never receives
  it.

## 6. Reserved window and Player column

- The window shows the groups ME, VERIFIED FRIENDS, which only a verified host sees, and UNVERIFIED
  FRIENDS. The names turn light grey with a hand cursor on hover.
- "+ Add unverified friend" adds "Unverified friend #N", where N is one more than the highest
  number in the window, and the friends survive a reload.
- A chip dropped on a Player cell replaces the chip that was there, and the same chip can go on
  several rows.
- A chip in the table moves to another Player cell, or empties its cell when dropped anywhere else.
- The × of a friend removes the friend and all of their chips from the table.
- "Copy invite link" reads "Copied!" for 3 seconds. The link stays the same in one tab, and a new
  tab gets a new link.
- Only a verified host sees the "Verified only" checkboxes, and the Player header explains on hover
  which rows are left for a player to find.

## 7. Invite link

These checks need profiles A and B, and A is verified.

- B, verified, opens A's link. Find a Team opens with "You are in @A's team. Closing this window
  takes you out of it.", the table and TEAM SETTINGS are locked, and there is no server link field,
  no Find Players button and no Reserved window.
- A sees B's chip under VERIFIED FRIENDS with B's username, and can place it on rows.
- B sees A's changes within about 5 seconds.
- When B closes Find a Team, A's chip reads "@B (left the team)".
- When A removes B with the ×, the link no longer lets B in.
- Once A starts Find Players, the link no longer lets new friends in.
- B opening the link in a second tab gets "You already joined this team in another tab".
- A opening their own link in a new tab gets "This invite link is for your friends, send it to
  them". In the same tab, the link ends A's team, like a reload, and gets "This invite link
  expired".
- A link with a code that does not exist gets "This invite link expired".
- B, not verified, opens the link. Find a Team opens with "Verify your Roblox account in Roblox
  Verification to join the team that invited you." and the locked table, and the link stays in the
  address bar. After B verifies, B is in A's team within about 5 seconds.
- Every error except the verify one shows in red below Find Players, and the page becomes an
  ordinary page with the link gone from the address bar.

## 8. Find Players, server link and TEAM SETTINGS

- Find Players is greyed out, with a tooltip that says why, when no row has "Me", when no row is
  left to find, and when a verified friend in the table left the team.
- A "Me" row shows missing required toons and trinkets with the red X overlay, and missing required
  badges with the same crossed-out style as an impossible role. Find Players stays disabled until
  the requirements on that row are owned.
- A filled-in link that does not look like a Roblox server link shows a red message, which
  disappears when the table, the link or TEAM SETTINGS change.
- An empty link is allowed, and the search shows the grey line about searching without a server
  link.
- The blue "?" opens the help window on top, with both pictures.
- Dandy Run and Early Dyle show their tooltips, Dandy Run, Early Dyle and Region start on Any, and the
  Floor goal starts on 10 to 100+. The "from" dropdown never offers a floor above "to", and
  "to" never offers one below "from".
- While it searches, the button reads "Finding Players (Click to Cancel)", the table, the link and
  TEAM SETTINGS are locked, rows without a player show "Finding player" with animated dots, the
  other rows show "(@name)", "(Friend of @name)" or "(Unverified player)", and a chip on several
  rows shows its player in only one of them.
- Clicking the button again cancels and unlocks everything.
- The table, the link and TEAM SETTINGS survive a reload.
- A reload during a search ends the search, and the table stays.

## 9. Matchmaking

These checks need two or three profiles that search at the same time.

- Two searches with the same TEAM SETTINGS, a link on at least one side and the same number of rows
  that are not "(Leave Empty)" merge, and "Team found!" opens with the elevator picture and the
  link.
- Floor goal ranges that share at least one floor, such as 60 to 80 and 80 to 100+, merge.
- A Region, Dandy Run or Early Dyle of Any merges with every other choice of that setting.
- A merged team takes the most specific choice of its searches: after an Early Dyle Yes search
  joins an Any host, an Early Dyle No search no longer merges with that team, and the Floor goal
  narrows to the floors that every range shares. Browse Teams and Upvote Players show these
  settings, and a Browse Teams join adds the TEAM SETTINGS of Browse Teams to them.
- No merge happens when the Region differs and neither side is Any, when the Floor goal ranges share
  no floor, when Dandy Run or Early Dyle differs and neither side is Any, when the number of rows
  differs, or when the merge would give every slot a player while no search has a server link.
- Searches without a server link merge while the team still has free slots.
- Two merged searches merge as a whole: two players with many upvotes and two without any each
  merge first, and once the upvote gap fits, the two pairs become one team of four.
- The same verified account never ends up twice in one team.
- A search with 0 upvotes waiting next to one with 0 upvotes and one with many upvotes merges with
  the 0-upvote search first. A 0-upvote search and a search with many upvotes, alone in the queue,
  still merge within 60 seconds.
- A player fits a row only when the toon and trinkets match, where "(Any)" matches anything on
  either side, and when they do every role that the row asks for.
- The rows of a merged team combine into slots: after a search with three Boxten rows joins an
  all-"(Any)" host, a search with three Poppy rows no longer merges with that team, and Browse
  Teams shows the Boxten in the host's rows.
- "Team found!" shows the TEAM SETTINGS of the whole team as tags, and a read-only table of the
  whole team, one row per slot, where the user's own row is light blue and reads "(You)". On a
  narrow screen, the table becomes cards.
- A "Me" row never takes a row that asks for a toon or trinket that the user marked as missing in
  My Toons or My Trinkets, whether its own cell is "(Any)" or names that picture, while an "(Any)"
  cell on a friend's row still matches anything.
- A "Me" row cannot search for a badge that the verified account does not own.
- A "Verified only" row rejects an unverified player, accepts a harder badge of the same category,
  such as Marathon Runner for Speed Walker, and rejects an easier one.
- Everyone gets the server link of the oldest search of the team that has one, and "Team found!"
  names that search's player as the host. Invited friends get the link too.
- When the oldest search of a merged search leaves, the others keep searching together with
  their wishes, and when another search leaves, only its wishes leave with it.
- Players who join later keep appearing in the team's status.
- "Team found!" opens only once every row of the merged team has a player. Before that, the merged
  team keeps searching, with the spinner and "Finding player..." on its empty rows.
- Once the team is found, the table stays locked with the found players' names until "Team found!"
  closes, and closing it unlocks the table and brings back Find Players.
- When the joiner closes "Team found!" and clicks Find Players, the new search does not match the
  found host again, and the host keeps showing the team as it was found, with the joiner's name
  and the "Team found!" window.
- When the host closes the tab, the team falls apart, and its last status stays until "Team found!"
  closes.
- A tab that is hidden for more than 90 seconds without a check-in counts as gone.
- The spinner stops once every row is taken.
- "looking for a team" drops when searches merge, and "online" drops about 90 seconds after a tab
  closes.

## 9b. Browse Teams

- The Browse Teams icon is third in the row, and its window opens with YOUR SLOT, TEAM SETTINGS and
  "Looking for teams...".
- The Toon and Trinket side windows and pickers of YOUR SLOT show only owned pictures, with "(Any)"
  in the picker, and the slot survives a reload.
- TEAM SETTINGS of Browse Teams and of Find a Team are kept apart, and both survive a reload.
- Only the TEAM SETTINGS of Browse Teams have a Players range, which starts on 2 to 8, keeps
  "from" at or below "to", survives a reload, and lists only the teams whose number of rows that
  are not "(Leave Empty)" lies within it.
- A card lists a searching team with a server link whose free slot the user fits, with its toons
  and a tag for every TEAM SETTING that is not Any, plus a "Floor Goal: 10 to 100+" tag, or
  "Floor Goal: 50" for a single floor. The tags alternate between two blues, or two indigos in
  dark mode, and the Dandy Run and Early Dyle tags show a tooltip for Yes and a different one for
  No.
- In "Team found!" and Upvote Players, the floor goal tag shows the floor of the dropdowns within
  the range that is closest to its middle, such as "Floor Goal: 60" for 10 to 100+, and the
  higher of two equally close floors, such as "Floor Goal: 60" for 50 to 60.
- Clicking a card opens its team details in a modal above Browse Teams. The wide layout uses a table,
  the narrow layout uses labeled cards, and the TEAM SETTINGS appear as the same tags as on the
  cards.
- Closing the team details modal returns to the team list.
- No card shows a team whose free slots need a toon that the user marked as missing, a role that the
  slot does not do, or a badge that the user's verified account lacks, nor a team whose TEAM
  SETTINGS disagree.
- A card disappears within a few seconds once its team stops searching or fills up.
- With more than 20 fitting teams, the list shows 20 with "Loading more teams..." at its end, and
  scrolling to the end loads the rest.
- The team details show the host's name and the team's table. Each free row that the user fits has
  a Join button in its Player cell, or in its Player box on a narrow screen, every other free row
  shows "(Requirements incompatible with you)", and every taken row shows "(Slot filled)".
- With no fitting team, the list shows "No teams match these settings right now.".
- Join merges the user into that team only and into the row of that button, which other browsing
  pages then show as taken. It greys out Find Players and locks YOUR SLOT and TEAM SETTINGS, and
  "Team found!" opens once every row has a player, even while Find a Team is closed.
- "Looking for players..." appears at the bottom right below the table, with its dots appearing and disappearing as in
  "Finding player..." of Find a Team, while the team still searches for its other slots
- The joined row, or its card on a narrow screen, turns light blue and reads "Joined this slot"
  in bold in place of its button, and the other slots that the user fits keep their Join buttons. Clicking one of them moves the join to that slot.
- While the host's team keeps searching, the row that the join took reads "Player found!" in the
  host's Find a Team table, and the other free rows keep "Finding player".
- Team Details closes behind "Team found!" without an error line, YOUR SLOT stays locked, and
  closing "Team found!" ends the join and unlocks YOUR SLOT.
- Closing Team Details while the join waits ends the join and unlocks YOUR SLOT.
- When the team stops searching or no longer has a slot for the user, a red line says so and the
  join ends.
- A join still merges when the host of its team leaves before the join's check-in, and when its
  team merges into an older team first, as long as the chosen slot is still free there.
- Join is greyed out with a tooltip while Find Players runs, and for an invited friend.

## 10. Upvote Players

- Before any found team, the window says "You'll be able to upvote other players here after you
  find a team!"
- After a merge, the window shows the TEAM SETTINGS as tags, the server link, and the user's own table
  with the pictures, badges, roles and players of its rows, without its "(Leave Empty)" rows.
- The Upvote column, the last one, holds the Upvote button of each other verified player. The
  cell of the user's own row reads "(You cannot upvote yourself)", the cell of an unverified
  player reads "(You cannot upvote unverified players)", the host's cell of a friend whom the
  host invited reads "(You cannot upvote your invited friends)", and that friend's cell of the
  host reads "(You cannot upvote the friend who invited you)".
- Upvote turns into "Upvoted ✓", stays that way after reopening the window, and a second click
  takes the upvote back.
- A player and a friend who opened their invite link get no Upvote button for each other, and a player from the
  other search gets one for both of them.
- A player who did not verify only sees the explanation that upvoting needs a verified Roblox
  account, without the record.
- The server answers 401 to an upvote without a verified account, and 403 to an upvote for a
  player outside the voter's found teams.
- A second upvote for the same player stores no second upvote.

## 10b. This is a fan project and Contact/Report

- The fourth icon opens "This is a fan project", which says "This project was made by fans for
  fans, and not made by Blushcrunch."
- The fifth icon opens "Contact/Report", whose dropdown starts on "Report a bug in the website".
- "Report a bug in the game" and "Report a player" grey out the message box and Send, and show
  the red line whose "Blushcrunch official discord server" links to
  `https://discord.com/invite/dandysworld`.
- A second report from the same IP address within a minute gets a 429 and "You can only send
  one report per minute. Please try again soon.", while another IP address can still send one.
  Of five reports that one IP address sends at the same moment, only one is stored.
- Send stays greyed out while the message box is empty.
- Send stores the message in the `reports` table, with the Roblox username of a verified sender,
  empties the message box, and shows "Sent! Thank you for your message."
- The server answers 400 to a report with a game topic, an empty message, or a message longer
  than 2000 characters.
- Only the Roblox user ID of @akotheakotheako sees the Reports icon. Its window lists every
  report as a card with the topic, the time, the sender or "Unverified sender", and the message.
- Another account named akotheakotheako sees no Reports icon, and the server answers 403 to its
  request for the reports, as well as to a request without a verified account.

## 11. Security

- A changed `roblox` cookie is rejected.
- A check-in sent by hand cannot give the host badges that the cookie does not hold.
- Solar Support sent by hand for a row without Bobette never reaches matchmaking.
- Quotes, backslashes and SQL in any text of a check-in are stored exactly as they were sent.
- A search keeps working after the browser goes offline and back online.
- `/api/images/..` and similar paths cannot read files outside `public/toons` and `public/trinkets`.

## 12. Build

- `npm run lint` and `npm run build` pass.
- `npm start` serves the site and the API on port 3000.
- A Vercel preview deploy works, including the images route.
