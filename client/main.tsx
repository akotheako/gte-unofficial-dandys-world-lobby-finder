import {
	StrictMode,
	createElement,
	type ChangeEventHandler,
	type DragEventHandler,
	type MouseEventHandler,
	type ReactEventHandler,
	type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { useLogic } from './lobby/useLogic.ts'

// Desktop icon that opens an old-style grey window with a navy title bar and an × button
function DesktopWindow({
	id,
	iconId,
	title,
	image,
	onIconClick,
	onCancel,
	onCloseClick,
	children,
}: {
	id: string
	iconId: string
	title: string
	image: string
	onIconClick: MouseEventHandler<HTMLButtonElement>
	onCancel: ReactEventHandler<HTMLDialogElement>
	onCloseClick: () => void
	children: ReactNode
}) {
	return (
		<>
			{/* Desktop icon picture with a white label, in a row along the top of the screen */}
			<style>{`
				.window-icon {
					position: fixed;
					top: 12px;
					width: 112px;
					padding: 4px;
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
					background: none;
					border: none;
					color: #fff;
					font: 13px monospace;
					cursor: pointer;
				}
				.window-icon span {
					padding: 1px 3px;
					background: rgba(0, 0, 0, 0.6);
					font-weight: bold;
					text-shadow: 1px 1px #000;
				}
				.window-icon:hover span {
					background: #000080;
				}
				.window-icon img {
					filter: url(#retro);
				}
				.window-icon:hover img {
					filter: url(#retro) brightness(1.15);
				}
				.window-icon:active {
					transform: translate(1px, 1px);
				}
			`}</style>
			<button
				id={iconId}
				className="window-icon"
				onClick={onIconClick}
			>
				<img
					src={image}
					width="64"
					height="64"
					alt=""
				/>
				<span>{title}</span>
			</button>
			{/* Old-style grey window */}
			<style>{`
				.window {
					padding: 3px 11px 11px;
					background: #c0c0c0;
					color: #000;
					color-scheme: light;
					border: 2px solid;
					border-color: #fff #000 #000 #fff;
					font: 13px monospace;
					transform-origin: top left;
				}
				dialog.window {
					position: fixed;
					inset: 0;
					width: fit-content;
					height: fit-content;
					margin: auto;
				}
			`}</style>
			<dialog
				id={id}
				className="window"
				closedby="closerequest"
				onCancel={onCancel}
			>
				{/* Navy title bar with the window's title and an × button */}
				<style>{`
					.window-title {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin: 0 -8px 8px;
						padding: 2px 3px;
						background: #000080;
						color: #fff;
						font-weight: bold;
					}
				`}</style>
				<div className="window-title">
					{title}
					{/* Grey × button that closes the window */}
					<style>{`
						.window-close {
							width: 18px;
							height: 16px;
							padding: 0;
							background: #c0c0c0;
							color: #000;
							border: 2px solid;
							border-color: #fff #000 #000 #fff;
							font: bold 12px monospace;
							line-height: 1;
						}
						.window-close:hover {
							background: #dcdcdc;
						}
						.window-close:active {
							border-color: #000 #fff #fff #000;
							padding: 1px 0 0 1px;
						}
					`}</style>
					<button
						className="window-close"
						aria-label="Close"
						onClick={onCloseClick}
					>
						×
					</button>
				</div>
				{children}
			</dialog>
		</>
	)
}

// Grey window in the middle of the screen with a navy title bar, an × button, and a white list of
// checkboxes, which the Badges and Role cells of the Find a Team table open
function ChecklistWindow({
	id,
	title,
	checkboxes,
	onCloseClick,
}: {
	id: string
	title: string
	checkboxes: {
		name: string
		isChecked: boolean
		toggleCheckbox: ChangeEventHandler<HTMLInputElement>
	}[]
	onCloseClick: () => void
}) {
	return (
		<dialog
			id={id}
			className="window"
			closedby="any"
		>
			{/* Title bar with the window's title and a grey × button that closes the window */}
			<div className="window-title">
				{title}
				<button
					className="window-close"
					aria-label="Close"
					onClick={onCloseClick}
				>
					×
				</button>
			</div>
			{/* White sunken list with one checkbox per line */}
			<style>{`
				.team-checklist {
					min-width: 180px;
					display: flex;
					flex-direction: column;
					gap: 2px;
					padding: 4px;
					background: #fff;
					border: 2px solid;
					border-color: #808080 #fff #fff #808080;
				}
				.team-checklist label {
					display: flex;
					align-items: center;
					gap: 4px;
					white-space: nowrap;
					cursor: pointer;
				}
				.team-checklist label:hover {
					background: #e0e0e0;
				}
			`}</style>
			<div className="team-checklist">
				{checkboxes.map((checkbox) => (
					<label key={checkbox.name}>
						<input
							type="checkbox"
							checked={checkbox.isChecked}
							onChange={checkbox.toggleCheckbox}
						/>
						{checkbox.name}
					</label>
				))}
			</div>
		</dialog>
	)
}

// Plain black name of whom a row is reserved for, like a badge or role name in its cell, which the
// Reserved window lists and the Player column of the Find a Team table holds. It turns light grey
// with a hand cursor on hover.
function ReservationChip({
	text,
	onDragStart,
	onDragEnd,
}: {
	text: string
	onDragStart: DragEventHandler
	onDragEnd?: DragEventHandler
}) {
	return (
		<>
			<style>{`
				.team-chip {
					white-space: nowrap;
					cursor: pointer;
				}
				.team-chip:hover {
					background: #e0e0e0;
				}
			`}</style>
			<div
				className="team-chip"
				draggable
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
			>
				{text}
			</div>
		</>
	)
}

// Line of the Reserved window with a name that drags into the Player column, and a grey × after a
// friend's name
function ReservedWindowEntry({ chip }: {
	chip: {
		text: string
		dragFromSideWindow: DragEventHandler
		showRemoveFriendButton: boolean
		removeFriend: () => void
	}
}) {
	return (
		<div className="team-reserved-friend">
			<ReservationChip
				text={chip.text}
				onDragStart={chip.dragFromSideWindow}
			/>
			{/* Grey × button that removes the friend */}
			{chip.showRemoveFriendButton && (
				<button
					className="window-close"
					aria-label="Remove friend"
					onClick={chip.removeFriend}
				>
					×
				</button>
			)}
		</div>
	)
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* Desktop with the Roblox Verification and Find a Team icons and their windows */}
		{createElement(() => {
			const logic = useLogic()
			return (
				<>
					{/* Hidden filter that makes the icon pictures and the Team found! picture blocky and
					reduces them to a few colors */}
					<svg
						width="0"
						height="0"
					>
						<filter
							id="retro"
							colorInterpolationFilters="sRGB"
							x="0"
							y="0"
						>
							{/* Keeps one pixel out of every 3 by 3 block and spreads it over the whole block */}
							<feFlood
								x="1"
								y="1"
								width="1"
								height="1"
							/>
							<feComposite
								width="3"
								height="3"
							/>
							<feTile result="grid" />
							<feComposite
								in="SourceGraphic"
								in2="grid"
								operator="in"
							/>
							<feMorphology
								operator="dilate"
								radius="1"
							/>
							{/* Rounds each color channel to 6 levels and makes every pixel fully solid or clear */}
							<feComponentTransfer>
								<feFuncR
									type="discrete"
									tableValues="0 0.2 0.4 0.6 0.8 1"
								/>
								<feFuncG
									type="discrete"
									tableValues="0 0.2 0.4 0.6 0.8 1"
								/>
								<feFuncB
									type="discrete"
									tableValues="0 0.2 0.4 0.6 0.8 1"
								/>
								<feFuncA
									type="discrete"
									tableValues="0 1"
								/>
							</feComponentTransfer>
						</filter>
					</svg>
					{/* Roblox Verification icon, first in the row */}
					<style>{`
						#account-icon {
							left: 12px;
						}
					`}</style>
					<DesktopWindow
						id="account"
						iconId="account-icon"
						title="Roblox Verification"
						image="/Gossip_Bud.webp"
						{...logic.robloxVerificationWindow}
					>
						{logic.isRobloxVerified ? (
							// "Verified as <name>", the badge checklist, and Update Badges and Log out buttons
							<>
								<p>Verified as {logic.verifiedRobloxUsername}</p>
								{/* Dandy's World badge checklist, "Loading badges...", or an error */}
								<style>{`
									#account-badges {
										width: fit-content;
										margin: 1em auto;
										padding: 0;
										list-style: none;
									}
								`}</style>
								{logic.showBadgeChecklist ? (
									<ul id="account-badges">
										{logic.badgeChecklist.map((badge) => (
											<li key={badge.name}>
												{badge.mark} {badge.name}
											</li>
										))}
									</ul>
								) : (
									<p>{logic.badgeChecklistLoadingText}</p>
								)}
								{/* Red line under the badges when Update Badges failed */}
								<style>{`
									#account-badge-update-error {
										margin: 0 0 1em;
										color: #a00;
										text-align: center;
									}
								`}</style>
								{logic.badgeUpdateError && (
									<p id="account-badge-update-error">{logic.badgeUpdateError}</p>
								)}
								{/* Update Badges button on the left and Log out on the right, away from the × button */}
								<style>{`
									#account-actions {
										display: flex;
										justify-content: space-between;
									}
								`}</style>
								<div id="account-actions">
									<button onClick={logic.updateRobloxBadgeChecklist}>Update Badges</button>
									<button onClick={logic.logOutOfRoblox}>Log out</button>
								</div>
							</>
						) : (
							// Instructions, the code with Copy, and a username field with Check
							<>
								<p>
									Verify your Roblox account to get access to all the features!
									<br />
									<br />
									First, go to your{' '}
									<a
										href="https://www.roblox.com/users/profile/edit"
										target="_blank"
									>
										Roblox profile
									</a>
									,
									<br />
									then click on About to change your bio and paste this emoji-code:
								</p>
								{/* Emoji code with a Copy button next to it */}
								<style>{`
									#account-code {
										display: flex;
										align-items: center;
									}
									#account-code input {
										width: 420px;
										pointer-events: none;
									}
									#account-code button {
										width: 72px;
									}
								`}</style>
								<div id="account-code">
									<input
										value={logic.verificationEmojiCode}
										readOnly
										tabIndex={-1}
									/>
									<button onClick={logic.copyVerificationEmojiCode}>
										{logic.copyButtonText}
									</button>
								</div>
								<p>Then enter your username below and click [Check]:</p>
								{/* Roblox username field with Check, and any error below */}
								<style>{`
									#account-username input {
										width: 420px;
									}
									#account-username button {
										width: 72px;
									}
								`}</style>
								<form
									id="account-username"
									onSubmit={logic.verifyRobloxUsername}
								>
									<input
										name="username"
										defaultValue={logic.usernameFieldStartValue}
										placeholder="Roblox username"
										required
									/>
									<button>Check</button>
									<p>{logic.robloxVerificationError}</p>
								</form>
							</>
						)}
					</DesktopWindow>
					{/* Find a Team icon, second in the row */}
					<style>{`
						#team-icon {
							left: 132px;
						}
					`}</style>
					<DesktopWindow
						id="team"
						iconId="team-icon"
						title="Find a Team"
						image="/All_Together.webp"
						{...logic.findATeamWindow}
					>
						{/* Side windows that hang outside this window's edges */}
						<style>{`
							#team {
								overflow: visible;
							}
							#team-toons,
							#team-trinkets-and-reserved {
								position: absolute;
							}
							#team-toons {
								right: calc(100% + 24px);
								top: 180px;
							}
							#team-trinkets-and-reserved {
								left: calc(100% + 24px);
								top: 20px;
								display: flex;
								flex-direction: column;
								gap: 24px;
							}
							.team-palette {
								max-height: 360px;
								overflow-y: auto;
								display: grid;
								grid-template-columns: repeat(5, 48px);
								gap: 4px;
								padding: 4px;
								background: #fff;
								border: 2px solid;
								border-color: #808080 #fff #fff #808080;
							}
							.team-palette::-webkit-scrollbar {
								width: 16px;
							}
							.team-palette::-webkit-scrollbar-track {
								background: repeating-conic-gradient(#c0c0c0 0 25%, #fff 0 50%) 0 0 / 2px 2px;
							}
							.team-palette::-webkit-scrollbar-thumb,
							.team-palette::-webkit-scrollbar-button {
								background: #c0c0c0;
								border: 2px solid;
								border-color: #fff #000 #000 #fff;
								box-shadow: inset -1px -1px #808080;
							}
							.team-palette::-webkit-scrollbar-button:single-button {
								height: 16px;
								background-repeat: no-repeat;
								background-position: center;
							}
							.team-palette::-webkit-scrollbar-button:single-button:vertical:decrement {
								background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='4'><path d='M3 0L7 4H0z' fill='black'/></svg>");
							}
							.team-palette::-webkit-scrollbar-button:single-button:vertical:increment {
								background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='4'><path d='M0 0H7L3.5 4z' fill='black'/></svg>");
							}
							.team-palette::-webkit-scrollbar-button:active {
								border-color: #808080;
								box-shadow: none;
							}
							.team-palette img,
							.team-palette .team-text {
								width: 48px;
								height: 48px;
								cursor: grab;
							}
							.team-text {
								display: flex;
								align-items: center;
								justify-content: center;
								font-size: 11px;
							}
							.team-locked .window-title {
								background: #808080;
								color: #c0c0c0;
							}
							.team-locked .team-palette {
								opacity: 0.5;
								filter: grayscale(1);
								pointer-events: none;
							}
							.team-placeholder {
								color: #a8a8a8;
								cursor: default;
							}
							.team-drag-hint {
								margin-bottom: 4px;
								color: #404040;
								font-size: 11px;
							}
						`}</style>
						{/* Toons window to the lower left, whose toons drag into the Toon column */}
						<div
							id="team-toons"
							className={logic.sideWindowClass}
						>
							<div className="window-title">Toons</div>
							{/* Small grey "Drag onto the table" line above the tiles */}
							<div className="team-drag-hint">{logic.sideWindowDragHint}</div>
							<div className="team-palette">
								{/* "(Leave Empty)" text tile before the toon pictures */}
								<div
									className="team-text"
									draggable
									onDragStart={logic.dragLeaveEmptyTile}
								>
									(Leave Empty)
								</div>
								{logic.toonsWindowTiles.map((toon) => (
									<img
										key={toon.name}
										src={toon.src}
										title={toon.title}
										draggable
										onDragStart={toon.dragFromSideWindow}
									/>
								))}
							</div>
						</div>
						{/* Column to the right with the Trinkets window above the Reserved window */}
						<div id="team-trinkets-and-reserved">
							{/* Trinkets window, whose trinkets drag into the Trinket columns */}
							<style>{`
								#team-trinkets .team-palette {
									max-height: 240px;
								}
							`}</style>
							<div
								id="team-trinkets"
								className={logic.sideWindowClass}
							>
								<div className="window-title">Trinkets</div>
								{/* Small grey "Drag onto the table" line above the tiles */}
								<div className="team-drag-hint">{logic.sideWindowDragHint}</div>
								<div className="team-palette">
									{logic.trinketsWindowTiles.map((trinket) => (
										<img
											key={trinket.name}
											src={trinket.src}
											title={trinket.title}
											draggable
											onDragStart={trinket.dragFromSideWindow}
										/>
									))}
								</div>
							</div>
							{/* Reserved window, whose chips drag into the Player column */}
							{logic.showReservedWindow && <div
								id="team-reserved"
								className={logic.sideWindowClass}
							>
								<div className="window-title">Reserved</div>
								{/* Small grey "Drag onto the Player column" line above the chips */}
								<div className="team-drag-hint">{logic.reservedWindowDragHint}</div>
								{/* White sunken list with one chip per line, followed by the two buttons that
								add a friend */}
								<style>{`
									#team-reserved .team-palette {
										display: flex;
										flex-direction: column;
										align-items: stretch;
										gap: 4px;
										width: 256px;
									}
									.team-reserved-friend {
										display: flex;
										align-items: center;
										gap: 4px;
									}
									.team-reserved-friend .team-chip {
										flex: 1;
									}
									.team-reserved-friend .window-close {
										flex: none;
									}
									#team-reserved button {
										font-size: 11px;
									}
								`}</style>
								<div className="team-palette">
									<ReservedWindowEntry chip={logic.reservedWindowMeChip} />
									{/* Thin grey line above the verified friends and their invite button */}
									<style>{`
										.team-reserved-separator {
											margin: 2px 0;
											border-top: 1px solid #808080;
										}
									`}</style>
									<div className="team-reserved-separator" />
									{logic.reservedWindowVerifiedFriendChips.map((chip) => (
										<ReservedWindowEntry
											key={chip.key}
											chip={chip}
										/>
									))}
									{/* Button that copies the one invite link for every verified friend */}
									<button onClick={logic.copyInviteLink}>{logic.copyInviteLinkButtonText}</button>
									{/* Thin grey line above the unverified friends and their add button */}
									<div className="team-reserved-separator" />
									{logic.reservedWindowUnverifiedFriendChips.map((chip) => (
										<ReservedWindowEntry
											key={chip.key}
											chip={chip}
										/>
									))}
									<button onClick={logic.addUnverifiedFriend}>+ Add unverified friend</button>
								</div>
							</div>}
						</div>
						{/* Badges window in the middle of the screen, with a checkbox for each owned badge */}
						<ChecklistWindow
							id="team-badges"
							title="Badges"
							checkboxes={logic.badgesWindowCheckboxes}
							onCloseClick={logic.closeBadgesWindow}
						/>
						{/* Roles window in the middle of the screen, with a checkbox for each role */}
						<ChecklistWindow
							id="team-roles"
							title="Roles"
							checkboxes={logic.rolesWindowCheckboxes}
							onCloseClick={logic.closeRolesWindow}
						/>
						{/* Badge or role name stacked in a table cell. A crossed-out one is grey with a line through
						it and a "?" cursor, because the row cannot have it. */}
						<style>{`
							.team-badge-or-role {
								white-space: nowrap;
							}
							.team-badge-or-role[data-crossed-out="true"] {
								color: gray;
								text-decoration: line-through;
								cursor: help;
							}
						`}</style>
						{/* White table with Toon, Trinket A, Trinket B, once verified Badges, then Role and Reserved
						columns */}
						<style>{`
							#team-table {
								width: 100%;
								border-collapse: collapse;
								background: #fff;
							}
							#team-table th,
							#team-table td {
								min-width: 120px;
								height: 44px;
								padding: 2px 6px;
								border: 1px solid #808080;
								text-align: center;
							}
							#team-table th:nth-child(-n + 3),
							#team-table td:nth-child(-n + 3) {
								min-width: 0;
								width: 60px;
							}
							#team-table td.team-disabled {
								width: auto;
								color: #a8a8a8;
							}
							#team-table td.team-clickable,
							#team-table td.team-clickable .team-placeholder {
								cursor: pointer;
							}
							#team-table td.team-clickable:hover {
								background: #f0f0f0;
							}
							#team-table th {
								height: 20px;
								background: #c0c0c0;
							}
							#team-table th[title] {
								cursor: help;
							}
							#team-table .team-chip {
								display: inline-block;
							}
							.team-verified-only {
								display: flex;
								justify-content: center;
								align-items: center;
								gap: 2px;
								margin-top: 2px;
								font-size: 11px;
								white-space: nowrap;
								cursor: pointer;
							}
							.team-verified-only input {
								margin: 0;
							}
							#team-table img {
								width: 40px;
								height: 40px;
								vertical-align: middle;
							}
							.team-finding {
								display: block;
								max-width: 120px;
								text-align: left;
								font-size: 11px;
							}
							.team-finding span {
								display: inline-block;
								width: 0;
								overflow: hidden;
								vertical-align: bottom;
								animation: team-dots 1.6s steps(4) infinite;
							}
							@keyframes team-dots {
								to {
									width: 4ch;
								}
							}
						`}</style>
						<table id="team-table">
							<thead>
								<tr>
									<th>Toon</th>
									<th>Trinket A</th>
									<th>Trinket B</th>
									{logic.isRobloxVerified && <th>Badges</th>}
									<th>Role</th>
									{/* Player header that explains on hover which rows are left for players to find */}
									<th title={logic.playerColumnHeaderTooltip}>Player</th>
								</tr>
							</thead>
							<tbody>
								{logic.teamTableRows.map((row) => (
									<tr
										key={row.key}
										onDragOver={row.allowLeaveEmptyDropOnRow}
										onDrop={row.leaveRowEmpty}
									>
										{/* Whole row merged into one cell with "(Leave Empty)" in the middle,
										which clears when clicked or when a toon or trinket lands on it */}
										{row.isLeftEmpty && (
											<td
												className={row.leaveEmptyCellClass}
												colSpan={row.leaveEmptyCellColSpan}
												onClick={row.undoLeaveRowEmpty}
												onDragOver={row.allowPictureDropOnLeftEmptyRow}
												onDrop={row.dropPictureOnLeftEmptyRow}
											>
												(Leave Empty)
											</td>
										)}
										{!row.isLeftEmpty && row.pictureCells.map((cell) => (
											<td
												key={cell.column}
												onDragOver={cell.allowPictureDropOnCell}
												onDrop={cell.dropPictureOnCell}
											>
												{/* Grey "(Any)" text in an empty Toon or Trinket cell, which cannot be dragged */}
												{cell.anyText && (
													<div className="team-text team-placeholder">
														{cell.anyText}
													</div>
												)}
												{/* Toon or trinket picture */}
												{cell.picture && (
													<div
														className="team-text"
														draggable={cell.picture.draggable}
														onDragStart={cell.picture.dragPictureFromTable}
														onDragEnd={cell.picture.endPictureDragFromTable}
													>
														<img
															src={cell.picture.src}
															title={cell.picture.title}
															draggable={false}
														/>
													</div>
												)}
											</td>
										))}
										{/* Badge names stacked in the cell, or a grey "(none required)", which open the
										Badges window when clicked */}
										{!row.isLeftEmpty && logic.isRobloxVerified && (
											<td
												className={row.badgesAndRoleCellClass}
												onClick={row.openBadgesWindow}
											>
												{row.noBadgesText && (
													<span className="team-placeholder">{row.noBadgesText}</span>
												)}
												{row.badges.map((badge) => (
													<div
														key={badge.name}
														className="team-badge-or-role"
														data-crossed-out={badge.isCrossedOut}
														title={badge.crossedOutTooltip}
													>
														{badge.name}
													</div>
												))}
											</td>
										)}
										{/* Role names stacked in the cell, or a grey "(none required)", which open the
										Roles window when clicked */}
										{!row.isLeftEmpty && (
											<td
												className={row.badgesAndRoleCellClass}
												onClick={row.openRolesWindow}
											>
												{row.noRolesText && (
													<span className="team-placeholder">{row.noRolesText}</span>
												)}
												{row.roles.map((role) => (
													<div
														key={role.name}
														className="team-badge-or-role"
														data-crossed-out={role.isCrossedOut}
														title={role.crossedOutTooltip}
													>
														{role.name}
													</div>
												))}
											</td>
										)}
										{/* Chip from the Reserved window above a "Verified only" checkbox, or while the
										table is locked either "Finding player..." with blinking dots or the grey name of
										the player in the row */}
										{!row.isLeftEmpty && (
											<td
												onDragOver={row.allowReservationDropOnPlayerCell}
												onDrop={row.dropReservationOnPlayerCell}
											>
												{row.showFindingPlayerText && (
													<span className="team-finding">
														Finding player<span>...</span>
													</span>
												)}
												{row.showPlayerName && (
													<span className="team-finding team-placeholder">
														{row.playerName}
													</span>
												)}
												{row.reservationChip && (
													<ReservationChip
														text={row.reservationChip.text}
														onDragStart={row.reservationChip.dragReservationFromTable}
														onDragEnd={row.reservationChip.endReservationDragFromTable}
													/>
												)}
												{/* Small "Verified only" checkbox below the chip */}
												{row.showVerifiedOnlyCheckbox && (
													<label className="team-verified-only">
														<input
															type="checkbox"
															checked={row.isVerifiedOnlyCheckboxChecked}
															onChange={row.toggleVerifiedOnlyCheckbox}
														/>
														Verified only
													</label>
												)}
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
						{/* "Server link:" field, then a help link, two run tags and Find Players, each on its own row */}
						<style>{`
							#team-form {
								display: flex;
								flex-direction: column;
								gap: 8px;
								margin-top: 12px;
							}
							#team-form label {
								display: flex;
								align-items: center;
								gap: 4px;
								white-space: nowrap;
							}
							#team-form input {
								flex: 1;
								min-width: 0;
							}
							#team-form-error {
								margin: 0;
								color: #a00;
							}
							#team-invited-friend {
								margin: 0;
							}
						`}</style>
						<form
							id="team-form"
							onSubmit={logic.toggleFindingPlayers}
						>
							{/* Line for a friend who opened an invite link, saying whose team they are in */}
							{logic.invitedFriendText && <p id="team-invited-friend">{logic.invitedFriendText}</p>}
							{logic.showServerLinkField && (
								<label>
									Server link{" "}
									{/* "(recommended)" text that explains itself on hover */}
									<style>{`
										#team-server-link-recommended {
											cursor: help;
										}
									`}</style>
									<span
										id="team-server-link-recommended"
										title={`A match needs at least one server link, so if you share yours, it's more probable to find a team faster`}
									>
										(recommended)
									</span>
									:
									<input
										name="serverLink"
										type="password"
										defaultValue={logic.serverLinkFieldStartValue}
										readOnly={logic.isServerLinkFieldLocked}
										onChange={logic.saveServerLinkField}
									/>
								</label>
							)}
							{/* Blue underlined link that opens the server link help window */}
							<style>{`
								#team-server-link-help {
									align-self: flex-start;
									color: #00e;
									text-decoration: underline;
									cursor: pointer;
								}
							`}</style>
							{logic.showServerLinkField && (
								<a
									id="team-server-link-help"
									onClick={logic.openServerLinkHelpWindow}
								>
									How do I get a server link?
								</a>
							)}
							{/* Old-style etched group box titled "TEAM SETTINGS", with checkboxes on the left and
							dropdowns on the right */}
							<style>{`
								#team-settings {
									display: grid;
									grid-template-rows: auto auto;
									grid-auto-flow: column;
									justify-content: start;
									gap: 6px 24px;
									margin: 0;
									padding: 6px 10px 10px;
									border: 2px groove #fff;
								}
								#team-settings legend {
									padding: 0 4px;
									font-weight: bold;
								}
							`}</style>
							<fieldset id="team-settings">
								<legend>TEAM SETTINGS</legend>
								{/* Column of two checkboxes, Dandy Run and Early Dyle, that explain themselves on
								hover */}
								<style>{`
									#team-dandy-run-and-early-dyle {
										display: contents;
									}
									#team-dandy-run-and-early-dyle label {
										cursor: help;
									}
									#team-dandy-run-and-early-dyle input {
										flex: none;
										margin: 0;
									}
								`}</style>
								<div id="team-dandy-run-and-early-dyle">
									<label title="Don't buy anything in Dandy's shop!!">
										<input
											type="checkbox"
											checked={logic.isDandyRunCheckboxChecked}
											disabled={logic.areDandyRunAndEarlyDyleCheckboxesLocked}
											onChange={logic.toggleDandyRunCheckbox}
										/>
										Dandy Run
									</label>
									<label title={`Vote the special "TIME'S UP" card as soon as it appears`}>
										<input
											type="checkbox"
											checked={logic.isEarlyDyleCheckboxChecked}
											disabled={logic.areDandyRunAndEarlyDyleCheckboxesLocked}
											onChange={logic.toggleEarlyDyleCheckbox}
										/>
										Early Dyle
									</label>
								</div>
								{/* Column of two labeled dropdowns, Region and Floor goal, with the dropdowns lined
								up on the right */}
								<style>{`
									#team-region-and-floor-goal {
										display: contents;
									}
									#team-region-and-floor-goal label {
										justify-content: space-between;
										gap: 8px;
									}
								`}</style>
								<div id="team-region-and-floor-goal">
									<label>
										Region:
										<select
											value={logic.chosenRegionDropdownOption}
											disabled={logic.areRegionAndFloorGoalDropdownsLocked}
											onChange={logic.chooseRegionDropdownOption}
										>
											{logic.regionDropdownOptions.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</label>
									<label>
										Floor goal:
										<select
											value={logic.chosenFloorGoalDropdownOption}
											disabled={logic.areRegionAndFloorGoalDropdownsLocked}
											onChange={logic.chooseFloorGoalDropdownOption}
										>
											{logic.floorGoalDropdownOptions.map((option) => (
												<option key={option}>{option}</option>
											))}
										</select>
									</label>
								</div>
							</fieldset>
							<div>
								{/* Find Players button, greyed out with a tooltip while the team cannot search, followed
									while searching by a spinner */}
								<style>{`
									#team-find {
										display: flex;
										justify-content: flex-end;
										align-items: center;
										gap: 6px;
									}
								`}</style>
								<span
									id="team-find"
									title={logic.findPlayersButtonDisabledTooltip}
								>
									{logic.showFindPlayersButton && (
										<button disabled={logic.isFindPlayersButtonDisabled}>
											{logic.findPlayersButtonText}
										</button>
									)}
									{/* Ring of eight black spokes that darken one after another around the circle */}
									<style>{`
										#team-spinner {
											position: relative;
											width: 18px;
											height: 18px;
										}
										#team-spinner span {
											position: absolute;
											left: 8px;
											top: 0;
											width: 2px;
											height: 5px;
											background: #000;
											transform-origin: 1px 9px;
											animation: team-spoke 0.8s steps(1) infinite;
										}
										@keyframes team-spoke {
											0% {
												opacity: 1;
											}
											12.5% {
												opacity: 0.6;
											}
											25% {
												opacity: 0.3;
											}
											37.5% {
												opacity: 0.1;
											}
										}
										#team-spinner span:nth-child(1) { transform: rotate(0deg); animation-delay: -0.7s; }
										#team-spinner span:nth-child(2) { transform: rotate(45deg); animation-delay: -0.6s; }
										#team-spinner span:nth-child(3) { transform: rotate(90deg); animation-delay: -0.5s; }
										#team-spinner span:nth-child(4) { transform: rotate(135deg); animation-delay: -0.4s; }
										#team-spinner span:nth-child(5) { transform: rotate(180deg); animation-delay: -0.3s; }
										#team-spinner span:nth-child(6) { transform: rotate(225deg); animation-delay: -0.2s; }
										#team-spinner span:nth-child(7) { transform: rotate(270deg); animation-delay: -0.1s; }
										#team-spinner span:nth-child(8) { transform: rotate(315deg); animation-delay: 0s; }
									`}</style>
									{logic.showFindingPlayersSpinner && (
										<span id="team-spinner">
											<span />
											<span />
											<span />
											<span />
											<span />
											<span />
											<span />
											<span />
										</span>
									)}
								</span>
							</div>
							<p id="team-form-error">{logic.findPlayersError}</p>
							{/* Small dark grey line under Find Players that asks for a server link while the
							search runs without one, and keeps its space while invisible */}
							<style>{`
								#team-server-link-hint {
									max-width: 360px;
									margin: 0;
									color: #404040;
									font-size: 11px;
								}
								#team-server-link-hint.team-invisible {
									visibility: hidden;
								}
							`}</style>
							<p
								id="team-server-link-hint"
								className={logic.findingWithoutServerLinkHintClass}
							>
								{logic.findingWithoutServerLinkHint}
							</p>
						</form>
						{/* Window on top of Find a Team that says the team is found, with the blue link to its
						Roblox server below the text, and the picture of everyone at the elevator sitting on top
						of the window */}
						<style>{`
							#team-found {
								max-width: 520px;
								overflow: visible;
								overflow-wrap: anywhere;
							}
							#team-found img {
								position: absolute;
								bottom: 100%;
								left: 50%;
								translate: -50% 0;
								width: 33%;
								filter: url(#retro);
							}
							#team-found p {
								margin: 0;
							}
							#team-found a {
								color: #00e;
							}
						`}</style>
						<dialog
							id="team-found"
							className="window"
							closedby="closerequest"
						>
							{/* Picture of all of the toons waiting together at the elevator, above the window */}
							<img
								src="/Everyone_at_elevator.webp"
								alt="All of the toons waiting together at the elevator"
							/>
							{/* Title bar with Team found! and a grey × button that closes the window */}
							<div className="window-title">
								Team found!
								<button
									className="window-close"
									aria-label="Close"
									onClick={logic.closeTeamFoundWindow}
								>
									×
								</button>
							</div>
							{/* Text that says who joined whose team, then the server link on the next line */}
							<p>
								{logic.teamFoundText}
								<br />
								<a
									href={logic.teamServerLink}
									target="_blank"
									rel="noreferrer"
								>
									{logic.teamServerLink}
								</a>
							</p>
						</dialog>
						{/* Window on top of Find a Team with two screenshots that explain how to get a server link */}
						<style>{`
							#team-howto {
								max-height: 90vh;
								overflow: auto;
							}
							#team-howto .window-title {
								position: sticky;
								top: -3px;
							}
							#team-howto img {
								display: block;
								width: 520px;
								margin-bottom: 8px;
							}
						`}</style>
						<dialog
							id="team-howto"
							className="window"
							closedby="closerequest"
						>
							<div className="window-title">
								How do I get a server link?
								<button
									className="window-close"
									aria-label="Close"
									onClick={logic.closeServerLinkHelpWindow}
								>
									×
								</button>
							</div>
							<img
								src="/howtomakeprivateserver1.webp"
								alt="Dandy's World page: open Servers, then Create Private Server, or Configure on an existing one"
							/>
							<img
								src="/howtomakeprivateserver2.webp"
								alt="Configure Private Server page: turn on Allow Joining, then copy the Private Server Link"
							/>
						</dialog>
					</DesktopWindow>
					{/* Two white-on-black counters side by side at the bottom middle of the screen */}
					<style>{`
						#counters {
							position: fixed;
							bottom: 12px;
							left: 50%;
							translate: -50% 0;
							display: flex;
							gap: 12px;
							color: #fff;
							font: bold 13px monospace;
							text-shadow: 1px 1px #000;
						}
						#counters span {
							padding: 1px 3px;
							background: rgba(0, 0, 0, 0.6);
						}
					`}</style>
					<div id="counters">
						<span>{logic.onlineCounterText}</span>
						<span>{logic.findingPlayersCounterText}</span>
					</div>
				</>
			)
		})}
	</StrictMode>,
)
