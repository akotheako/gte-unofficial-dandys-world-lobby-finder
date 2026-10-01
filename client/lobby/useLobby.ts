import {
	useEffect,
	useState,
	type ChangeEvent,
	type DragEvent,
	type FormEvent,
	type MouseEvent,
	type SyntheticEvent,
} from 'react'
import { useSyncState } from '../useSyncState.ts'
import { allowBadgeDrop } from './allowBadgeDrop.ts'
import { allowItemDrop } from './allowItemDrop.ts'
import { checkUsername } from './checkUsername.ts'
import { closeHowto } from './closeHowto.ts'
import { closeWindow } from './closeWindow.ts'
import { copyCode } from './copyCode.ts'
import { dragBadge } from './dragBadge.ts'
import { dragFromPalette } from './dragFromPalette.ts'
import { dragItem } from './dragItem.ts'
import { dropBadge } from './dropBadge.ts'
import { dropBadgeOutside } from './dropBadgeOutside.ts'
import { dropItem } from './dropItem.ts'
import { dropItemOutside } from './dropItemOutside.ts'
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
	const [initialState] = useState((): LobbyState => ({
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
	const {
		asyncState: state,
		getSyncState,
		setState,
		mutateState,
	} = useSyncState(initialState)

	useEffect(() => loadImages({ setState }), [setState])
	useEffect(() => startHeartbeat({ setState }), [setState])
	useEffect(() => startFindingCountDrift({
		setState,
		mutateState,
	}), [setState, mutateState])
	useEffect(() => loadRobloxSession({ setState }), [setState])
	const verified = Boolean(state.roblox)
	useEffect(() => {
		if (verified) loadBadges({ setState })
		else loadCode({ setState })
	}, [verified, setState])
	// mutateState keeps the team array's identity while editing its rows, so this runs on every render
	useEffect(() => saveTeam({ team: state.team }))

	return {
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
		username: state.roblox?.username ?? '',
		showBadgeChecklist: Boolean(state.badges),
		badgeChecklist: (state.badges ?? []).map((badge) => ({
			name: badge.name,
			mark: badge.owned ? '✅' : '⬜',
		})),
		badgesMessage: state.error || 'Loading badges...',
		refreshBadges: () => refreshBadges({ setState }),
		logOut: () => logOut({ setState }),
		code: state.code,
		copyCode: () => copyCode({ getSyncState }),
		savedUsername: state.savedUsername,
		checkUsername: (event: FormEvent<HTMLFormElement>) => checkUsername({
			setState,
			event,
		}),
		error: state.error,

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
		dragLeaveEmptyToon: (event: DragEvent) => dragFromPalette({
			event,
			kind: 'toon',
			name: '(Leave Empty)',
		}),
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
		ownedBadges: (state.badges ?? []).filter((badge) => badge.owned).map((badge) => ({
			name: badge.name,
			drag: (event: DragEvent) => dragFromPalette({
				event,
				kind: 'badge',
				name: badge.name,
			}),
		})),
		teamRows: state.team.map((row, index) => ({
			key: index,
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
				placeholder: column === 'toon' && !row[column] ? '(Any)' : '',
				item: row[column] ? {
					text: row[column] === '(Leave Empty)' ? '(Leave Empty)' : '',
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
			allowBadgeDrop: (event: DragEvent) => allowBadgeDrop({
				getSyncState,
				event,
			}),
			dropBadge: (event: DragEvent) => dropBadge({
				mutateState,
				event,
				index,
			}),
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
			findingPlayer: state.finding && !row.reserved && row.toon !== '(Leave Empty)',
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
		savedServerLink: state.savedServerLink,
		serverLinkReadOnly: state.finding,
		saveServerLink: (event: ChangeEvent<HTMLInputElement>) => saveServerLink({ event }),
		openHowto,
		closeHowto,
		findPlayers: (event: FormEvent<HTMLFormElement>) => findPlayers({
			getSyncState,
			setState,
			event,
		}),
		findButtonLabel: state.finding ? 'Finding Players (Click to Cancel)' : 'Find Players',
		teamError: state.teamError,

		onlineCount: state.onlineCount,
		findingCount: state.findingCount,
	}
}
