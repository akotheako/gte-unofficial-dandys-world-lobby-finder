import {
	StrictMode,
	createElement,
	useEffect,
	useRef,
	type ComponentProps,
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
			{/* Desktop icon picture with a white label, in the row of icons along the top of the
			screen */}
			<style>{`
				.window-icon {
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
					image-rendering: pixelated;
				}
				.window-icon:hover img {
					filter: brightness(1.15);
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
				@media (max-width: 1320px) {
					dialog.window {
						max-width: calc(100vw - 16px);
						max-height: calc(100dvh - 16px);
						overflow: auto;
						box-sizing: border-box;
						z-index: 1;
					}
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

// Row of small bold tags for the TEAM SETTINGS that are not Any, such as "Dandy Run" or
// "Floor Goal: 50", on the Browse Teams cards, in Team Details, in "Team found!" and in Upvote
// Players. The tags
// alternate between the light blue of the user's own row and a deeper blue, or between two indigos
// in dark mode. A tag with a tooltip shows a question mark cursor on hover.
function TeamSettingsTags({ tags }: {
	tags: ReturnType<typeof useLogic>['teamFoundSettingsTags']
}) {
	return (
		<>
			<style>{`
				.team-settings-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 6px;
				}
				.team-settings-tags span {
					padding: 1px 8px;
					background: var(--joined-slot);
					color: var(--window-text);
					border: 1px solid var(--bevel-shadow);
					box-shadow: inset -1px -1px var(--bevel-shadow);
					font-weight: bold;
				}
				.team-settings-tags span:nth-child(even) {
					background: var(--joined-slot-deeper);
				}
				.team-settings-tags span[title]:not([title=""]) {
					cursor: help;
				}
			`}</style>
			<span className="team-settings-tags">
				{tags.map((tag) => (
					<span
						key={tag.text}
						title={tag.tooltip}>
						{tag.text}
					</span>
				))}
			</span>
		</>
	)
}

// Join button in the Player cell or Player box of a free slot of Team Details, which shows its
// tooltip on hover even while it is greyed out
function BrowsedTeamJoinButton({ joinButton }: {
	joinButton: NonNullable<
		ReturnType<typeof useLogic>['openedBrowsedTeamRows'][number]['joinButton']
	>
}) {
	return (
		<span
			className="browse-join"
			title={joinButton.tooltip}>
			<button
				disabled={joinButton.isDisabled}
				onClick={joinButton.join}>
				{joinButton.text}
			</button>
		</span>
	)
}

// Modal with the selected Browse Teams card's settings and roster, with a Join button on each free
// slot that the user fits
function BrowseTeamDetailsModal({ logic }: { logic: ReturnType<typeof useLogic> }) {
	return (
		<>
			<style>{`
				#browse-team-details[open] {
					width: min(1100px, calc(100vw - 32px));
					max-height: calc(100dvh - 24px);
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
				}
				#browse-team-details-body {
					min-height: 0;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					gap: 10px;
				}
				#browse-team-details-host {
					margin: 0;
					font-size: 15px;
				}
				#browse-team-table-scroll {
					min-height: 0;
					max-height: 48vh;
					overflow: auto;
				}
				#browse-team-table {
					width: 100%;
					border-collapse: collapse;
					background: var(--field);
				}
				#browse-team-table th,
				#browse-team-table td {
					min-width: 60px;
					height: 44px;
					padding: 2px 6px;
					border: 1px solid var(--table-line);
					text-align: center;
				}
				#browse-team-table th {
					height: 20px;
					background: var(--window-face);
				}
				#browse-team-table img {
					width: 40px;
					height: 40px;
					vertical-align: middle;
				}
				#browse-team-details-cards { display: none; }
				/* Light blue row or card of the slot that the user joined, with its "Joined this
				slot" in bold */
				.browse-joined-slot td,
				.browse-joined-slot .team-card-box {
					background: var(--joined-slot);
				}
				.browse-joined-slot-text {
					font-weight: bold;
				}
				#browse-team-gone,
				#browse-error {
					margin: 0;
					color: var(--error);
				}
				@media (max-width: 1320px) {
					#browse-team-table-scroll { display: none; }
					#browse-team-details-cards { display: flex; flex-direction: column; gap: 6px; }
				}
			`}</style>
			<ModalWindow
				id="browse-team-details"
				closedby="closerequest"
				isOpen={logic.showOpenedBrowsedTeam}
				close={logic.closeOpenedBrowsedTeam}
			>
				<div className="window-title">
					Team Details
					<button
						className="window-close"
						aria-label="Close"
						onClick={logic.closeOpenedBrowsedTeam}>
						×
					</button>
				</div>
				<div id="browse-team-details-body">
					{logic.openedBrowsedTeamMissingText ? (
						<p id="browse-team-gone">{logic.openedBrowsedTeamMissingText}</p>
					) : (
						<>
							<h2 id="browse-team-details-host">{logic.openedBrowsedTeamHostText}</h2>
							{/* Tags with the TEAM SETTINGS of the whole team */}
							<TeamSettingsTags tags={logic.openedBrowsedTeamSettingsTags} />
							<div id="browse-team-table-scroll">
								<table id="browse-team-table">
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
										{logic.openedBrowsedTeamRows.map((row) => (
											<tr
												key={row.key}
												className={row.slotClass}>
												{row.pictureCells.map((cell) => (
													<td key={cell.key}>
														{cell.anyText && (
															<span className="team-placeholder">{cell.anyText}</span>
														)}
														{cell.picture && (
															<img
																className="toon-or-trinket-picture"
																src={cell.picture.src}
																title={cell.picture.title}
															/>
														)}
													</td>
												))}
												<td>
													{row.noBadgesText && (
														<span className="team-placeholder">{row.noBadgesText}</span>
													)}
													{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
												</td>
												<td>
													{row.noRolesText && (
														<span className="team-placeholder">{row.noRolesText}</span>
													)}
													{row.roleNames.map((name) => <div key={name}>{name}</div>)}
												</td>
												{row.joinButton ? (
													<td>
														<BrowsedTeamJoinButton joinButton={row.joinButton} />
													</td>
												) : (
													<td className={row.playerNameClass}>{row.playerName}</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<div id="browse-team-details-cards">
								{logic.openedBrowsedTeamRows.map((row) => (
									<div
										key={row.key}
										className={row.slotClass}>
										<div className="team-card-title">{row.cardTitle}</div>
										<div className="team-card">
											{row.pictureCells.map((cell) => (
												<div
													key={cell.key}
													className="team-card-box team-card-picture-box">
													<span className="team-card-label">{cell.cardBoxLabel}</span>
													{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
													{cell.picture && <img
														className="toon-or-trinket-picture"
														src={cell.picture.src}
														title={cell.picture.title} />}
												</div>
											))}
											<div className="team-card-box">
												<span className="team-card-label">Badges</span>
												{row.noBadgesText && (
													<span className="team-placeholder">{row.noBadgesText}</span>
												)}
												{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
											</div>
											<div className="team-card-box">
												<span className="team-card-label">Role</span>
												{row.noRolesText && (
													<span className="team-placeholder">{row.noRolesText}</span>
												)}
												{row.roleNames.map((name) => <div key={name}>{name}</div>)}
											</div>
											<div className="team-card-box">
												<span className="team-card-label">Player</span>
												{row.joinButton ? (
													<BrowsedTeamJoinButton joinButton={row.joinButton} />
												) : (
													<span className={row.playerNameClass}>{row.playerName}</span>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}
					{logic.browseTeamsError && <p id="browse-error">{logic.browseTeamsError}</p>}
				</div>
			</ModalWindow>
		</>
	)
}

// Grey window with a navy title bar and a white list of checkboxes for the Badges and Role cells
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
		isGreyedOut: boolean
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
			into groups, and greyed-out checked lines for the badges that a checked later badge proves */}
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
				.team-checklist label[data-greyed-out="true"] {
					color: var(--bevel-shadow);
					cursor: default;
				}
				.team-checklist label[data-greyed-out="true"]:hover {
					background: none;
				}
			`}</style>
			<div className="team-checklist">
				{checkboxes.map((checkbox) => (
					<label
						key={checkbox.name}
						data-has-line-above={checkbox.hasLineAbove}
						data-greyed-out={checkbox.isGreyedOut}
					>
						<input
							type="checkbox"
							checked={checkbox.isChecked}
							disabled={checkbox.isGreyedOut}
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
// with an open hand cursor on hover. In the Reserved Slots pick window of a narrow screen, a tap on
// it fills the Player box of the card.
function ReservationChip({
	text,
	onDragStart,
	onDragEnd,
	onClick,
}: {
	text: string
	onDragStart: () => void
	onDragEnd: () => void
	onClick?: () => void
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
				onClick={onClick}
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
		pickForPlayerCardBox: () => void
	}
}) {
	return (
		<div className="team-reserved-friend">
			<ReservationChip
				text={chip.text}
				onDragStart={chip.dragFromSideWindow}
				onDragEnd={chip.endDragFromSideWindow}
				onClick={chip.pickForPlayerCardBox}
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

// Old-style etched group boxes of the Reserved window and of the Reserved Slots pick window, "ME",
// "VERIFIED FRIENDS" once verified, and "UNVERIFIED FRIENDS", with one chip per line, and in the
// friend boxes a button below the chips
function ReservedSlotsGroupBoxes({
	meChip,
	showVerifiedFriends,
	verifiedFriendChips,
	unverifiedFriendChips,
	copyInviteLinkButtonText,
	copyInviteLink,
	addUnverifiedFriend,
}: {
	meChip: ComponentProps<typeof ReservedWindowEntry>['chip']
	showVerifiedFriends: boolean
	verifiedFriendChips: (ComponentProps<typeof ReservedWindowEntry>['chip'] & { key: string })[]
	unverifiedFriendChips: (ComponentProps<typeof ReservedWindowEntry>['chip'] & { key: string })[]
	copyInviteLinkButtonText: string
	copyInviteLink: () => void
	addUnverifiedFriend: () => void
}) {
	return (
		<div className="team-reserved-boxes">
			<style>{`
				.team-reserved-boxes fieldset {
					display: flex;
					flex-direction: column;
					align-items: stretch;
					gap: 4px;
					width: 256px;
					margin: 0 0 8px;
					padding: 4px 8px 8px;
					border: 2px groove var(--bevel-light);
				}
				.team-reserved-boxes fieldset:last-child {
					margin-bottom: 0;
				}
				.team-reserved-boxes legend {
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
				.team-reserved-boxes button {
					font-size: 11px;
				}
			`}</style>
			<fieldset>
				<legend>ME</legend>
				<ReservedWindowEntry chip={meChip} />
			</fieldset>
			{showVerifiedFriends && (
				<fieldset>
					<legend>VERIFIED FRIENDS</legend>
					{verifiedFriendChips.map((chip) => (
						<ReservedWindowEntry
							key={chip.key}
							chip={chip}
						/>
					))}
					{/* Button that copies the one invite link for every verified friend */}
					<button onClick={copyInviteLink}>{copyInviteLinkButtonText}</button>
				</fieldset>
			)}
			<fieldset>
				<legend>UNVERIFIED FRIENDS</legend>
				{unverifiedFriendChips.map((chip) => (
					<ReservedWindowEntry
						key={chip.key}
						chip={chip}
					/>
				))}
				<button onClick={addUnverifiedFriend}>+ Add unverified friend</button>
			</fieldset>
		</div>
	)
}

// Toons window to the lower left of Find a Team or Browse Teams, whose toons drag into the Toon
// column, and a column to the right with the Trinkets window, whose trinkets drag into the Trinket
// columns, above any windows that the children add. They hang outside the window's edges, and a
// screen too narrow for them shows the cards instead, whose boxes open the pick windows.
function ToonsAndTrinketsSideWindows({
	toonsWindowId,
	trinketsWindowId,
	sideWindowClass,
	showLeaveEmptyTile,
	showMissingChoices,
	logic,
	children,
}: {
	toonsWindowId: string
	trinketsWindowId: string
	sideWindowClass: string
	showLeaveEmptyTile: boolean
	showMissingChoices: boolean
	logic: ReturnType<typeof useLogic>
	children?: ReactNode
}) {
	const ownedToons = logic.toonsWindowTiles.filter((toon) => toon.isOwned)
	const missingToons = showMissingChoices
		? logic.toonsWindowTiles.filter((toon) => !toon.isOwned)
		: []
	const ownedTrinkets = logic.trinketsWindowTiles.filter((trinket) => trinket.isOwned)
	const missingTrinkets = showMissingChoices
		? logic.trinketsWindowTiles.filter((trinket) => !trinket.isOwned)
		: []

	return (
		<>
			<style>{`
				.team-side-windows {
					display: contents;
				}
				@media (max-width: 1320px) {
					.team-side-windows {
						display: none;
					}
				}
				.team-toons-side-window,
				.team-right-side-windows {
					position: absolute;
				}
				.team-toons-side-window {
					right: calc(100% + 24px);
					top: calc(180px - 50vh + 50%);
				}
				.team-right-side-windows {
					left: calc(100% + 24px);
					top: calc(20px - 50vh + 50%);
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
				.team-palette-section-title {
					grid-column: 1 / -1;
					cursor: default;
					font-weight: bold;
					padding: 4px 2px 0;
					border-bottom: 1px solid #999;
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
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 8px;
					margin-bottom: 4px;
					color: var(--hint-text);
					font-size: 11px;
				}
				.team-drag-hint button {
					font-size: 11px;
				}
			`}</style>
			<div className="team-side-windows">
				{/* Toons window */}
				<div
					id={toonsWindowId}
					className={`${sideWindowClass} team-toons-side-window`}
				>
					<div className="window-title">Toons</div>
					{/* Small grey "Drag onto the table" line above the tiles, with the grey "N/N Toons"
					button on its right */}
					<div className="team-drag-hint">
						{logic.sideWindowDragHint}
						<button
							disabled={logic.areOwnedPicturesButtonsDisabled}
							title={logic.ownedPicturesButtonsTooltip}
							onClick={logic.openOwnedToonsWindow}
						>
							{logic.ownedToonsButtonText}
						</button>
					</div>
					<div className="team-palette">
						{/* "(Leave Empty)" text tile before the toon pictures */}
						{showLeaveEmptyTile && (
							<div
								className="team-text"
								draggable
								onDragStart={logic.dragLeaveEmptyTile}
								onDragEnd={logic.endDragFromSideWindow}
							>
								(Leave Empty)
							</div>
						)}
						{ownedToons.length > 0 && (
							<>
								{showMissingChoices && (
									<div className="team-palette-section-title">Owned</div>
								)}
								{ownedToons.map((toon) => (
									<img
										key={toon.name}
										className="toon-or-trinket-picture"
										src={toon.src}
										title={toon.title}
										draggable
										onDragStart={toon.dragFromSideWindow}
										onDragEnd={logic.endDragFromSideWindow}
									/>
								))}
							</>
						)}
						{missingToons.length > 0 && (
							<>
								<div className="team-palette-section-title">Missing</div>
								{missingToons.map((toon) => (
									<img
										key={toon.name}
										className="toon-or-trinket-picture"
										src={toon.src}
										title={toon.title}
										draggable
										onDragStart={toon.dragFromSideWindow}
										onDragEnd={logic.endDragFromSideWindow}
									/>
								))}
							</>
						)}
					</div>
				</div>
				{/* Column to the right with the Trinkets window above the children */}
				<div className="team-right-side-windows">
					{/* Trinkets window */}
					<style>{`
						.team-trinkets-side-window .team-palette {
							max-height: 240px;
						}
					`}</style>
					<div
						id={trinketsWindowId}
						className={`${sideWindowClass} team-trinkets-side-window`}
					>
						<div className="window-title">Trinkets</div>
						{/* Small grey "Drag onto the table" line above the tiles, with the grey "N/N
						Trinkets" button on its right */}
						<div className="team-drag-hint">
							{logic.sideWindowDragHint}
							<button
								disabled={logic.areOwnedPicturesButtonsDisabled}
								title={logic.ownedPicturesButtonsTooltip}
								onClick={logic.openOwnedTrinketsWindow}
							>
								{logic.ownedTrinketsButtonText}
							</button>
						</div>
						<div className="team-palette">
							{ownedTrinkets.length > 0 && (
								<>
									{showMissingChoices && (
										<div className="team-palette-section-title">Owned</div>
									)}
									{ownedTrinkets.map((trinket) => (
										<img
											key={trinket.name}
											className="toon-or-trinket-picture"
											src={trinket.src}
											title={trinket.title}
											draggable
											onDragStart={trinket.dragFromSideWindow}
											onDragEnd={logic.endDragFromSideWindow}
										/>
									))}
								</>
							)}
							{missingTrinkets.length > 0 && (
								<>
									<div className="team-palette-section-title">Missing</div>
									{missingTrinkets.map((trinket) => (
										<img
											key={trinket.name}
											className="toon-or-trinket-picture"
											src={trinket.src}
											title={trinket.title}
											draggable
											onDragStart={trinket.dragFromSideWindow}
											onDragEnd={logic.endDragFromSideWindow}
										/>
									))}
								</>
							)}
						</div>
					</div>
					{children}
				</div>
			</div>
		</>
	)
}

// White table of Find a Team or of YOUR SLOT in Browse Teams, with Toon, Trinket A and Trinket B
// columns, then Badges once verified and Role, and for Find a Team a Player column. A screen
// 1320px wide or narrower hides it and shows TeamCards instead.
function TeamTable({
	id,
	rows,
	showBadgesColumn,
	showPlayerColumn,
	logic,
}: {
	id: string
	rows: ReturnType<typeof useLogic>['teamTableRows']
	showBadgesColumn: boolean
	showPlayerColumn: boolean
	logic: ReturnType<typeof useLogic>
}) {
	return (
		<>
			{/* Badge or role name stacked in a table cell or card box. A crossed-out one is grey with
			a line through it and a "?" cursor, because the row cannot have it. */}
			<style>{`
				.team-badge-or-role {
					white-space: nowrap;
				}
				.team-badge-or-role[data-crossed-out="true"] {
					color: gray;
					text-decoration: line-through;
					cursor: help;
				}
				.team-picture-crossed-out[data-crossed-out="true"] {
					position: relative;
					display: inline-flex;
				}
				.team-picture-crossed-out[data-crossed-out="true"]::before {
					content: '';
					position: absolute;
					inset: 0;
					background: url('/redx.webp') center / contain no-repeat;
				}
				.team-picture-crossed-out[data-crossed-out="true"] img {
					position: relative;
					opacity: 0.6;
					filter: grayscale(0.7) brightness(1.3);
				}
			`}</style>
			<style>{`
				.team-table {
					width: 100%;
					border-collapse: collapse;
					background: var(--field);
				}
				.team-table th,
				.team-table td {
					min-width: 120px;
					height: 44px;
					padding: 2px 6px;
					border: 1px solid var(--table-line);
					text-align: center;
				}
				.team-table th:nth-child(-n + 3),
				.team-table td:nth-child(-n + 3) {
					min-width: 0;
					width: 60px;
				}
				.team-table td.team-disabled {
					width: auto;
					color: var(--faded-text);
				}
				.team-table td.team-clickable,
				.team-table td.team-clickable .team-placeholder {
					cursor: pointer;
				}
				.team-table .team-text[draggable="true"] {
					cursor: grab;
				}
				.team-table td.team-clickable:hover {
					background: var(--field-hover);
				}
				.team-table th {
					height: 20px;
					background: var(--window-face);
				}
				.team-table th[title] {
					cursor: help;
				}
				.team-table .team-chip {
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
				.team-table img {
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
				@media (max-width: 1320px) {
					.team-table {
						display: none;
					}
				}
			`}</style>
			<table
				id={id}
				className="team-table"
				onDrop={logic.landDragOnTable}
			>
				<thead>
					<tr>
						<th>Toon</th>
						<th>Trinket A</th>
						<th>Trinket B</th>
						{showBadgesColumn && <th>Badges</th>}
						<th>Role</th>
						{/* Player header that explains on hover which rows are left for players to find */}
						{showPlayerColumn && <th title={logic.playerColumnHeaderTooltip}>Player</th>}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.key}
							// The browser only lets a drop land where its dragover was prevented
							onDragOver={(event) => {
								if (row.canDropLeaveEmptyOnRow) event.preventDefault()
							}}
							onDrop={row.leaveRowEmpty}
						>
							{/* Whole row merged into one cell with "(Leave Empty)" in the middle, which
							clears when clicked or when a toon or trinket lands on it */}
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
									{/* Grey "(Any)" text in an empty Toon or Trinket cell, which cannot be
									dragged */}
									{cell.anyText && (
										<div className="team-text team-placeholder">
											{cell.anyText}
										</div>
									)}
									{/* Toon or trinket picture */}
									{cell.picture && (
										<div
											className="team-text team-picture-crossed-out"
											data-crossed-out={cell.picture.isMissingForMe}
											draggable={cell.picture.draggable}
											onDragStart={cell.picture.dragPictureFromTable}
											onDragEnd={cell.picture.endPictureDragFromTable}
										>
											<img
												className="toon-or-trinket-picture"
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
							{!row.isLeftEmpty && showBadgesColumn && (
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
							{!row.isLeftEmpty && showPlayerColumn && (
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
									{/* "Player found!" above the name of a player who joined from Browse Teams */}
									{row.showPlayerFoundText && <div className="team-finding">Player found!</div>}
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
		</>
	)
}

// Column of white cards that replaces TeamTable on a narrow screen, one card per row with its
// title above it, with labeled Toon, Trinket A, Trinket B, Badges once verified, Role and for Find
// a Team Player boxes that wrap onto the next line when the card is too narrow for them
function TeamCards({
	id,
	rows,
	showBadgesBox,
	showPlayerBox,
}: {
	id: string
	rows: ReturnType<typeof useLogic>['teamTableRows']
	showBadgesBox: boolean
	showPlayerBox: boolean
}) {
	return (
		<>
			<style>{`
				.team-cards {
					display: none;
				}
				@media (max-width: 1320px) {
					.team-cards {
						display: flex;
						flex-direction: column;
						gap: 6px;
					}
				}
				.team-card {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					padding: 4px;
					background: var(--field);
					border: 2px solid;
					border-color: var(--bevel-shadow) var(--bevel-light) var(--bevel-light)
						var(--bevel-shadow);
				}
				.team-card-box {
					flex: 1 1 140px;
					min-width: 0;
					overflow-wrap: anywhere;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					gap: 2px;
					min-height: 64px;
					padding: 2px 4px;
					border: 1px solid var(--table-line);
					text-align: center;
				}
				.team-card-box.team-card-picture-box {
					flex: 1 0 64px;
				}
				.team-card-box.team-clickable {
					cursor: pointer;
				}
				.team-card-box.team-clickable:hover {
					background: var(--field-hover);
				}
				.team-card-left-empty {
					color: var(--faded-text);
				}
				.team-card-box img {
					width: 40px;
					height: 40px;
				}
				.team-card-label {
					color: var(--hint-text);
					font-size: 11px;
					font-weight: bold;
				}
				.team-card-title {
					margin-bottom: 2px;
					font-weight: bold;
				}
			`}</style>
			<div
				id={id}
				className="team-cards"
			>
				{rows.map((row) => (
					<div key={row.key}>
						{/* Bold title above the card, such as "Player Slot #N" */}
						<div className="team-card-title">{row.cardTitle}</div>
						<div className="team-card">
							{/* Grey "(Leave Empty)" box across the whole card, which brings the card back
							when tapped */}
							{row.isLeftEmpty && (
								<div
									className={row.leftEmptyCardBoxClass}
									onClick={row.undoLeaveRowEmpty}
								>
									(Leave Empty)
								</div>
							)}
							{/* Toon, Trinket A and Trinket B boxes with their label above the picture or a
							grey "(Any)", which open the Toons or Trinkets pick window when tapped */}
							{!row.isLeftEmpty && row.pictureCells.map((cell) => (
								<div
									key={cell.column}
									className={cell.cardBoxClass}
									onClick={cell.tapCardBox}
								>
									<span className="team-card-label">{cell.cardBoxLabel}</span>
									{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
									{cell.picture && (
										<span
											className="team-picture-crossed-out"
											data-crossed-out={cell.picture.isMissingForMe}
										>
											<img
												className="toon-or-trinket-picture"
												src={cell.picture.src}
												title={cell.picture.title}
											/>
										</span>
									)}
								</div>
							))}
							{/* Badges box with the badge names stacked, or a grey "(none required)", which
							opens the Badges window when tapped */}
							{!row.isLeftEmpty && showBadgesBox && (
								<div
									className={row.cardBoxClass}
									onClick={row.openBadgesWindow}
									title={row.badgesCellTooltip}
								>
									<span className="team-card-label">Badges</span>
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
								</div>
							)}
							{/* Role box with the role names stacked, or a grey "(none required)", which opens
							the Roles window when tapped */}
							{!row.isLeftEmpty && (
								<div
									className={row.cardBoxClass}
									onClick={row.openRolesWindow}
								>
									<span className="team-card-label">Role</span>
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
								</div>
							)}
							{/* Player box with the name from the Reserved Slots pick window or a grey "(Find
							a player)", above a "Verified only" checkbox, or while the table is locked
							either "Finding player..." with blinking dots or the grey name of the player in
							the row. It opens the Reserved Slots pick window when tapped. */}
							{!row.isLeftEmpty && showPlayerBox && (
								<div
									className={row.cardBoxClass}
									onClick={row.tapPlayerCardBox}
								>
									<span className="team-card-label">Player</span>
									{row.findAPlayerText && (
										<span className="team-placeholder">{row.findAPlayerText}</span>
									)}
									{row.showFindingPlayerText && (
										<span className="team-finding">
											Finding player<span>...</span>
										</span>
									)}
									{/* "Player found!" above the name of a player who joined from Browse Teams */}
									{row.showPlayerFoundText && <div className="team-finding">Player found!</div>}
									{row.showPlayerName && (
										<span className="team-placeholder">{row.playerName}</span>
									)}
									{row.reservationChip && <span>{row.reservationChip.text}</span>}
									{/* Small "Verified only" checkbox below the name, whose tap stays out of the
									box */}
									{row.showVerifiedOnlyCheckbox && (
										<label
											className="team-verified-only"
											title={row.verifiedOnlyCheckboxTooltip}
											onClick={(event) => event.stopPropagation()}
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
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</>
	)
}

// Old-style etched group box titled "TEAM SETTINGS", with Dandy Run and Early Dyle on the left and
// Region and Floor goal on the right, in Find a Team and in Browse Teams
function TeamSettingsGroupBox({
	id,
	settings,
}: {
	id: string
	settings: ReturnType<typeof useLogic>['findATeamSettings']
}) {
	return (
		<>
			<style>{`
				.team-settings {
					display: grid;
					grid-template-rows: auto auto;
					grid-auto-flow: column;
					justify-content: start;
					gap: 6px 24px;
					margin: 0;
					padding: 6px 10px 10px;
					border: 2px groove var(--bevel-light);
				}
				.team-settings legend {
					padding: 0 4px;
					font-weight: bold;
				}
				@media (max-width: 640px) {
					.team-settings {
						grid-template-rows: none;
						grid-auto-flow: row;
						justify-content: stretch;
					}
				}
			`}</style>
			<fieldset
				id={id}
				className="team-settings"
			>
				<legend>TEAM SETTINGS</legend>
				{/* Column of two labeled Any / Yes / No dropdowns, Dandy Run and Early Dyle, with the
				dropdowns lined up on the right and equally wide, that explain themselves on hover */}
				<style>{`
					.team-dandy-run-and-early-dyle {
						display: grid;
						grid-row: span 2;
						grid-template-columns: auto auto;
						justify-content: space-between;
						align-items: center;
						gap: 6px 8px;
						cursor: help;
					}
					.team-dandy-run-and-early-dyle label {
						display: contents;
					}
					.team-dandy-run-and-early-dyle select {
						width: 100%;
					}
				`}</style>
				<div className="team-dandy-run-and-early-dyle">
					<label title="Don't buy anything in Dandy's shop!!">
						Dandy Run:
						<select
							value={settings.chosenDandyRunDropdownOption}
							disabled={settings.areDropdownsLocked}
							onChange={(event) => settings.chooseDandyRunDropdownOption(event.target.value)}
						>
							{settings.dandyRunAndEarlyDyleDropdownOptions.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
					</label>
					<label title={`Vote the special "TIME'S UP" card as soon as it appears`}>
						Early Dyle:
						<select
							value={settings.chosenEarlyDyleDropdownOption}
							disabled={settings.areDropdownsLocked}
							onChange={(event) => settings.chooseEarlyDyleDropdownOption(event.target.value)}
						>
							{settings.dandyRunAndEarlyDyleDropdownOptions.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
					</label>
				</div>
				{/* Column of two labeled dropdowns, Region and Floor goal, with the dropdowns lined up on
				the right and equally wide */}
				<style>{`
					.team-region-and-floor-goal {
						display: grid;
						grid-row: span 2;
						grid-template-columns: auto auto;
						justify-content: space-between;
						align-items: center;
						gap: 6px 8px;
					}
					.team-region-and-floor-goal label {
						display: contents;
					}
					.team-region-and-floor-goal select {
						width: 100%;
					}
				`}</style>
				<div className="team-region-and-floor-goal">
					<label>
						Region:
						<select
							value={settings.chosenRegionDropdownOption}
							disabled={settings.areDropdownsLocked}
							onChange={(event) => settings.chooseRegionDropdownOption(event.target.value)}
						>
							{settings.regionDropdownOptions.map((option) => (
								<option key={option}>{option}</option>
							))}
						</select>
					</label>
					{/* Floor goal as two dropdowns, "from" and "to" */}
					<style>{`
						.team-floor-goal-range {
							display: grid;
							grid-template-columns: 1fr auto 1fr;
							align-items: center;
							gap: 4px;
						}
					`}</style>
					<label>
						Floor goal:
						<span className="team-floor-goal-range">
							<select
								value={settings.chosenFloorGoalFromDropdownOption}
								disabled={settings.areDropdownsLocked}
								onChange={(event) => (
									settings.chooseFloorGoalFromDropdownOption(event.target.value)
								)}
							>
								{settings.floorGoalFromDropdownOptions.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
							to
							<select
								value={settings.chosenFloorGoalToDropdownOption}
								disabled={settings.areDropdownsLocked}
								onChange={(event) => (
									settings.chooseFloorGoalToDropdownOption(event.target.value)
								)}
							>
								{settings.floorGoalToDropdownOptions.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
						</span>
					</label>
				</div>
			</fieldset>
		</>
	)
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* Desktop with the Roblox Verification and Find a Team icons and their windows */}
		{createElement(() => {
			const logic = useLogic()
			return (
				<>
					{/* Row of desktop icons along the top of the screen, which wraps onto a second line
					when the screen is too narrow for it. Their windows sit in the middle of the
					screen. */}
					<style>{`
						#desktop-icons {
							position: fixed;
							top: 0;
							left: 0;
							right: 0;
							display: flex;
							flex-wrap: wrap;
							align-items: flex-start;
							gap: 8px;
							padding: 12px;
						}
					`}</style>
					<div id="desktop-icons">
						{/* Roblox Verification icon, first in the row */}
						<DesktopWindow
							id="account"
							iconId="account-icon"
							title="Roblox Verification"
							image="/pixelated/Gossip_Bud.webp"
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
									@media (max-width: 1320px) {
										#account-code input {
											flex: 1;
											width: auto;
											min-width: 0;
										}
										#account-code button {
											flex: none;
										}
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
									@media (max-width: 1320px) {
										#account-username {
											display: flex;
											flex-wrap: wrap;
										}
										#account-username input {
											flex: 1;
											width: auto;
											min-width: 0;
										}
										#account-username p {
											width: 100%;
										}
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
						<DesktopWindow
							id="team"
							iconId="team-icon"
							title="Find a Team"
							image="/pixelated/All_Together.webp"
							{...logic.findATeamWindow}
						>
							{/* Window whose side windows hang outside its edges, which scrolls instead on
							a screen too narrow for them */}
							<style>{`
								#team {
									overflow: visible;
								}
								@media (max-width: 1320px) {
									#team {
										overflow: auto;
									}
								}
							`}</style>
							{/* Toons, Trinkets and Reserved Slots windows around this window */}
							<ToonsAndTrinketsSideWindows
								toonsWindowId="team-toons"
								trinketsWindowId="team-trinkets"
								sideWindowClass={logic.sideWindowClass}
								showLeaveEmptyTile
								showMissingChoices
								logic={logic}
							>
								{/* Reserved window below the Trinkets window, whose chips drag into the
								Player column */}
								{logic.showReservedWindow && <div
									id="team-reserved"
									className={logic.sideWindowClass}
								>
									<div className="window-title">Reserved Slots</div>
									{/* Small grey "Drag onto the Player column" line above the chips */}
									<div className="team-drag-hint">{logic.reservedWindowDragHint}</div>
									<ReservedSlotsGroupBoxes
										meChip={logic.reservedWindowMeChip}
										showVerifiedFriends={logic.showReservedWindowVerifiedFriends}
										verifiedFriendChips={logic.reservedWindowVerifiedFriendChips}
										unverifiedFriendChips={logic.reservedWindowUnverifiedFriendChips}
										copyInviteLinkButtonText={logic.copyInviteLinkButtonText}
										copyInviteLink={logic.copyInviteLink}
										addUnverifiedFriend={logic.addUnverifiedFriend}
									/>
								</div>}
							</ToonsAndTrinketsSideWindows>
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
							<TeamTable
								id="team-table"
								rows={logic.teamTableRows}
								showBadgesColumn={logic.isRobloxVerified}
								showPlayerColumn
								logic={logic}
							/>
							<TeamCards
								id="team-cards"
								rows={logic.teamTableRows}
								showBadgesBox={logic.isRobloxVerified}
								showPlayerBox
							/>
							{/* "Server link:" field with a "?", TEAM SETTINGS and Find Players, each on its own row */}
							<style>{`
							#team-form {
								display: flex;
								flex-direction: column;
								gap: 8px;
								margin-top: 12px;
							}
							#team-server-link-row label {
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
								<TeamSettingsGroupBox
									id="team-settings"
									settings={logic.findATeamSettings}
								/>
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
							@media (max-width: 640px) {
								#team-howto img {
									width: 100%;
								}
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
						{/* Browse Teams icon, third in the row */}
						<DesktopWindow
							id="browse"
							iconId="browse-icon"
							title="Browse Teams"
							image="/browse_teams.webp"
							{...logic.browseTeamsWindow}
						>
							{/* Column of YOUR SLOT, TEAM SETTINGS and the team cards, where only the cards
							scroll when the window is taller than the screen */}
							<style>{`
								#browse[open] {
									max-height: 90vh;
									display: flex;
									flex-direction: column;
									overflow: visible;
								}
								@media (max-width: 1320px) {
									#browse[open] {
										overflow: auto;
									}
								}
								#browse-contents {
									width: 600px;
									max-width: 100%;
									min-height: 0;
									display: flex;
									flex-direction: column;
									gap: 8px;
								}
								#browse-contents p {
									margin: 0;
								}
							`}</style>
							<div id="browse-contents">
								{/* Toons and Trinkets windows around this window */}
								<ToonsAndTrinketsSideWindows
									toonsWindowId="browse-toons"
									trinketsWindowId="browse-trinkets"
									sideWindowClass={logic.browseTeamsSideWindowClass}
									showLeaveEmptyTile={false}
									showMissingChoices={false}
									logic={logic}
								/>
								{/* YOUR SLOT as a table with one row, or as one card on a narrow screen */}
								<TeamTable
									id="browse-slot-table"
									rows={logic.browseTeamsTableRows}
									showBadgesColumn={false}
									showPlayerColumn={false}
									logic={logic}
								/>
								<TeamCards
									id="browse-slot-cards"
									rows={logic.browseTeamsTableRows}
									showBadgesBox={false}
									showPlayerBox={false}
								/>
								<TeamSettingsGroupBox
									id="browse-settings"
									settings={logic.browseTeamsSettings}
								/>
								{logic.showBrowsedTeamCards && (
									<>
										<p>{logic.browseTeamsListText}</p>
										{/* Scrolling column of white team cards, each with a row of toon pictures
										above a row of small grey tags, which turn light grey on hover */}
										<style>{`
											#browse-cards {
												min-height: 120px;
												overflow-y: auto;
												display: flex;
												flex-direction: column;
												gap: 6px;
											}
											.browse-card {
												padding: 6px;
												display: flex;
												flex-direction: column;
												gap: 4px;
												background: var(--field);
												color: var(--window-text);
												border: 1px solid var(--table-line);
												font: inherit;
												text-align: left;
												cursor: pointer;
											}
											.browse-card:hover {
												background: var(--field-hover);
											}
											.browse-card-toons {
												display: flex;
												flex-wrap: wrap;
												align-items: center;
												gap: 4px;
											}
											.browse-card-toons img {
												width: 40px;
												height: 40px;
											}
										`}</style>
										<div
											id="browse-cards"
											onScroll={(event) => logic.scrollBrowseTeamsList(
												event.currentTarget.scrollTop + event.currentTarget.clientHeight
													>= event.currentTarget.scrollHeight - 40,
											)}
										>
											{logic.browsedTeamCards.map((card) => (
												<button
													key={card.key}
													className="browse-card"
													onClick={card.open}
												>
													<span className="browse-card-toons">
														{card.toons.map((toon) => (toon.src
															? (
																<img
																	key={toon.key}
																	className="toon-or-trinket-picture"
																	src={toon.src}
																	title={toon.title}
																/>
															)
															: (
																<span
																	key={toon.key}
																	className="team-placeholder"
																>
																	{toon.anyText}
																</span>
															)))}
													</span>
													<TeamSettingsTags tags={card.tags} />
												</button>
											))}
											{logic.browseTeamsMoreText && (
												<p className="team-placeholder">{logic.browseTeamsMoreText}</p>
											)}
										</div>
									</>
								)}
								<BrowseTeamDetailsModal logic={logic} />
							</div>
						</DesktopWindow>
						{/* Upvote Players icon, fourth in the row */}
						<DesktopWindow
							id="upvote"
							iconId="upvote-icon"
							title="Upvote Players"
							image="/pixelated/Main_Character.webp"
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
									white-space: pre-line;
								}
							`}</style>
								<p id="upvote-intro">{logic.upvotePlayersIntroText}</p>
								{logic.showLastFoundTeam && (
									<>
										{/* Tags with the TEAM SETTINGS of the team, then its server link below them */}
										<style>{`
										#upvote-settings {
											display: flex;
											flex-direction: column;
											gap: 4px;
										}
										#upvote-settings a {
											color: var(--link);
										}
									`}</style>
										<p id="upvote-settings">
											<TeamSettingsTags tags={logic.lastFoundTeamSettingsTags} />
											<a
												href={logic.lastFoundTeamServerLink}
												target="_blank"
												rel="noreferrer"
											>
												{logic.lastFoundTeamServerLink}
											</a>
										</p>
										{/* White read-only table of the team without its "(Leave Empty)" rows, with Toon,
									Trinket A, Trinket B, Badges, Role, Player and Upvote columns and grey
									placeholders */}
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
										#upvote-table img {
											width: 40px;
											height: 40px;
											vertical-align: middle;
										}
										@media (max-width: 1320px) {
											#upvote-table {
												display: none;
											}
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
													<th>Upvote</th>
												</tr>
											</thead>
											<tbody>
												{logic.lastFoundTeamRows.map((row) => (
													<tr key={row.key}>
														{/* Toon or trinket picture, or a grey "(Any)" */}
														{row.pictureCells.map((cell) => (
															<td key={cell.key}>
																{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
																{cell.picture && (
																	<img
																		className="toon-or-trinket-picture"
																		src={cell.picture.src}
																		title={cell.picture.title}
																	/>
																)}
															</td>
														))}
														{/* Badge names stacked in the cell, or a grey "(none required)" */}
														<td>
															{row.noBadgesText && (
																<span className="team-placeholder">{row.noBadgesText}</span>
															)}
															{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
														</td>
														{/* Role names stacked in the cell, or a grey "(none required)" */}
														<td>
															{row.noRolesText && (
																<span className="team-placeholder">{row.noRolesText}</span>
															)}
															{row.roleNames.map((name) => <div key={name}>{name}</div>)}
														</td>
														{/* Grey name of the player who took the row */}
														<td className="team-placeholder">{row.playerName}</td>
														{/* Upvote button for the row's player, which reads "Upvoted ✓" once
														clicked, or a grey line such as "(You cannot upvote yourself)" */}
														<td>
															{row.cannotUpvoteText && (
																<span className="team-placeholder">{row.cannotUpvoteText}</span>
															)}
															{row.upvoteButton && (
																<button
																	title={row.upvoteButton.title}
																	onClick={row.upvoteButton.toggleUpvote}
																>
																	{row.upvoteButton.text}
																</button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
										{/* Column of read-only white cards that replaces the table on a narrow screen, one
										per row with "Player Slot #N" above it, in the look of the Find a Team cards */}
										<style>{`
											#upvote-cards {
												display: none;
											}
											@media (max-width: 1320px) {
												#upvote-cards {
													display: flex;
													flex-direction: column;
													gap: 6px;
												}
											}
										`}</style>
										<div id="upvote-cards">
											{logic.lastFoundTeamRows.map((row) => (
												<div key={row.key}>
													{/* Bold "Player Slot #N" line above the card */}
													<div className="team-card-title">{row.cardTitle}</div>
													<div className="team-card">
														{/* Toon, Trinket A and Trinket B boxes with their label above the
														picture or a grey "(Any)" */}
														{row.pictureCells.map((cell) => (
															<div
																key={cell.key}
																className="team-card-box team-card-picture-box"
															>
																<span className="team-card-label">{cell.cardBoxLabel}</span>
																{cell.anyText && (
																	<span className="team-placeholder">{cell.anyText}</span>
																)}
																{cell.picture && (
																	<img
																		className="toon-or-trinket-picture"
																		src={cell.picture.src}
																		title={cell.picture.title}
																	/>
																)}
															</div>
														))}
														{/* Badges box with the badge names stacked, or a grey "(none
														required)" */}
														<div className="team-card-box">
															<span className="team-card-label">Badges</span>
															{row.noBadgesText && (
																<span className="team-placeholder">{row.noBadgesText}</span>
															)}
															{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
														</div>
														{/* Role box with the role names stacked, or a grey "(none required)" */}
														<div className="team-card-box">
															<span className="team-card-label">Role</span>
															{row.noRolesText && (
																<span className="team-placeholder">{row.noRolesText}</span>
															)}
															{row.roleNames.map((name) => <div key={name}>{name}</div>)}
														</div>
														{/* Player box with the grey name of the player who took the row */}
														<div className="team-card-box">
															<span className="team-card-label">Player</span>
															<span className="team-placeholder">{row.playerName}</span>
														</div>
														{/* Upvote box with the Upvote button for the row's player, which reads
														"Upvoted ✓" once clicked, or a grey line such as "(You cannot upvote
														yourself)" */}
														<div className="team-card-box">
															<span className="team-card-label">Upvote</span>
															{row.cannotUpvoteText && (
																<span className="team-placeholder">{row.cannotUpvoteText}</span>
															)}
															{row.upvoteButton && (
																<button
																	title={row.upvoteButton.title}
																	onClick={row.upvoteButton.toggleUpvote}
																>
																	{row.upvoteButton.text}
																</button>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</>
								)}
							</div>
						</DesktopWindow>
						{/* This is a fan project icon, fifth in the row */}
						<DesktopWindow
							id="fan-project"
							iconId="fan-project-icon"
							title="This is a fan project"
							image="/blushcrunch.webp"
							{...logic.fanProjectWindow}
						>
							<p>This project was made by fans for fans, and not made by Blushcrunch.</p>
						</DesktopWindow>
						{/* Contact/Report icon, sixth in the row */}
						<DesktopWindow
							id="contact-report"
							iconId="contact-report-icon"
							title="Contact/Report"
							image="/contact_report.webp"
							{...logic.contactReportWindow}
						>
							{/* Topic dropdown, the red Discord line, the message box, and Send with its status
							line on the right */}
							<style>{`
								#contact-report-form {
									display: flex;
									flex-direction: column;
									gap: 8px;
									width: 420px;
									max-width: 100%;
								}
								#contact-report-form textarea {
									height: 140px;
									resize: vertical;
									font: inherit;
								}
								#contact-report-discord {
									margin: 0;
								}
								#contact-report-discord a {
									color: var(--link);
								}
								#contact-report-send {
									display: flex;
									align-items: center;
									gap: 8px;
								}
							`}</style>
							<form
								id="contact-report-form"
								onSubmit={(event) => {
									event.preventDefault()
									logic.sendReport()
								}}
							>
								<select
									value={logic.chosenReportTopicDropdownOption}
									onChange={(event) => logic.chooseReportTopicDropdownOption(event.target.value)}
								>
									{logic.reportTopicDropdownOptions.map((option) => (
										<option key={option}>{option}</option>
									))}
								</select>
								{logic.reportOnDiscordLine && (
									<p id="contact-report-discord">
										{logic.reportOnDiscordLine.beforeLink}
										<a
											href={logic.reportOnDiscordLine.link}
											target="_blank"
											rel="noreferrer"
										>
											{logic.reportOnDiscordLine.linkText}
										</a>
										{logic.reportOnDiscordLine.afterLink}
									</p>
								)}
								<textarea
									value={logic.reportMessage}
									onChange={(event) => logic.typeReportMessage(event.target.value)}
									disabled={logic.isReportMessageBoxDisabled}
									maxLength={2000}
									placeholder="Your message"
								/>
								<div id="contact-report-send">
									<button disabled={logic.isSendReportButtonDisabled}>Send</button>
									<span>{logic.reportStatusText}</span>
								</div>
							</form>
						</DesktopWindow>
						{/* Options icon, seventh in the row */}
						<DesktopWindow
							id="options"
							iconId="options-icon"
							title="Options"
							image="/options.webp"
							{...logic.optionsWindow}
						>
							{/* "Dark mode" checkbox, which swaps the Gardenview wallpaper for the Astro
							one and turns the grey windows dark */}
							<label id="dark-mode">
								<input
									type="checkbox"
									checked={logic.isDarkModeCheckboxChecked}
									onChange={(event) => logic.toggleDarkModeCheckbox(event.target.checked)}
								/>
								Dark mode
							</label>
							{/* Etched "WHEN A TEAM IS FOUND" group box with a checkbox per line, and a small
							grey line, or a red one for an error, below some of them */}
							<style>{`
								#options-team-found {
									width: 360px;
									max-width: 100%;
									margin: 8px 0 0;
									padding: 6px 10px 10px;
									box-sizing: border-box;
									border: 2px groove var(--bevel-light);
								}
								#options-team-found legend {
									padding: 0 4px;
									font-weight: bold;
								}
								#options-team-found label {
									display: block;
									margin-top: 4px;
								}
								#options-team-found p {
									margin: 0 0 0 22px;
									color: var(--hint-text);
									font-size: 11px;
									white-space: pre-line;
								}
								#options-team-found p.options-error {
									color: var(--error);
								}
							`}</style>
							<fieldset id="options-team-found">
								<legend>WHEN A TEAM IS FOUND</legend>
								{logic.teamFoundOptionsCheckboxes.map((checkbox) => (
									<div key={checkbox.label}>
										<label>
											<input
												type="checkbox"
												checked={checkbox.isChecked}
												disabled={checkbox.isDisabled}
												onChange={(event) => checkbox.toggle(event.target.checked)}
											/>
											{checkbox.label}
										</label>
										{checkbox.hint && (
											<p className={checkbox.isError ? 'options-error' : ''}>{checkbox.hint}</p>
										)}
									</div>
								))}
							</fieldset>
						</DesktopWindow>
						{/* Reports icon, eighth in the row, which only the owner of the site sees */}
						{logic.showReportsIcon && (
							<DesktopWindow
								id="reports"
								iconId="reports-icon"
								title="Reports"
								image="/contact_report.webp"
								{...logic.reportsWindow}
							>
								{/* Window that scrolls below its title bar when it is taller than the screen */}
								<style>{`
									#reports[open] {
										max-height: 90vh;
										display: flex;
										flex-direction: column;
									}
									#reports-contents {
										width: 560px;
										max-width: 100%;
										min-height: 0;
										overflow-y: auto;
									}
								`}</style>
								<div id="reports-contents">
									<p>{logic.reportsIntroText}</p>
									{/* White card for each report, with its topic, time and sender in bold
									above the message */}
									<style>{`
										.reports-card {
											margin-bottom: 6px;
											padding: 6px;
											background: var(--field);
											border: 1px solid var(--table-line);
										}
										.reports-card-title {
											margin-bottom: 4px;
											font-weight: bold;
										}
										.reports-card-message {
											white-space: pre-wrap;
											overflow-wrap: anywhere;
										}
									`}</style>
									{logic.reportCards.map((card) => (
										<div
											key={card.key}
											className="reports-card"
										>
											<div className="reports-card-title">{card.titleText}</div>
											<div className="reports-card-message">{card.message}</div>
										</div>
									))}
								</div>
							</DesktopWindow>
						)}
					</div>
					{/* Roles window in the middle of the screen, which a Role cell of Find a Team or YOUR
					SLOT opens, with a checkbox for each role */}
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
					{/* Pick window in the middle of the screen, which a box of a Find a Team or YOUR SLOT
					card opens: Toons or Trinkets with a grid of picture tiles, where the tile that the box
					holds has a navy frame, or Reserved Slots with "(Find a player)" above the group boxes
					of the Reserved window */}
					<style>{`
						#team-pick .team-palette {
							max-height: 60dvh;
						}
						#team-pick .team-palette > * {
							cursor: pointer;
						}
						#team-pick .team-palette [data-chosen="true"] {
							outline: 2px solid var(--title-bar);
							outline-offset: -2px;
						}
						#team-pick-find-a-player {
							width: 100%;
							margin-bottom: 8px;
						}
					`}</style>
					<ModalWindow
						id="team-pick"
						closedby="any"
						isOpen={logic.isPickWindowOpen}
						close={logic.closePickWindow}
					>
						<div className="window-title">
							{logic.pickWindowTitle}
							<button
								className="window-close"
								aria-label="Close"
								onClick={logic.closePickWindow}
							>
								×
							</button>
						</div>
						{logic.showPickWindowTiles ? (
							<>
								{/* Small grey line with the "N/N Toons" or "N/N Trinkets" button on its right,
								above the tiles */}
								<div className="team-drag-hint">
									<span />
									<button
										disabled={logic.areOwnedPicturesButtonsDisabled}
										title={logic.ownedPicturesButtonsTooltip}
										onClick={logic.openOwnedPicturesWindowFromPickWindow}
									>
										{logic.pickWindowOwnedPicturesButtonText}
									</button>
								</div>
								<div className="team-palette">
									{logic.pickWindowTiles.map((tile) => 'isSectionHeader' in tile ? (
										<div
											key={tile.key}
											className="team-palette-section-title"
										>
											{tile.text}
										</div>
									) : tile.src ? (
										<img
											key={tile.key}
											className="toon-or-trinket-picture"
											src={tile.src}
											title={tile.title}
											data-chosen={tile.isChosen}
											onClick={tile.pick}
										/>
									) : (
										<div
											key={tile.key}
											className="team-text"
											title={tile.title}
											data-chosen={tile.isChosen}
											onClick={tile.pick}
										>
											{tile.text}
										</div>
									))}
								</div>
							</>
						) : (
							<>
								<button
									id="team-pick-find-a-player"
									onClick={logic.pickFindAPlayer}
								>
									{logic.pickWindowFindAPlayerButtonText}
								</button>
								<ReservedSlotsGroupBoxes
									meChip={logic.reservedWindowMeChip}
									showVerifiedFriends={logic.showReservedWindowVerifiedFriends}
									verifiedFriendChips={logic.reservedWindowVerifiedFriendChips}
									unverifiedFriendChips={logic.reservedWindowUnverifiedFriendChips}
									copyInviteLinkButtonText={logic.copyInviteLinkButtonText}
									copyInviteLink={logic.copyInviteLink}
									addUnverifiedFriend={logic.addUnverifiedFriend}
								/>
							</>
						)}
					</ModalWindow>
					{/* My Toons or My Trinkets window in the middle of the screen, which the "N/N" buttons
					open, with a bold title above each category's grid of tiles. Every tile has a light grey
					tint and is slightly see-through, with a big ✅ behind an owned tile's picture and a red
					X behind a missing one's. */}
					<style>{`
						#team-owned-pictures-categories {
							max-height: 70dvh;
							overflow-y: auto;
						}
						.team-owned-pictures-category-title {
							margin: 6px 0 2px;
							font-weight: bold;
						}
						#team-owned-pictures .team-palette {
							max-height: none;
							overflow: visible;
							grid-template-columns: repeat(6, 48px);
						}
						.team-owned-pictures-tile {
							position: relative;
							width: 48px;
							height: 48px;
						}
						#team-owned-pictures .team-palette img {
							cursor: pointer;
						}
						.team-owned-pictures-missing-mark {
							position: absolute;
							inset: 0;
							pointer-events: none;
						}
						.team-owned-pictures-tile .toon-or-trinket-picture {
							position: relative;
							opacity: 0.6;
							filter: grayscale(0.7) brightness(1.3);
						}
						.team-owned-pictures-owned-mark {
							position: absolute;
							inset: 0;
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 40px;
							line-height: 1;
							pointer-events: none;
						}
					`}</style>
					<ModalWindow
						id="team-owned-pictures"
						closedby="any"
						isOpen={logic.isOwnedPicturesWindowOpen}
						close={logic.closeOwnedPicturesWindow}
					>
						{/* Title bar with a grey × button that closes the window */}
						<div className="window-title">
							{logic.ownedPicturesWindowTitle}
							<button
								className="window-close"
								aria-label="Close"
								onClick={logic.closeOwnedPicturesWindow}
							>
								×
							</button>
						</div>
						{/* Small grey "Click to mark as missing or owned" line */}
						<div className="team-drag-hint">{logic.ownedPicturesWindowHint}</div>
						<div id="team-owned-pictures-categories">
							{logic.ownedPicturesWindowCategories.map((category) => (
								<div key={category.title}>
									<div className="team-owned-pictures-category-title">
										{category.title}
									</div>
									<div className="team-palette">
										{category.tiles.map((tile) => (
											<div
												key={tile.name}
												className="team-owned-pictures-tile"
											>
												{/* Red X behind a missing tile's picture */}
												{tile.missingMarkSrc && (
													<img
														className="team-owned-pictures-missing-mark"
														src={tile.missingMarkSrc}
													/>
												)}
												{/* Big ✅ behind an owned tile's picture */}
												{tile.ownedMark && (
													<span className="team-owned-pictures-owned-mark">
														{tile.ownedMark}
													</span>
												)}
												<img
													className="toon-or-trinket-picture"
													src={tile.src}
													title={tile.title}
													data-missing={tile.isMissing}
													onClick={tile.toggle}
												/>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</ModalWindow>
					{/* Window in the middle of the screen that says the team is found, with a Click to join
					server button below the text, and the picture of everyone at the elevator sitting on top
					of the window */}
					<style>{`
						#team-found {
							max-width: min(760px, calc(100vw - 32px));
							overflow: visible;
							overflow-wrap: anywhere;
						}
						@media (max-width: 640px) {
							#team-found {
								max-width: calc(100vw - 16px);
							}
						}
						#team-found > img {
							position: absolute;
							bottom: 100%;
							left: 50%;
							translate: -50% 0;
							width: 33%;
							image-rendering: pixelated;
						}
						#team-found p {
							margin: 4px 0 0;
							text-align: center;
						}
						#team-found a {
							color: var(--link);
						}
						#team-found-settings .team-settings-tags {
							justify-content: center;
							margin: 6px 0;
						}
						#team-found-table {
							width: 100%;
							border-collapse: collapse;
							background: var(--field);
						}
						#team-found-table th,
						#team-found-table td {
							min-width: 60px;
							height: 44px;
							padding: 2px 6px;
							border: 1px solid var(--table-line);
							text-align: center;
						}
						#team-found-table th {
							height: 20px;
							background: var(--window-face);
						}
						#team-found-table img {
							width: 40px;
							height: 40px;
							vertical-align: middle;
						}
						#team-found-cards {
							display: none;
						}
						@media (max-width: 1320px) {
							#team-found-table {
								display: none;
							}
							#team-found-cards {
								max-height: 50vh;
								overflow-y: auto;
								display: flex;
								flex-direction: column;
								gap: 6px;
							}
						}
						.team-found-own-slot td,
						.team-found-own-slot .team-card-box {
							background: var(--joined-slot);
						}
						#team-found #team-found-join {
							display: block;
							width: fit-content;
							margin: 12px auto 8px;
							padding: 4px 24px;
							background: var(--window-face);
							color: var(--window-text);
							border: 2px solid;
							border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark)
								var(--bevel-light);
							box-shadow: inset -1px -1px var(--bevel-shadow);
							font-weight: bold;
							text-decoration: none;
						}
						#team-found #team-found-join:hover {
							background: var(--button-hover);
						}
						#team-found #team-found-join:active {
							border-color: var(--bevel-dark) var(--bevel-light) var(--bevel-light)
								var(--bevel-dark);
							box-shadow: none;
							translate: 1px 1px;
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
							src="/pixelated/Everyone_at_elevator.webp"
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
						{/* Centered text that says who joined whose team, with the host's username as a blue
						link to their Roblox profile */}
						<p>
							{logic.teamFoundText.beforeHost}
							{logic.teamFoundText.host && (
								<a
									href={logic.teamFoundText.hostProfileLink}
									target="_blank"
									rel="noreferrer"
								>
									{logic.teamFoundText.host}
								</a>
							)}
							{logic.teamFoundText.afterHost}
						</p>
						{/* Centered row of tags with the TEAM SETTINGS of the whole team */}
						<div id="team-found-settings">
							<TeamSettingsTags tags={logic.teamFoundSettingsTags} />
						</div>
						{/* White read-only table of the whole team, one row per slot, with Toon, Trinket A,
						Trinket B, Badges, Role and Player columns and grey placeholders, where the
						user's own row is light blue */}
						<table id="team-found-table">
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
								{logic.teamFoundRows.map((row) => (
									<tr
										key={row.key}
										className={row.slotClass}>
										{row.pictureCells.map((cell) => (
											<td key={cell.key}>
												{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
												{cell.picture && (
													<img
														className="toon-or-trinket-picture"
														src={cell.picture.src}
														title={cell.picture.title}
													/>
												)}
											</td>
										))}
										<td>
											{row.noBadgesText && (
												<span className="team-placeholder">{row.noBadgesText}</span>
											)}
											{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
										</td>
										<td>
											{row.noRolesText && (
												<span className="team-placeholder">{row.noRolesText}</span>
											)}
											{row.roleNames.map((name) => <div key={name}>{name}</div>)}
										</td>
										<td className="team-placeholder">{row.playerName}</td>
									</tr>
								))}
							</tbody>
						</table>
						{/* Column of read-only white cards that replaces the table on a narrow screen, one
						per slot with "Player Slot #N" above it, where the user's own card is light blue */}
						<div id="team-found-cards">
							{logic.teamFoundRows.map((row) => (
								<div
									key={row.key}
									className={row.slotClass}>
									<div className="team-card-title">{row.cardTitle}</div>
									<div className="team-card">
										{row.pictureCells.map((cell) => (
											<div
												key={cell.key}
												className="team-card-box team-card-picture-box">
												<span className="team-card-label">{cell.cardBoxLabel}</span>
												{cell.anyText && <span className="team-placeholder">{cell.anyText}</span>}
												{cell.picture && (
													<img
														className="toon-or-trinket-picture"
														src={cell.picture.src}
														title={cell.picture.title}
													/>
												)}
											</div>
										))}
										<div className="team-card-box">
											<span className="team-card-label">Badges</span>
											{row.noBadgesText && (
												<span className="team-placeholder">{row.noBadgesText}</span>
											)}
											{row.badgeNames.map((name) => <div key={name}>{name}</div>)}
										</div>
										<div className="team-card-box">
											<span className="team-card-label">Role</span>
											{row.noRolesText && (
												<span className="team-placeholder">{row.noRolesText}</span>
											)}
											{row.roleNames.map((name) => <div key={name}>{name}</div>)}
										</div>
										<div className="team-card-box">
											<span className="team-card-label">Player</span>
											<span className="team-placeholder">{row.playerName}</span>
										</div>
									</div>
								</div>
							))}
						</div>
						{/* Raised grey Click to join server button that opens the server in Roblox */}
						<a
							id="team-found-join"
							href={logic.teamServerLink}
							target="_blank"
							rel="noreferrer"
						>
							Click to join server
						</a>
					</ModalWindow>
					{/* Two white-on-black counters side by side at the bottom middle of the screen, or stacked in
					the bottom left corner of a phone */}
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
						@media (max-width: 640px) {
							#counters {
								left: 12px;
								translate: none;
								flex-direction: column;
								align-items: flex-start;
								gap: 4px;
							}
						}
					`}</style>
					<div id="counters">
						<span>{logic.onlineCounterText}</span>
						<span>{logic.findingPlayersCounterText}</span>
					</div>
					{/* Window colors and wallpaper, which the "Dark mode" checkbox of Options swaps
					for the Astro wallpaper and dark purple windows */}
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
							--joined-slot: #c4e4ff;
							--joined-slot-deeper: #93c8f5;
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
							--joined-slot: #3a3480;
							--joined-slot-deeper: #5048a8;
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
					`}</style>
				</>
			)
		})}
	</StrictMode>,
)
