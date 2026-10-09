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
- The "Dark mode" checkbox at the bottom right swaps the Gardenview wallpaper for the Astro one
  and turns the windows dark purple, and it stays checked after a reload.
- At 1920x1080, a tablet size such as 1024x768, and a phone size such as 390x844, every window
  and every side window of Find a Team fits on the screen, and the page never scrolls sideways.
- At 1180px of width or less, the open window covers the desktop icons, and Find a Team shows one
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
- At 1180px of width or less, Upvote Players shows the last found team as read-only cards, each
  with "Player Slot #N" above it, instead of the table.
- At 640px of width or less, TEAM SETTINGS is one column, and the counters stack in the bottom left corner, clear of the "Dark mode" checkbox.

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
- Every Role cell starts with "Extractor".
- The toons window sits to the lower left, the trinkets window to the upper right, and the Reserved
  window below the trinkets. The toons and trinkets windows show "Drag onto the table" under their
  titles.
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
- Checking a badge unchecks the other badges of its category, for each category that has more than
  one badge.
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
- A filled-in link that does not look like a Roblox server link shows a red message, which
  disappears when the table, the link or TEAM SETTINGS change.
- An empty link is allowed, and the search shows the grey line about searching without a server
  link.
- The blue "?" opens the help window on top, with both pictures.
- Dandy Run and Early Dyle show their tooltips, and Region and Floor goal start on Any and 50.
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
- No merge happens when the Region differs and neither side is Any, when the Floor goal, Dandy Run
  or Early Dyle differs, when the number of rows differs, or when neither side has a link.
- The same verified account never ends up twice in one team.
- A player fits a row only when the toon and trinkets match, where "(Any)" matches anything on
  either side, and when they do every role that the row asks for.
- A "Verified only" row rejects an unverified player, accepts a harder badge of the same category,
  such as Marathon Runner for Speed Walker, and rejects an easier one.
- The search with a server link hosts, or the older search when both have one, and a search that
  others joined cannot join another one.
- Everyone gets the host's link, and invited friends get it too.
- Players who join later keep appearing in the team's status.
- After Leave Team on the joining side, the host keeps showing the team as it was found, with the
  joiner's name and the "Team found!" window.
- When the host closes the tab, the team falls apart, and its last status stays until Find a Team
  is closed.
- A tab that is hidden for more than 90 seconds without a check-in counts as gone.
- The spinner stops once every row is taken.
- "looking for a team" drops when searches merge, and "online" drops about 90 seconds after a tab
  closes.

## 10. Upvote Players

- Before any found team, the window says "You'll be able to upvote other players here after you
  find a team!"
- After a merge, the window shows the TEAM SETTINGS, the server link, and the user's own table
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
