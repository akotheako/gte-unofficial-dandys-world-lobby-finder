import {
	StrictMode,
	createElement,
	useEffect,
	useRef,
	type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { useLogic } from './lobby/useLogic.ts'

// Desktop icon that opens an old-style grey window with a navy title bar and an × button. The
// window grows out of the icon when it opens, and shrinks back into it when it closes.
function DesktopWindow({
	id,
	iconId,
	title,
	image,
	isOpen,
	openFromIcon,
	close,
	children,
}: {
	id: string
	iconId: string
	title: string
	image: string
	isOpen: boolean
	openFromIcon: () => void
	close: () => void
	children: ReactNode
}) {
	const iconRef = useRef<HTMLButtonElement>(null)
	const dialogRef = useRef<HTMLDialogElement>(null)
	const shrinkAnimationRef = useRef<Animation>(null)
	useEffect(() => {
		const icon = iconRef.current!
		const dialog = dialogRef.current!
		if (isOpen) {
			// A window that opens again while it still shrinks stays open
			shrinkAnimationRef.current?.cancel()
			if (dialog.open) return
			// show() instead of showModal() leaves out the dark backdrop and keeps the page clickable
			dialog.show()
			const from = icon.getBoundingClientRect()
			const to = dialog.getBoundingClientRect()
			dialog.animate([
				{
					translate: `${from.x - to.x}px ${from.y - to.y}px`,
					scale: `${from.width / to.width} ${from.height / to.height}`,
				},
				{
					translate: '0 0',
					scale: '1',
				},
			], {
				duration: 200,
				easing: 'ease-out',
			})
		} else if (dialog.open) {
			const from = dialog.getBoundingClientRect()
			const to = icon.getBoundingClientRect()
			shrinkAnimationRef.current = dialog.animate([
				{
					translate: '0 0',
					scale: '1',
				},
				{
					translate: `${to.x - from.x}px ${to.y - from.y}px`,
					scale: `${to.width / from.width} ${to.height / from.height}`,
				},
			], {
				duration: 150,
				easing: 'ease-in',
			})
			shrinkAnimationRef.current.onfinish = () => dialog.close()
		}
	}, [isOpen])
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
					background: var(--title-bar);
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
				ref={iconRef}
				id={iconId}
				className="window-icon"
				onClick={openFromIcon}
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
					background: var(--window-face);
					color: var(--window-text);
					color-scheme: var(--window-controls);
					border: 2px solid;
					border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light);
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
			{/* Old-style grey scrollbar with arrow buttons, on everything that scrolls in a window */}
			<style>{`
				.window::-webkit-scrollbar,
				.window ::-webkit-scrollbar {
					width: 16px;
				}
				.window::-webkit-scrollbar-track,
				.window ::-webkit-scrollbar-track {
					background: repeating-conic-gradient(var(--window-face) 0 25%, var(--field) 0 50%) 0 0 / 2px 2px;
				}
				.window::-webkit-scrollbar-thumb,
				.window ::-webkit-scrollbar-thumb,
				.window::-webkit-scrollbar-button,
				.window ::-webkit-scrollbar-button {
					background: var(--window-face);
					border: 2px solid;
					border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light);
					box-shadow: inset -1px -1px var(--bevel-shadow);
				}
				.window::-webkit-scrollbar-button:single-button,
				.window ::-webkit-scrollbar-button:single-button {
					height: 16px;
					background-repeat: no-repeat;
					background-position: center;
				}
				.window::-webkit-scrollbar-button:single-button:vertical:decrement,
				.window ::-webkit-scrollbar-button:single-button:vertical:decrement {
					background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='4'><path d='M3 0L7 4H0z' fill='black'/></svg>");
				}
				.window::-webkit-scrollbar-button:single-button:vertical:increment,
				.window ::-webkit-scrollbar-button:single-button:vertical:increment {
					background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='4'><path d='M0 0H7L3.5 4z' fill='black'/></svg>");
				}
				.window::-webkit-scrollbar-button:active,
				.window ::-webkit-scrollbar-button:active {
					border-color: var(--bevel-shadow);
					box-shadow: none;
				}
			`}</style>
			<dialog
				ref={dialogRef}
				id={id}
				className="window"
				closedby="closerequest"
				onCancel={(event) => {
					// React passes on the cancel of the windows inside this one, which close by themselves
					if (event.target !== event.currentTarget) return
					// The window stays open until it has shrunk into its icon
					event.preventDefault()
					close()
				}}
				// Firefox only starts a drag that carries some data
				onDragStart={(event) => event.dataTransfer.setData('text/plain', '')}
			>
				{/* Navy title bar with the window's title and an × button */}
				<style>{`
					.window-title {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin: 0 -8px 8px;
						padding: 2px 3px;
						background: var(--title-bar);
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
							background: var(--window-face);
							color: var(--window-text);
							border: 2px solid;
							border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light);
							font: bold 12px monospace;
							line-height: 1;
						}
						.window-close:hover {
							background: var(--button-hover);
						}
						.window-close:active {
							border-color: var(--bevel-dark) var(--bevel-light) var(--bevel-light) var(--bevel-dark);
							padding: 1px 0 0 1px;
						}
					`}</style>
					<button
						className="window-close"
						aria-label="Close"
						onClick={close}
					>
						×
					</button>
				</div>
				{children}
			</dialog>
		</>
	)
}

