import {
	useEffect,
	type ChangeEvent,
	type DragEvent,
	type FormEvent,
	type MouseEvent,
	type SyntheticEvent,
} from 'react'
import { useSyncState } from '../useSyncState.ts'
import { allowBadgeDrop } from './allowBadgeDrop.ts'
import { allowDisableDrop } from './allowDisableDrop.ts'
import { allowItemDrop } from './allowItemDrop.ts'
import { checkUsername } from './checkUsername.ts'
import { closeHowto } from './closeHowto.ts'
import { closeWindow } from './closeWindow.ts'
import { copyCode } from './copyCode.ts'
import { disableRow } from './disableRow.ts'
import { dragBadge } from './dragBadge.ts'
import { dragFromPalette } from './dragFromPalette.ts'
import { dragItem } from './dragItem.ts'
import { dropBadge } from './dropBadge.ts'
import { dropBadgeOutside } from './dropBadgeOutside.ts'
import { dropItem } from './dropItem.ts'
import { dropItemOutside } from './dropItemOutside.ts'
import { enableRow } from './enableRow.ts'
import { findPlayers } from './findPlayers.ts'
import { loadBadges } from './loadBadges.ts'
import { loadCode } from './loadCode.ts'
import { loadImages } from './loadImages.ts'
import { loadRobloxSession } from './loadRobloxSession.ts'
import { logOut } from './logOut.ts'
import { openHowto } from './openHowto.ts'
import { openWindow } from './openWindow.ts'
import { readSavedTeam } from './readSavedTeam.ts'
import { refreshBadges } from './refreshBadges.ts'
import { requestCloseWindow } from './requestCloseWindow.ts'
import { saveServerLink } from './saveServerLink.ts'
import { saveTeam } from './saveTeam.ts'
import { startFindingCountDrift } from './startFindingCountDrift.ts'
import { startHeartbeat } from './startHeartbeat.ts'
import { toggleReserved } from './toggleReserved.ts'

export type Roblox = {
	id: number
	username: string
}

export type Badge = {
	name: string
	owned: boolean
}

export type Column = 'toon' | 'trinketA' | 'trinketB'

export type Row = {
	toon: string
	trinketA: string
	trinketB: string
	badges: string[]
	reserved: boolean
	disabled: boolean
}

type LobbyState = {
	roblox: Roblox | null
	code: string
	error: string
	badges: Badge[] | null
	savedUsername: string
	team: Row[]
	toons: string[]
	trinkets: string[]
	savedServerLink: string
	teamError: string
	finding: boolean
	onlineCount: number
	findingCount: number
}

export type Lobby = ReturnType<typeof useSyncState<LobbyState>>

