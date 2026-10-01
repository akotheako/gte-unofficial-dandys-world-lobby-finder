import {
	StrictMode,
	createElement,
	type MouseEventHandler,
	type ReactEventHandler,
	type ReactNode,
} from 'react'
import { createRoot } from 'react-dom/client'
import { useLobby } from './lobby/useLobby.ts'

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

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* Desktop with the Roblox Verification and Find a Team icons and their windows */}
		{createElement(() => {
			const lobby = useLobby()
			return (
				<>
					{/* Hidden filter that makes the icon pictures blocky and reduces them to a few colors */}
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
						{...lobby.accountWindow}
					>
						{lobby.verified ? (
							// "Verified as <name>", the badge checklist, and Update Badges and Log out buttons
							<>
								<p>Verified as {lobby.username}</p>
								{/* Dandy's World badge checklist, "Loading badges...", or an error */}
								<style>{`
									#account-badges {
										width: fit-content;
										margin: 1em auto;
										padding: 0;
										list-style: none;
									}
								`}</style>
								{lobby.showBadgeChecklist ? (
									<ul id="account-badges">
										{lobby.badgeChecklist.map((badge) => (
											<li key={badge.name}>
												{badge.mark} {badge.name}
											</li>
										))}
									</ul>
								) : (
									<p>{lobby.badgesMessage}</p>
								)}
								{/* Update Badges button on the left and Log out on the right, away from the × button */}
								<style>{`
									#account-actions {
										display: flex;
										justify-content: space-between;
									}
								`}</style>
								<div id="account-actions">
									<button onClick={lobby.refreshBadges}>Update Badges</button>
									<button onClick={lobby.logOut}>Log out</button>
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
										value={lobby.code}
										readOnly
										tabIndex={-1}
									/>
									<button onClick={lobby.copyCode}>Copy</button>
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
									onSubmit={lobby.checkUsername}
								>
									<input
										name="username"
										defaultValue={lobby.savedUsername}
										placeholder="Roblox username"
										required
									/>
									<button>Check</button>
									<p>{lobby.error}</p>
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
						{...lobby.teamWindow}
					>
						{/* Side windows that hang outside this window's edges */}
						<style>{`
							#team {
								overflow: visible;
							}
							#team-toons,
							#team-trinkets,
							#team-badges {
								position: absolute;
							}
							#team-toons {
								right: calc(100% + 24px);
								top: 180px;
							}
							#team-trinkets {
								left: calc(100% + 24px);
								top: -60px;
							}
							#team-badges {
								left: calc(100% + 24px);
								top: 380px;
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
							.team-placeholder {
								color: #a8a8a8;
								cursor: default;
							}
						`}</style>
						{/* Toons window to the lower left, whose toons drag into the Toon column */}
						<div
							id="team-toons"
							className="window"
						>
							<div className="window-title">Toons</div>
							<div className="team-palette">
								{/* "(Leave Empty)" text tile before the toon pictures */}
								<div
									className="team-text"
									draggable
									onDragStart={lobby.dragLeaveEmptyToon}
								>
									(Leave Empty)
								</div>
								{lobby.toonPalette.map((toon) => (
									<img
										key={toon.name}
										src={toon.src}
										title={toon.title}
										draggable
										onDragStart={toon.drag}
									/>
								))}
							</div>
						</div>
						{/* Trinkets window to the upper right, whose trinkets drag into the Trinket columns */}
						<div
							id="team-trinkets"
							className="window"
						>
							<div className="window-title">Trinkets</div>
							<div className="team-palette">
								{lobby.trinketPalette.map((trinket) => (
									<img
										key={trinket.name}
										src={trinket.src}
										title={trinket.title}
										draggable
										onDragStart={trinket.drag}
									/>
								))}
							</div>
						</div>
						{/* Badges window below Trinkets, listing the owned badges that drag into the Badges column */}
						<style>{`
							#team-badges ul {
								max-height: 200px;
								overflow-y: auto;
								margin: 0;
								padding: 4px;
								list-style: none;
								background: #fff;
								border: 2px solid;
								border-color: #808080 #fff #fff #808080;
							}
							#team-badges li,
							.team-badge {
								cursor: grab;
								white-space: nowrap;
							}
							#team-badges li:hover,
							.team-badge:hover {
								background: #e0e0e0;
							}
						`}</style>
						{lobby.verified && (
							<div
								id="team-badges"
								className="window"
							>
								<div className="window-title">Badges</div>
								<ul>
									{lobby.ownedBadges.map((badge) => (
										<li
											key={badge.name}
											draggable
											onDragStart={badge.drag}
										>
											{badge.name}
										</li>
									))}
								</ul>
							</div>
						)}
						{/* White table with Toon, Trinket A, Trinket B and, once verified, Badges columns */}
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
							#team-table th {
								height: 20px;
								background: #c0c0c0;
							}
							#team-table input {
								width: 13px;
								height: 13px;
								margin: 0;
								appearance: none;
								background: #fff center no-repeat;
								border: 2px solid;
								border-color: #808080 #fff #fff #808080;
								box-shadow: inset 1px 1px #000;
								vertical-align: middle;
							}
							#team-table input:active {
								background-color: #c0c0c0;
							}
							#team-table input:checked {
								background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='7' height='7'><path d='M0 2h1v1h1v1h1v-1h1v-1h1v-1h1v-1h1v3h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1z' fill='black'/></svg>");
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
									{lobby.verified && <th>Badges</th>}
									<th>Reserved</th>
								</tr>
							</thead>
							<tbody>
								{lobby.teamRows.map((row) => (
									<tr key={row.key}>
										{row.itemCells.map((cell) => (
											<td
												key={cell.column}
												onDragOver={cell.allowDrop}
												onDrop={cell.drop}
											>
												{/* Grey "(Any)" text in an empty Toon cell, which cannot be dragged */}
												{cell.placeholder && (
													<div className="team-text team-placeholder">
														{cell.placeholder}
													</div>
												)}
												{/* Toon or trinket picture, or "(Leave Empty)" as text */}
												{cell.item && (
													<div
														className="team-text"
														draggable={cell.item.draggable}
														onDragStart={cell.item.drag}
														onDragEnd={cell.item.dropOutside}
													>
														{cell.item.text || (
															<img
																src={cell.item.src}
																title={cell.item.title}
																draggable={false}
															/>
														)}
													</div>
												)}
											</td>
										))}
										{/* Badge names stacked in the cell, each one draggable to another row or out of the table */}
										{lobby.verified && (
											<td
												onDragOver={row.allowBadgeDrop}
												onDrop={row.dropBadge}
											>
												{row.badges.map((badge) => (
													<div
														key={badge.name}
														className="team-badge"
														draggable={badge.draggable}
														onDragStart={badge.drag}
														onDragEnd={badge.dropOutside}
													>
														{badge.name}
													</div>
												))}
											</td>
										)}
										{/* Reserved checkbox, or while searching either "Finding player..." with blinking
										dots or "(Reserved)" */}
										<td>
											{row.findingPlayer && (
												<span className="team-finding">
													Finding player<span>...</span>
												</span>
											)}
											{row.showReservedLabel && (
												<span className="team-finding">{row.reservedLabel}</span>
											)}
											{row.showReservedCheckbox && (
												<input
													type="checkbox"
													checked={row.reserved}
													onChange={row.toggleReserved}
												/>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{/* "Server link:" field, with a help link on the left and Find Players on the right */}
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
							#team-form-actions {
								display: flex;
								justify-content: space-between;
								align-items: center;
							}
							#team-form-error {
								margin: 0;
								color: #a00;
							}
							#team-form-actions a {
								color: #00e;
								text-decoration: underline;
								cursor: pointer;
							}
						`}</style>
						<form
							id="team-form"
							onSubmit={lobby.findPlayers}
						>
							<label>
								Server link:
								<input
									name="serverLink"
									type="password"
									defaultValue={lobby.savedServerLink}
									readOnly={lobby.serverLinkReadOnly}
									onChange={lobby.saveServerLink}
								/>
							</label>
							<div id="team-form-actions">
								<a onClick={lobby.openHowto}>How do I get a server link?</a>
								<button>{lobby.findButtonLabel}</button>
							</div>
							<p id="team-form-error">{lobby.teamError}</p>
						</form>
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
									onClick={lobby.closeHowto}
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
						<span>{lobby.onlineCount} on this page</span>
						<span>{lobby.findingCount} finding players</span>
					</div>
				</>
			)
		})}
	</StrictMode>,
)