// Old-style grey window on top of everything else, which darkens the page behind it
function ModalWindow({
	id,
	closedby,
	isOpen,
	close,
	children,
}: {
	id: string
	closedby: 'any' | 'closerequest'
	isOpen: boolean
	close: () => void
	children: ReactNode
}) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	useEffect(() => {
		const dialog = dialogRef.current!
		if (isOpen && !dialog.open) dialog.showModal()
		if (!isOpen && dialog.open) dialog.close()
	}, [isOpen])
	return (
		<dialog
			ref={dialogRef}
			id={id}
			className="window"
			closedby={closedby}
			// Esc and, with closedby="any", a click outside the window close it by themselves
			onClose={close}
		>
			{children}
		</dialog>
	)
}

// Grey window in the middle of the screen with a navy title bar, an × button, and a white list of
// checkboxes, which the Badges and Role cells of the Find a Team table open
function ChecklistWindow({
	id,
	title,
	checkboxes,
	isOpen,
	close,
	copyButtonText,
	pasteButtonText,
	isPasteDisabled,
	onCopyClick,
	onPasteClick,
}: {
	id: string
	title: string
	checkboxes: {
		name: string
		hasLineAbove: boolean
		isChecked: boolean
		toggleCheckbox: (isChecked: boolean) => void
	}[]
	isOpen: boolean
	close: () => void
	copyButtonText: string
	pasteButtonText: string
	isPasteDisabled: boolean
	onCopyClick: () => void
	onPasteClick: () => void
}) {
	return (
		<ModalWindow
			id={id}
			closedby="any"
			isOpen={isOpen}
			close={close}
		>
			{/* Title bar with the window's title and a grey × button that closes the window */}
			<div className="window-title">
				{title}
				<button
					className="window-close"
					aria-label="Close"
					onClick={close}
				>
					×
				</button>
			</div>
			{/* White sunken list with one checkbox per line, with grey lines that split the badges
			into groups */}
			<style>{`
				.team-checklist {
					min-width: 180px;
					display: flex;
					flex-direction: column;
					gap: 2px;
					padding: 4px;
					background: var(--field);
					border: 2px solid;
					border-color: var(--bevel-shadow) var(--bevel-light) var(--bevel-light) var(--bevel-shadow);
				}
				.team-checklist label {
					display: flex;
					align-items: center;
					gap: 4px;
					white-space: nowrap;
					cursor: pointer;
				}
				.team-checklist label:hover {
					background: var(--field-hover);
				}
				.team-checklist label[data-has-line-above="true"] {
					padding-top: 2px;
					border-top: 1px solid var(--window-face);
				}
			`}</style>
			<div className="team-checklist">
				{checkboxes.map((checkbox) => (
					<label
						key={checkbox.name}
						data-has-line-above={checkbox.hasLineAbove}
					>
						<input
							type="checkbox"
							checked={checkbox.isChecked}
							onChange={(event) => checkbox.toggleCheckbox(event.target.checked)}
						/>
						{checkbox.name}
					</label>
				))}
			</div>
			{/* Row of two grey buttons under the list, Copy and Paste, which carry the checked names
			to another row and read "Copied!" or "Pasted!" for 3 seconds after a click. Paste is greyed
			out until Copy was clicked in the same window. */}
			<style>{`
				.team-checklist-buttons {
					display: flex;
					gap: 4px;
					margin-top: 4px;
				}
				.team-checklist-buttons button {
					flex: 1;
				}
			`}</style>
			<div className="team-checklist-buttons">
				<button onClick={onCopyClick}>{copyButtonText}</button>
				<button
					disabled={isPasteDisabled}
					onClick={onPasteClick}
				>
					{pasteButtonText}
				</button>
			</div>
		</ModalWindow>
	)
}