export function useLobby() {
	const {
		asyncState: state,
		getSyncState,
		setState,
		mutateState,
	} = useSyncState((): LobbyState => ({
		roblox: null,
		code: '',
		error: '',
		badges: null,
		savedUsername: localStorage.getItem('robloxUsername') ?? '',
		team: readSavedTeam(),
		toons: [],
		trinkets: [],
		savedServerLink: localStorage.getItem('serverLink') ?? '',
		teamError: '',
		finding: false,
		onlineCount: 0,
		findingCount: 0,
	}))

	// Fills the Toons and Trinkets side windows with pictures
	useEffect(() => loadImages({ setState }), [setState])

	// Keeps the "on this page" counter at the bottom of the screen up to date
	useEffect(() => startHeartbeat({ setState }), [setState])

	// Keeps the "finding players" counter at the bottom of the screen up to date
	useEffect(() => startFindingCountDrift({
		setState,
		mutateState,
	}), [setState, mutateState])

	// Decides whether Roblox Verification opens on "Verified as <name>" or on the instructions
	useEffect(() => loadRobloxSession({ setState }), [setState])
	const verified = Boolean(state.roblox)

	// Fills the badge checklist once verified, or the emoji code next to Copy otherwise
	useEffect(() => {
		if (verified) loadBadges({ setState })
		else loadCode({ setState })
	}, [verified, setState])

	// Remembers the Find a Team table across reloads

	// mutateState keeps the team array's identity while editing its rows, so this runs on every render
	useEffect(() => saveTeam({ team: state.team }))

	return {

		// Roblox Verification icon, first in the row at the top of the screen, and its window
		accountWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => openWindow({
				id: 'account',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => closeWindow({
				id: 'account',
				event,
			}),
			onCloseClick: () => requestCloseWindow({ id: 'account' }),
		},
		verified,


		// Verified view of Roblox Verification: "Verified as <name>" and the badge checklist,

		// with Update Badges at the bottom left and Log out at the bottom right
		username: state.roblox?.username ?? '',
		showBadgeChecklist: Boolean(state.badges),
		badgeChecklist: (state.badges ?? []).map((badge) => ({
			name: badge.name,
			mark: badge.owned ? '✅' : '⬜',
		})),
		badgesMessage: state.error || 'Loading badges...',
		refreshBadges: () => refreshBadges({ setState }),
		logOut: () => logOut({ setState }),


		// Unverified view of Roblox Verification: the emoji code with Copy, then the username

		// field with Check and any error below it
		code: state.code,
		copyCode: () => copyCode({ getSyncState }),
		savedUsername: state.savedUsername,
		checkUsername: (event: FormEvent<HTMLFormElement>) => checkUsername({
			setState,
			event,
		}),
		error: state.error,


		// Find a Team icon, second in the row at the top of the screen, and its window
		teamWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => openWindow({
				id: 'team',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => closeWindow({
				id: 'team',
				event,
			}),
			onCloseClick: () => requestCloseWindow({ id: 'team' }),
		},

		// Greys out the Toons, Trinkets and Badges side windows while searching
		paletteWindowClass: state.finding ? 'window team-locked' : 'window',

		// "(Leave Empty)" tile, first in the Toons side window to the lower left
		dragLeaveEmpty: (event: DragEvent) => dragFromPalette({
			event,
			kind: 'disable',
			name: '(Leave Empty)',
		}),

		// Toon pictures in the Toons side window to the lower left
		toonPalette: state.toons.map((name) => ({
			name,
			src: `/toons/${name}`,
			title: name.replace('.png', ''),
			drag: (event: DragEvent) => dragFromPalette({
				event,
				kind: 'toon',
				name,
			}),
		})),

		// Trinket pictures in the Trinkets side window to the upper right
		trinketPalette: state.trinkets.map((name) => ({
			name,
			src: `/trinkets/${name}`,
			title: name.replace('.png', ''),
			drag: (event: DragEvent) => dragFromPalette({
				event,
				kind: 'trinket',
				name,
			}),
		})),

		// Badge names in the Badges side window below Trinkets, shown only once verified
		ownedBadges: (state.badges ?? []).filter((badge) => badge.owned).map((badge) => ({
			name: badge.name,
			drag: (event: DragEvent) => dragFromPalette({
				event,
				kind: 'badge',
				name: badge.name,
			}),
		})),

		// Rows of the white table in the middle of Find a Team
		teamRows: state.team.map((row, index) => ({
			key: index,

			// Dropping "(Leave Empty)" anywhere on the row
			allowDisableDrop: (event: DragEvent) => allowDisableDrop({
				getSyncState,
				event,
			}),
			disableRow: (event: DragEvent) => disableRow({
				mutateState,
				event,
				index,
			}),

			// Grey "(Leave Empty)" cell that spans the whole row and clears when clicked
			disabled: row.disabled,
			disabledColSpan: verified ? 5 : 4,
			disabledCellClass: state.finding ? 'team-disabled' : 'team-disabled team-clickable',
			enableRow: () => enableRow({
				getSyncState,
				mutateState,
				index,
			}),

			// Toon, Trinket A and Trinket B cells, the first three columns of the row
			itemCells: (['toon', 'trinketA', 'trinketB'] as const).map((column) => ({
				column,
				allowDrop: (event: DragEvent) => allowItemDrop({
					getSyncState,
					event,
					column,
				}),
				drop: (event: DragEvent) => dropItem({
					mutateState,
					event,
					index,
					column,
				}),

				// Grey "(Any)" text in an empty Toon cell
				placeholder: column === 'toon' && !row[column] ? '(Any)' : '',

				// Picture inside the cell, which drags to another cell or out of the table to clear it
				item: row[column] ? {
					src: `/${column === 'toon' ? 'toons' : 'trinkets'}/${row[column]}`,
					title: row[column].replace('.png', ''),
					draggable: !state.finding,
					drag: (event: DragEvent) => dragItem({
						getSyncState,
						event,
						index,
						column,
					}),
					dropOutside: (event: DragEvent) => dropItemOutside({
						mutateState,
						event,
						index,
						column,
					}),
				} : null,
			})),

			// Badges cell, the fourth column, shown only once verified
			allowBadgeDrop: (event: DragEvent) => allowBadgeDrop({
				getSyncState,
				event,
			}),
			dropBadge: (event: DragEvent) => dropBadge({
				mutateState,
				event,
				index,
			}),

			// Badge names stacked in that cell, which drag to another row or out of the table
			badges: row.badges.map((name) => ({
				name,
				draggable: !state.finding,
				drag: (event: DragEvent) => dragBadge({
					event,
					index,
					name,
				}),
				dropOutside: (event: DragEvent) => dropBadgeOutside({
					mutateState,
					event,
					index,
					name,
				}),
			})),

			// Last column: the Reserved checkbox, or while searching either "Finding player..."

			// or the grey reserved label
			findingPlayer: state.finding && !row.reserved && !row.disabled,
			showReservedLabel: state.finding && row.reserved,
			reservedLabel: state.roblox
				? `(@${state.roblox.username} or their friends)`
				: '(Reserved)',
			showReservedCheckbox: !state.finding,
			reserved: row.reserved,
			toggleReserved: (event: ChangeEvent<HTMLInputElement>) => toggleReserved({
				mutateState,
				event,
				index,
			}),
		})),

		// Header of the last table column
		reservedHeading: state.finding ? 'Player' : 'Reserved',


		// "Server link:" field below the table
		savedServerLink: state.savedServerLink,
		serverLinkReadOnly: state.finding,
		saveServerLink: (event: ChangeEvent<HTMLInputElement>) => saveServerLink({ event }),

		// "How do I get a server link?" link below the field, and the × of the screenshot window

		// that it opens
		openHowto,
		closeHowto,

		// Find Players button at the bottom right of Find a Team, with its spinner and the red

		// error line below it
		findPlayers: (event: FormEvent<HTMLFormElement>) => findPlayers({
			getSyncState,
			setState,
			event,
		}),
		findButtonLabel: state.finding ? 'Finding Players (Click to Cancel)' : 'Find Players',
		showFindingSpinner: state.finding,
		teamError: state.teamError,


		// Two counters at the bottom middle of the screen
		onlineCount: state.onlineCount,
		findingCount: state.findingCount,
	}
}
