import { StrictMode, createElement, useEffect, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

// Desktop icon that opens an old-style grey window with a navy title bar and an × button
function DesktopWindow({
	id,
	title,
	left,
	image,
	children,
}: {
	id: string
	title: string
	left: number
	image: string
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
				#${id}-icon {
					left: ${left}px;
				}
			`}</style>
			<button
				id={`${id}-icon`}
				className="window-icon"
				onClick={(event) => {
					const dialog = document.getElementById(id) as HTMLDialogElement
					if (dialog.open) return
					// Only one window is open at a time, so any other window shrinks back into its icon
					for (const other of document.querySelectorAll<HTMLDialogElement>('dialog.window[open]')) {
						other.requestClose()
					}
					// show() instead of showModal() leaves out the dark backdrop and keeps the page clickable
					dialog.show()
					// The window grows out of the icon, starting at its position and size
					const from = event.currentTarget.getBoundingClientRect()
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
				}}
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
				// Esc and × land here, and the window shrinks into the icon before closing
				onCancel={(event) => {
					event.preventDefault()
					const dialog = event.currentTarget
					const from = dialog.getBoundingClientRect()
					const icon = document.getElementById(`${id}-icon`)!
					const to = icon.getBoundingClientRect()
					dialog.animate([
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
					}).onfinish = () => dialog.close()
				}}
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
						onClick={() => (
							document.getElementById(id) as HTMLDialogElement
						).requestClose()}
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
			const [roblox, setRoblox] = useState<{
				id: number
				username: string
			} | null>(null)
			const [code, setCode] = useState('')
			const [error, setError] = useState('')
			const [badges, setBadges] = useState<{
				name: string
				owned: boolean
			}[] | null>(null)
			const [team, setTeam] = useState<{
				toon: string
				trinketA: string
				trinketB: string
				badges: string[]
				reserved: boolean
			}[]>(() => (
				JSON.parse(localStorage.getItem('team') ?? 'null') ?? Array.from({ length: 8 }, () => ({}))
			).map((row: object) => ({
				toon: '',
				trinketA: '',
				trinketB: '',
				badges: [],
				reserved: false,
				...row,
			})))
			useEffect(() => localStorage.setItem('team', JSON.stringify(team)), [team])
			const [toons, setToons] = useState<string[]>([])
			const [trinkets, setTrinkets] = useState<string[]>([])
			useEffect(() => {
				fetch('/api/images/toons')
					.then((res) => res.json())
					.then(setToons)
				fetch('/api/images/trinkets')
					.then((res) => res.json())
					.then(setTrinkets)
			}, [])
			const [teamError, setTeamError] = useState('')
			const [finding, setFinding] = useState(false)
			const [onlineCount, setOnlineCount] = useState(0)
			useEffect(() => {
				const id = crypto.randomUUID()
				const beat = () => fetch('/api/online', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id }),
				})
					.then((res) => res.json())
					.then((data: { count: number }) => setOnlineCount(data.count))
				beat()
				const interval = setInterval(beat, 15_000)
				return () => clearInterval(interval)
			}, [])
			// Placeholder number until finding players works for real
			const [findingCount, setFindingCount] = useState(() => 3 + Math.floor(Math.random() * 6))
			useEffect(() => {
				const interval = setInterval(() => setFindingCount((count) => (
					Math.max(1, count + Math.floor(Math.random() * 3) - 1)
				)), 15_000)
				return () => clearInterval(interval)
			}, [])
			useEffect(() => {
				fetch('/api/roblox/me')
					.then((res) => res.json())
					.then(setRoblox)
			}, [])
			useEffect(() => {
				if (roblox) {
					fetch('/api/roblox/badges')
						.then(async (res) => {
							const data = await res.json()
							if (res.ok) setBadges(data)
							else setError(data.error)
						})
					return
				}
				fetch('/api/roblox/code')
					.then((res) => res.json())
					.then((data: { code: string }) => setCode(data.code))
			}, [roblox])
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
					<DesktopWindow
						id="account"
						title="Roblox Verification"
						left={12}
						image="/Gossip_Bud.webp"
					>
						{roblox ? (
							// "Verified as <name>", the badge checklist, and Update Badges and Log out buttons
							<>
								<p>Verified as {roblox.username}</p>
								{/* Dandy's World badge checklist, "Loading badges...", or an error */}
								<style>{`
									#account-badges {
										width: fit-content;
										margin: 1em auto;
										padding: 0;
										list-style: none;
									}
								`}</style>
								{badges ? (
									<ul id="account-badges">
										{badges.map((badge) => (
											<li key={badge.name}>
												{badge.owned ? '✅' : '⬜'} {badge.name}
											</li>
										))}
									</ul>
								) : (
									<p>{error || 'Loading badges...'}</p>
								)}
								{/* Update Badges button on the left and Log out on the right, away from the × button */}
								<style>{`
									#account-actions {
										display: flex;
										justify-content: space-between;
									}
								`}</style>
								<div id="account-actions">
									<button onClick={async () => {
										setBadges(null)
										setError('')
										const res = await fetch('/api/roblox/badges?refresh')
										const data = await res.json()
										if (res.ok) setBadges(data)
										else setError(data.error)
									}}
									>
										Update Badges
									</button>
									<button onClick={async () => {
										await fetch('/api/roblox/logout', { method: 'POST' })
										setRoblox(null)
										setBadges(null)
									}}
									>
										Log out
									</button>
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
										value={code}
										readOnly
										tabIndex={-1}
									/>
									<button onClick={() => navigator.clipboard.writeText(code)}>
										Copy
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
									onSubmit={async (event) => {
										event.preventDefault()
										const username = new FormData(event.currentTarget).get('username') as string
										localStorage.setItem('robloxUsername', username)
										const res = await fetch('/api/roblox/check', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({ username }),
										})
										const data = await res.json()
										setError(res.ok ? '' : data.error)
										if (res.ok) setRoblox(data)
									}}
								>
									<input
										name="username"
										defaultValue={localStorage.getItem('robloxUsername') ?? ''}
										placeholder="Roblox username"
										required
									/>
									<button>Check</button>
									<p>{error}</p>
								</form>
							</>
						)}
					</DesktopWindow>
					<DesktopWindow
						id="team"
						title="Find a Team"
						left={132}
						image="/All_Together.webp"
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
							.team-palette .team-any {
								width: 48px;
								height: 48px;
								cursor: grab;
							}
							.team-any {
								display: flex;
								align-items: center;
								justify-content: center;
								font-size: 11px;
							}
						`}</style>
						{/* Toons window to the lower left, whose toons drag into the Toon column */}
						<div
							id="team-toons"
							className="window"
						>
							<div className="window-title">Toons</div>
							<div className="team-palette">
								{/* "(Any)" text tile before the toon pictures */}
								<div
									className="team-any"
									draggable
									onDragStart={(event) => event.dataTransfer.setData('toon', '(Any)')}
								>
									(Any)
								</div>
								{toons.map((name) => (
									<img
										key={name}
										src={`/toons/${name}`}
										title={name.replace('.png', '')}
										draggable
										onDragStart={(event) => event.dataTransfer.setData('toon', name)}
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
								{trinkets.map((name) => (
									<img
										key={name}
										src={`/trinkets/${name}`}
										title={name.replace('.png', '')}
										draggable
										onDragStart={(event) => event.dataTransfer.setData('trinket', name)}
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
						{roblox && (
							<div
								id="team-badges"
								className="window"
							>
								<div className="window-title">Badges</div>
								<ul>
									{badges?.filter((badge) => badge.owned).map((badge) => (
										<li
											key={badge.name}
											draggable
											onDragStart={(event) => event.dataTransfer.setData('badge', badge.name)}
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
									{roblox && <th>Badges</th>}
									<th>Reserved</th>
								</tr>
							</thead>
							<tbody>
								{team.map((row, index) => (
									<tr key={index}>
										{(['toon', 'trinketA', 'trinketB'] as const).map((column) => (
											<td
												key={column}
												onDragOver={(event) => {
													const kind = column === 'toon' ? 'toon' : 'trinket'
													if (!finding && event.dataTransfer.types.includes(kind)) event.preventDefault()
												}}
												onDrop={(event) => {
													const kind = column === 'toon' ? 'toon' : 'trinket'
													const name = event.dataTransfer.getData(kind)
													const from = event.dataTransfer.getData('from')
													if (from === `${index} ${column}`) return
													// A row cannot hold the same trinket twice, unless it is moving between the two columns
													const otherTrinket = {
														toon: '',
														trinketA: 'trinketB',
														trinketB: 'trinketA',
													}[column] as 'trinketA' | 'trinketB' | ''
													if (
														otherTrinket
														&& row[otherTrinket] === name
														&& from !== `${index} ${otherTrinket}`
													) return
													setTeam((current) => current.map((other, otherIndex) => ({
														...other,
														// An image dragged from another cell moves out of that cell
														...(from.startsWith(`${otherIndex} `) && {
															[from.split(' ')[1]]: '',
														}),
														...(otherIndex === index && {
															[column]: name,
														}),
													})))
												}}
											>
												{/* Toon or trinket picture, or "(Any)" as text */}
												{row[column] && (
													<div
														className="team-any"
														draggable={!finding}
														onDragStart={(event) => {
															const kind = column === 'toon' ? 'toon' : 'trinket'
															event.dataTransfer.setData(kind, row[column])
															event.dataTransfer.setData('from', `${index} ${column}`)
														}}
														// Dropped anywhere that is not a matching cell, the image leaves the table
														onDragEnd={(event) => {
															if (event.dataTransfer.dropEffect !== 'none') return
															setTeam((current) => current.map((other, otherIndex) => (
																otherIndex === index
																	? {
																		...other,
																		[column]: '',
																	}
																	: other
															)))
														}}
													>
														{row[column] === '(Any)' ? '(Any)' : (
															<img
																src={`/${column === 'toon' ? 'toons' : 'trinkets'}/${row[column]}`}
																title={row[column].replace('.png', '')}
																draggable={false}
															/>
														)}
													</div>
												)}
											</td>
										))}
										{/* Badge names stacked in the cell, each one draggable to another row or out of the table */}
										{roblox && (
											<td
												onDragOver={(event) => {
													if (!finding && event.dataTransfer.types.includes('badge')) event.preventDefault()
												}}
												onDrop={(event) => {
													const name = event.dataTransfer.getData('badge')
													const from = event.dataTransfer.getData('from')
													if (from === `${index} badges`) return
													// A row holds one badge per category, so a new badge replaces its category's old one
													const category = [
														['Speed Walker', 'Long Distance Runner', 'Marathon Runner'],
														['Machine Enthusiast', 'Machine Master', 'THE Machine'],
														['Clocked In', 'Overtime'],
														['Hissy Fit'],
														['Just Keep Swimming'],
														['Double Digits!', 'Skilled Toon!', 'Super Skilled Pro!', 'Twisteds Fear Me.'],
													].find((names) => names.includes(name)) ?? [name]
													setTeam((current) => current.map((other, otherIndex) => ({
														...other,
														...(from === `${otherIndex} badges` && {
															badges: other.badges.filter((badge) => badge !== name),
														}),
														...(otherIndex === index && {
															badges: [
																...other.badges.filter((badge) => !category.includes(badge)),
																name,
															],
														}),
													})))
												}}
											>
												{row.badges.map((name) => (
													<div
														key={name}
														className="team-badge"
														draggable={!finding}
														onDragStart={(event) => {
															event.dataTransfer.setData('badge', name)
															event.dataTransfer.setData('from', `${index} badges`)
														}}
														// Dropped anywhere that is not a Badges cell, the badge leaves the table
														onDragEnd={(event) => {
															if (event.dataTransfer.dropEffect !== 'none') return
															setTeam((current) => current.map((other, otherIndex) => (
																otherIndex === index
																	? {
																		...other,
																		badges: other.badges.filter((badge) => badge !== name),
																	}
																	: other
															)))
														}}
													>
														{name}
													</div>
												))}
											</td>
										)}
										{/* Reserved checkbox, or "Finding player..." with blinking dots while searching */}
										<td>
											{finding && !row.reserved ? (
												row.toon && (
													<span className="team-finding">
														Finding player<span>...</span>
													</span>
												)
											) : (
												<input
													type="checkbox"
													checked={row.reserved}
													disabled={finding}
													onChange={(event) => setTeam(team.map((other, otherIndex) => (otherIndex === index
														? {
															...other,
															reserved: event.target.checked,
														}
														: other
													)))}
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
							#team-form input {
								width: 420px;
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
							onSubmit={(event) => {
								event.preventDefault()
								if (finding) {
									setFinding(false)
									return
								}
								const serverLink = new FormData(event.currentTarget).get('serverLink') as string
								console.log({
									team,
									serverLink,
								})
								if (!team.some((row) => row.toon && !row.reserved)) {
									setTeamError('At least 1 non-empty & non-reserved row is needed to start finding players!')
								} else if (!team.some((row) => row.toon && row.reserved)) {
									setTeamError('At least 1 non-empty reserved row (You!) is needed to start finding players!')
								} else if (!serverLink.trim()) {
									setTeamError('A server link is needed!')
								} else if (!/^https:\/\/www\.roblox\.com\/share\?code=[0-9a-f]{32}&type=Server$/i
									.test(serverLink.trim())) {
									setTeamError('The server link is invalid!')
								} else {
									setTeamError('')
									setFinding(true)
								}
							}}
						>
							<label>
								Server link:{' '}
								<input
									name="serverLink"
									defaultValue={localStorage.getItem('serverLink') ?? ''}
									readOnly={finding}
									onChange={(event) => localStorage.setItem('serverLink', event.target.value)}
								/>
							</label>
							<div id="team-form-actions">
								<a onClick={() => (document.getElementById('team-howto') as HTMLDialogElement).show()}>
									How do I get a server link?
								</a>
								<button>{finding ? 'Finding Players (Click to Cancel)' : 'Find Players'}</button>
							</div>
							<p id="team-form-error">{teamError}</p>
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
									onClick={() => (document.getElementById('team-howto') as HTMLDialogElement).close()}
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
						<span>{onlineCount} on this page</span>
						<span>{findingCount} finding players</span>
					</div>
				</>
			)
		})}
	</StrictMode>,
)