// Plain black name of whom a row is reserved for, like a badge or role name in its cell, which the
// Reserved window lists and the Player column of the Find a Team table holds. It turns light grey
// with an open hand cursor on hover.
function ReservationChip({
	text,
	onDragStart,
	onDragEnd,
}: {
	text: string
	onDragStart: () => void
	onDragEnd: () => void
}) {
	return (
		<>
			<style>{`
				.team-chip {
					white-space: nowrap;
					cursor: grab;
				}
				.team-chip:hover {
					background: var(--field-hover);
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
		dragFromSideWindow: () => void
		endDragFromSideWindow: () => void
		showRemoveFriendButton: boolean
		removeFriend: () => void
	}
}) {
	return (
		<div className="team-reserved-friend">
			<ReservationChip
				text={chip.text}
				onDragStart={chip.dragFromSideWindow}
				onDragEnd={chip.endDragFromSideWindow}
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
										color: var(--error);
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
									onSubmit={(event) => {
										event.preventDefault()
										logic.verifyRobloxUsername(
											new FormData(event.currentTarget).get('username') as string,
										)
									}}
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
								background: var(--field);
								border: 2px solid;
								border-color: var(--bevel-shadow) var(--bevel-light) var(--bevel-light) var(--bevel-shadow);
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
								color: var(--faded-text);
								cursor: default;
							}
							.team-drag-hint {
								margin-bottom: 4px;
								color: var(--hint-text);
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
									onDragEnd={logic.endDragFromSideWindow}
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
										onDragEnd={logic.endDragFromSideWindow}
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
											onDragEnd={logic.endDragFromSideWindow}
										/>
									))}
								</div>
							</div>
							{/* Reserved window, whose chips drag into the Player column */}
							{logic.showReservedWindow && <div
								id="team-reserved"
								className={logic.sideWindowClass}
							>
								<div className="window-title">Reserved Slots</div>
								{/* Small grey "Drag onto the Player column" line above the chips */}
								<div className="team-drag-hint">{logic.reservedWindowDragHint}</div>
								{/* Old-style etched group boxes, "ME", "VERIFIED FRIENDS" once verified, and
								"UNVERIFIED FRIENDS", with one chip per line, and in the friend boxes a button below
								the chips */}
								<style>{`
									#team-reserved fieldset {
										display: flex;
										flex-direction: column;
										align-items: stretch;
										gap: 4px;
										width: 256px;
										margin: 0 0 8px;
										padding: 4px 8px 8px;
										border: 2px groove var(--bevel-light);
									}
									#team-reserved fieldset:last-child {
										margin-bottom: 0;
									}
									#team-reserved legend {
										padding: 0 4px;
										font-weight: bold;
									}
									.team-locked fieldset {
										opacity: 0.5;
										pointer-events: none;
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
								<fieldset>
									<legend>ME</legend>
									<ReservedWindowEntry chip={logic.reservedWindowMeChip} />
								</fieldset>
								{logic.showReservedWindowVerifiedFriends && (
									<fieldset>
										<legend>VERIFIED FRIENDS</legend>
										{logic.reservedWindowVerifiedFriendChips.map((chip) => (
											<ReservedWindowEntry
												key={chip.key}
												chip={chip}
											/>
										))}
										{/* Button that copies the one invite link for every verified friend */}
										<button onClick={logic.copyInviteLink}>
											{logic.copyInviteLinkButtonText}
										</button>
									</fieldset>
								)}
								<fieldset>
									<legend>UNVERIFIED FRIENDS</legend>
									{logic.reservedWindowUnverifiedFriendChips.map((chip) => (
										<ReservedWindowEntry
											key={chip.key}
											chip={chip}
										/>
									))}
									<button onClick={logic.addUnverifiedFriend}>+ Add unverified friend</button>
								</fieldset>
							</div>}
						</div>
						{/* Badges window in the middle of the screen, with a checkbox for each owned badge */}
						<ChecklistWindow
							id="team-badges"
							title="Badges"
							checkboxes={logic.badgesWindowCheckboxes}
							isOpen={logic.isBadgesWindowOpen}
							close={logic.closeBadgesWindow}
							copyButtonText={logic.badgesWindowCopyButtonText}
							pasteButtonText={logic.badgesWindowPasteButtonText}
							isPasteDisabled={logic.isBadgesWindowPasteDisabled}
							onCopyClick={logic.copyBadgesWindowNames}
							onPasteClick={logic.pasteBadgesWindowNames}
						/>
						{/* Roles window in the middle of the screen, with a checkbox for each role */}
						<ChecklistWindow
							id="team-roles"
							title="Roles"
							checkboxes={logic.rolesWindowCheckboxes}
							isOpen={logic.isRolesWindowOpen}
							close={logic.closeRolesWindow}
							copyButtonText={logic.rolesWindowCopyButtonText}
							pasteButtonText={logic.rolesWindowPasteButtonText}
							isPasteDisabled={logic.isRolesWindowPasteDisabled}
							onCopyClick={logic.copyRolesWindowNames}
							onPasteClick={logic.pasteRolesWindowNames}
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
								background: var(--field);
							}
							#team-table th,
							#team-table td {
								min-width: 120px;
								height: 44px;
								padding: 2px 6px;
								border: 1px solid var(--table-line);
								text-align: center;
							}
							#team-table th:nth-child(-n + 3),
							#team-table td:nth-child(-n + 3) {
								min-width: 0;
								width: 60px;
							}
							#team-table td.team-disabled {
								width: auto;
								color: var(--faded-text);
							}
							#team-table td.team-clickable,
							#team-table td.team-clickable .team-placeholder {
								cursor: pointer;
							}
							#team-table td.team-clickable:hover {
								background: var(--field-hover);
							}
							#team-table th {
								height: 20px;
								background: var(--window-face);
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
								cursor: help;
							}
							.team-verified-only input {
								margin: 0;
								cursor: pointer;
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
						<table
							id="team-table"
							onDrop={logic.landDragOnTable}
						>
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
										// The browser only lets a drop land where its dragover was prevented
										onDragOver={(event) => {
											if (row.canDropLeaveEmptyOnRow) event.preventDefault()
										}}
										onDrop={row.leaveRowEmpty}
									>
										{/* Whole row merged into one cell with "(Leave Empty)" in the middle,
										which clears when clicked or when a toon or trinket lands on it */}
										{row.isLeftEmpty && (
											<td
												className={row.leaveEmptyCellClass}
												colSpan={row.leaveEmptyCellColSpan}
												onClick={row.undoLeaveRowEmpty}
												onDragOver={(event) => {
													if (row.canDropPictureOnLeftEmptyRow) event.preventDefault()
												}}
												onDrop={row.dropPictureOnLeftEmptyRow}
											>
												(Leave Empty)
											</td>
										)}
										{!row.isLeftEmpty && row.pictureCells.map((cell) => (
											<td
												key={cell.column}
												onDragOver={(event) => {
													if (cell.canDropPictureOnCell) event.preventDefault()
												}}
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
												title={row.badgesCellTooltip}
											>
												{row.noBadgesText && (
													<span className="team-placeholder">{row.noBadgesText}</span>
												)}
												{row.badges.map((badge) => (
													<div
														key={badge.name}
														className="team-badge-or-role"
														data-crossed-out={badge.isCrossedOut}
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
												onDragOver={(event) => {
													if (row.canDropReservationOnPlayerCell) event.preventDefault()
												}}
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
													<label
														className="team-verified-only"
														title={row.verifiedOnlyCheckboxTooltip}
													>
														<input
															type="checkbox"
															checked={row.isVerifiedOnlyCheckboxChecked}
															onChange={(event) => row.toggleVerifiedOnlyCheckbox(
																event.target.checked,
															)}
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
						{/* "Server link:" field with a "?", TEAM SETTINGS and Find Players, each on its own row */}
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
								color: var(--error);
							}
							#team-invited-friend {
								margin: 0;
							}
						`}</style>
						<form
							id="team-form"
							onSubmit={(event) => {
								event.preventDefault()
								logic.toggleFindingPlayers()
							}}
						>
							{/* Line for a friend who opened an invite link, saying whose team they are in */}
							{logic.invitedFriendText && <p id="team-invited-friend">{logic.invitedFriendText}</p>}
							{/* Row with the "Server link:" field and a "?" on its right */}
							<style>{`
								#team-server-link-row {
									display: flex;
									align-items: center;
								}
								#team-server-link-row > label {
									flex: 1;
									min-width: 0;
								}
							`}</style>
							{logic.showServerLinkField && (
								<div id="team-server-link-row">
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
											onChange={(event) => logic.saveServerLinkField(event.target.value)}
										/>
									</label>
									{/* Blue underlined "?" right of the field that opens the server link help window */}
									<style>{`
									#team-server-link-help {
										margin: 0 8px;
										color: var(--link);
										text-decoration: underline;
										cursor: pointer;
									}
								`}</style>
									<a
										id="team-server-link-help"
										title="How do I get a server link?"
										onClick={logic.openServerLinkHelpWindow}
									>
										?
									</a>
								</div>
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
									border: 2px groove var(--bevel-light);
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
											onChange={(event) => logic.toggleDandyRunCheckbox(event.target.checked)}
										/>
										Dandy Run
									</label>
									<label title={`Vote the special "TIME'S UP" card as soon as it appears`}>
										<input
											type="checkbox"
											checked={logic.isEarlyDyleCheckboxChecked}
											disabled={logic.areDandyRunAndEarlyDyleCheckboxesLocked}
											onChange={(event) => logic.toggleEarlyDyleCheckbox(event.target.checked)}
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
											onChange={(event) => logic.chooseRegionDropdownOption(event.target.value)}
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
											onChange={(event) => logic.chooseFloorGoalDropdownOption(event.target.value)}
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
											background: var(--window-text);
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
							{/* Small dark grey line under Find Players with a warning sign on its left, that asks
							for a server link while the search runs without one */}
							<style>{`
								#team-server-link-hint {
									max-width: 360px;
									margin: 0;
									display: flex;
									align-items: center;
									gap: 6px;
									color: var(--hint-text);
									font-size: 11px;
								}
								#team-server-link-hint.team-invisible {
									display: none;
								}
								#team-server-link-hint span {
									font-size: 16px;
								}
							`}</style>
							<p
								id="team-server-link-hint"
								className={logic.findingWithoutServerLinkHintClass}
							>
								{/* Warning sign left of the text */}
								<span aria-hidden="true">⚠</span>
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
								color: var(--link);
							}
						`}</style>
						<ModalWindow
							id="team-found"
							closedby="closerequest"
							isOpen={logic.isTeamFoundWindowOpen}
							close={logic.closeTeamFoundWindow}
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
						</ModalWindow>
						{/* Window on top of Find a Team with two screenshots that explain how to get a server link */}
						<style>{`
							#team-howto[open] {
								max-height: 90vh;
								display: flex;
								flex-direction: column;
							}
							#team-howto-screenshots {
								min-height: 0;
								overflow-y: auto;
							}
							#team-howto img {
								display: block;
								width: 520px;
								margin-bottom: 8px;
							}
						`}</style>
						<ModalWindow
							id="team-howto"
							closedby="closerequest"
							isOpen={logic.isServerLinkHelpWindowOpen}
							close={logic.closeServerLinkHelpWindow}
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
							{/* Two screenshots, which scroll below the title bar when they are taller than the screen */}
							<div id="team-howto-screenshots">
								<img
									src="/howtomakeprivateserver1.webp"
									alt="Dandy's World page: open Servers, then Create Private Server, or Configure on an existing one"
								/>
								<img
									src="/howtomakeprivateserver2.webp"
									alt="Configure Private Server page: turn on Allow Joining, then copy the Private Server Link"
								/>
							</div>
						</ModalWindow>
					</DesktopWindow>
					{/* Upvote Players icon, third in the row */}
					<style>{`
						#upvote-icon {
							left: 252px;
						}
					`}</style>
					<DesktopWindow
						id="upvote"
						iconId="upvote-icon"
						title="Upvote Players"
						image="/Main_Character.webp"
						{...logic.upvotePlayersWindow}
					>
						{/* Window that scrolls below its title bar when it is taller than the screen */}
						<style>{`
							#upvote[open] {
								max-height: 90vh;
								display: flex;
								flex-direction: column;
							}
							#upvote-contents {
								min-height: 0;
								overflow-y: auto;
							}
						`}</style>
						<div id="upvote-contents">
							{/* Line at the top, which explains how to verify to a user who did not */}
							<style>{`
								#upvote-intro {
									max-width: 600px;
									white-space: pre-line;
								}
							`}</style>
							<p id="upvote-intro">{logic.upvotePlayersIntroText}</p>
							{logic.showLastFoundTeam && (
								<>
									{/* TEAM SETTINGS of the team in one line, then its server link */}
									<style>{`
										#upvote-settings a {
											color: var(--link);
										}
									`}</style>
									<p id="upvote-settings">
										{logic.lastFoundTeamSettingsText}
										<br />
										<a
											href={logic.lastFoundTeamServerLink}
											target="_blank"
											rel="noreferrer"
										>
											{logic.lastFoundTeamServerLink}
										</a>
									</p>
									{/* White read-only table of the team, with Toon, Trinket A, Trinket B, Badges, Role
									and Player columns and grey placeholders */}
									<style>{`
										#upvote-table {
											border-collapse: collapse;
											background: var(--field);
										}
										#upvote-table th,
										#upvote-table td {
											min-width: 60px;
											height: 44px;
											padding: 2px 6px;
											border: 1px solid var(--table-line);
											text-align: center;
										}
										#upvote-table th {
											height: 20px;
											background: var(--window-face);
										}
										#upvote-table td.upvote-left-empty {
											color: var(--faded-text);
										}
										#upvote-table img {
											width: 40px;
											height: 40px;
											vertical-align: middle;
										}
									`}</style>
									<table id="upvote-table">
										<thead>
											<tr>
												<th>Toon</th>
												<th>Trinket A</th>
												<th>Trinket B</th>
												<th>Badges</th>
												<th>Role</th>
												<th>Player</th>
											</tr>
										</thead>
										<tbody>
											{logic.lastFoundTeamRows.map((row) => (
												<tr key={row.key}>
													{/* Whole row merged into one grey "(Leave Empty)" cell */}
													{row.isLeftEmpty && (
														<td
															className="upvote-left-empty"
															colSpan={6}
														>
															(Leave Empty)
														</td>
													)}
													{/* Toon or trinket picture, or a grey "(Any)" */}
													{!row.isLeftEmpty && row.pictureCells.map((cell) => (
														<td key={cell.key}>
															{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
															{cell.picture && (
																<img
																	src={cell.picture.src}
																	title={cell.picture.title}
																/>
															)}
														</td>
													))}
													{/* Badge names stacked in the cell, or a grey "(none required)" */}
													{!row.isLeftEmpty && (
														<td>
															{row.noBadgesText && (
																<span className="team-placeholder">{row.noBadgesText}</span>
															)}
															{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
														</td>
													)}
													{/* Role names stacked in the cell, or a grey "(none required)" */}
													{!row.isLeftEmpty && (
														<td>
															{row.noRolesText && (
																<span className="team-placeholder">{row.noRolesText}</span>
															)}
															{row.roleNames.map((name) => <div key={name}>{name}</div>)}
														</td>
													)}
													{/* Grey name of the player who took the row */}
													{!row.isLeftEmpty && (
														<td className="team-placeholder">{row.playerName}</td>
													)}
												</tr>
											))}
										</tbody>
									</table>
									{/* Old-style etched group box titled "VERIFIED PLAYERS", with one line per verified
									player: their name, then an Upvote button that reads "Upvoted ✓" once clicked */}
									<style>{`
										#upvote-players {
											margin-top: 12px;
										}
										#upvote-players div {
											display: flex;
											justify-content: space-between;
											align-items: center;
											gap: 12px;
											padding: 2px 0;
										}
									`}</style>
									<fieldset id="upvote-players">
										<legend>VERIFIED PLAYERS</legend>
										{logic.noOtherVerifiedPlayersText && <p>{logic.noOtherVerifiedPlayersText}</p>}
										{logic.upvoteEntries.map((entry) => (
											<div key={entry.key}>
												{entry.text}
												{entry.showUpvoteButton && (
													<button
														title={entry.upvoteButtonTitle}
														onClick={entry.toggleUpvote}
													>
														{entry.upvoteButtonText}
													</button>
												)}
											</div>
										))}
									</fieldset>
								</>
							)}
						</div>
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
					{/* White-on-black "Dark mode" checkbox at the bottom right of the screen. Checking
					it swaps the Gardenview wallpaper for the Astro one and turns the grey windows
					dark. */}
					<style>{`
						:root {
							--window-face: #c0c0c0;
							--window-text: #000;
							--window-controls: light;
							--bevel-light: #fff;
							--bevel-dark: #000;
							--bevel-shadow: #808080;
							--table-line: #808080;
							--field: #fff;
							--field-hover: #e0e0e0;
							--button-hover: #dcdcdc;
							--title-bar: #000080;
							--link: #00e;
							--error: #a00;
							--faded-text: #a8a8a8;
							--hint-text: #404040;
						}
						:root:has(#dark-mode input:checked) {
							--window-face: #34304a;
							--window-text: #e8e6f0;
							--window-controls: dark;
							--bevel-light: #5e5880;
							--bevel-dark: #0c0a14;
							--bevel-shadow: #1e1b2c;
							--table-line: #4a4566;
							--field: #1a1826;
							--field-hover: #2c2840;
							--button-hover: #423c5c;
							--title-bar: #5a2a8c;
							--link: #9cc0ff;
							--error: #ff7070;
							--faded-text: #6c6884;
							--hint-text: #b0aac8;
						}
						body:has(#dark-mode input:checked) {
							background-image: url(/Astro_Pattern_Print.webp);
						}
						#dark-mode {
							position: fixed;
							bottom: 12px;
							right: 12px;
							display: flex;
							align-items: center;
							gap: 4px;
							padding: 1px 3px;
							background: rgba(0, 0, 0, 0.6);
							color: #fff;
							font: bold 13px monospace;
							text-shadow: 1px 1px #000;
							cursor: pointer;
						}
					`}</style>
					<label id="dark-mode">
						<input
							type="checkbox"
							checked={logic.isDarkModeCheckboxChecked}
							onChange={(event) => logic.toggleDarkModeCheckbox(event.target.checked)}
						/>
						Dark mode
					</label>
				</>
			)
		})}
	</StrictMode>,
)
