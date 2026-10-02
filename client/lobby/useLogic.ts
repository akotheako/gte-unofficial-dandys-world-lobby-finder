import {
	useEffect,
	type ChangeEvent,
	type DragEvent,
	type FormEvent,
	type MouseEvent,
	type SyntheticEvent,
} from 'react'
import type { CheckInAnswer, PlayerChoice, TeamTableRow } from '../../shared/teamTypes.ts'
import { useSyncState } from '../useSyncState.ts'
import { allowLeaveEmptyDropOnRow } from './allowLeaveEmptyDropOnRow.ts'
import { allowPictureDropOnCell } from './allowPictureDropOnCell.ts'
import { allowPictureDropOnLeftEmptyRow } from './allowPictureDropOnLeftEmptyRow.ts'
import { checkInWithServer } from './checkInWithServer.ts'
import { choosePlayerInRow } from './choosePlayerInRow.ts'
import {
	chooseRegionOrFloorGoalDropdownOption,
} from './chooseRegionOrFloorGoalDropdownOption.ts'
import { closeServerLinkHelpWindow } from './closeServerLinkHelpWindow.ts'
import { closeTeamFoundWindow } from './closeTeamFoundWindow.ts'
import { closeWindowFromXButton } from './closeWindowFromXButton.ts'
import { copyInviteLink } from './copyInviteLink.ts'
import { copyVerificationEmojiCode } from './copyVerificationEmojiCode.ts'
import { dragFromSideWindow } from './dragFromSideWindow.ts'
import { dragPictureFromTable } from './dragPictureFromTable.ts'
import { dropPictureOnCell } from './dropPictureOnCell.ts'
import { dropPictureOnLeftEmptyRow } from './dropPictureOnLeftEmptyRow.ts'
import { endPictureDragFromTable } from './endPictureDragFromTable.ts'
import { growWindowFromIcon } from './growWindowFromIcon.ts'
import { leaveInvitingTeam } from './leaveInvitingTeam.ts'
import { leaveRowEmpty } from './leaveRowEmpty.ts'
import { loadRobloxBadgeChecklist } from './loadRobloxBadgeChecklist.ts'
import { loadSideWindowPictures } from './loadSideWindowPictures.ts'
import { loadVerificationEmojiCode } from './loadVerificationEmojiCode.ts'
import { loadVerifiedRobloxAccount } from './loadVerifiedRobloxAccount.ts'
import { logOutOfRoblox } from './logOutOfRoblox.ts'
import { openBadgesOrRolesWindow } from './openBadgesOrRolesWindow.ts'
import { openFindATeamFromInviteLink } from './openFindATeamFromInviteLink.ts'
import { openServerLinkHelpWindow } from './openServerLinkHelpWindow.ts'
import { openTeamFoundWindow } from './openTeamFoundWindow.ts'
import { readSavedTeamTable } from './readSavedTeamTable.ts'
import { saveServerLinkField } from './saveServerLinkField.ts'
import { toggleDandyRunOrEarlyDyleCheckbox } from './toggleDandyRunOrEarlyDyleCheckbox.ts'
import { saveTeamTable } from './saveTeamTable.ts'
import { shrinkWindowIntoIcon } from './shrinkWindowIntoIcon.ts'
import { toggleBadgeCheckbox } from './toggleBadgeCheckbox.ts'
import { toggleFindingPlayers } from './toggleFindingPlayers.ts'
import { toggleRoleCheckbox } from './toggleRoleCheckbox.ts'
import { undoLeaveRowEmpty } from './undoLeaveRowEmpty.ts'
import { updateRobloxBadgeChecklist } from './updateRobloxBadgeChecklist.ts'
import { verifyRobloxUsername } from './verifyRobloxUsername.ts'

export type RobloxAccount = {
	id: number
	username: string
}

export type RobloxBadge = {
	name: string
	owned: boolean
}

export type PictureColumn = 'toonPicture' | 'trinketAPicture' | 'trinketBPicture'

export function useLogic() {
	const {
		asyncState: state,
		getSyncState,
		setState,
		mutateState,
	} = useSyncState((): {
		verifiedRobloxAccount: RobloxAccount | null
		verificationEmojiCode: string
		isVerificationEmojiCodeCopied: boolean
		robloxVerificationError: string
		robloxBadgeChecklist: RobloxBadge[] | null
		usernameFieldStartValue: string
		teamTableRows: TeamTableRow[]
		toonsWindowPictures: string[]
		trinketsWindowPictures: string[]
		serverLinkFieldStartValue: string
		serverLink: string
		isDandyRunCheckboxChecked: boolean
		isEarlyDyleCheckboxChecked: boolean
		chosenRegionDropdownOption: string
		chosenFloorGoalDropdownOption: string
		findPlayersError: string
		isFindingPlayers: boolean
		pageId: string
		inviteCode: string
		inviteFromLink: {
			inviteCode: string
			rowIndex: number
		} | null
		invitingTeam: CheckInAnswer['invitingTeam']
		shownTeamStatus: CheckInAnswer['shownTeamStatus']
		copiedInviteLinkRowIndex: number | null
		// null until the first check-in answers
		onThisPageCount: number | null
		findingPlayersCount: number | null
		tableDragLandedInAnotherCell: boolean
		rowIndexInBadgesWindow: number
		rowIndexInRolesWindow: number
	} => ({
		verifiedRobloxAccount: null,
		verificationEmojiCode: '',
		isVerificationEmojiCodeCopied: false,
		robloxVerificationError: '',
		robloxBadgeChecklist: null,
		usernameFieldStartValue: localStorage.getItem('robloxUsername') ?? '',
		teamTableRows: readSavedTeamTable(),
		toonsWindowPictures: [],
		trinketsWindowPictures: [],
		serverLinkFieldStartValue: localStorage.getItem('serverLink') ?? '',
		serverLink: localStorage.getItem('serverLink') ?? '',
		isDandyRunCheckboxChecked: localStorage.getItem('dandyRun') === 'true',
		isEarlyDyleCheckboxChecked: localStorage.getItem('earlyDyle') === 'true',
		chosenRegionDropdownOption: localStorage.getItem('region') ?? 'Any',
		chosenFloorGoalDropdownOption: localStorage.getItem('floorGoal') ?? '50',
		findPlayersError: '',
		isFindingPlayers: false,
		pageId: sessionStorage.getItem('pageId') ?? crypto.randomUUID(),
		inviteCode: sessionStorage.getItem('inviteCode') ?? crypto.randomUUID(),
		// Invite links look like /?invite=<invite code>&row=<row index>
		inviteFromLink: (() => {
			const searchParams = new URLSearchParams(location.search)
			const inviteCode = searchParams.get('invite')
			return inviteCode
				? {
					inviteCode,
					rowIndex: Number(searchParams.get('row')),
				}
				: null
		})(),
		invitingTeam: null,
		shownTeamStatus: null,
		copiedInviteLinkRowIndex: null,
		onThisPageCount: null,
		findingPlayersCount: null,
		tableDragLandedInAnotherCell: false,
		rowIndexInBadgesWindow: 0,
		rowIndexInRolesWindow: 0,
	}))

	// Fills the Toons and Trinkets side windows with pictures
	useEffect(() => loadSideWindowPictures({
		setToonsWindowPictures: (toonsWindowPictures) => setState({ toonsWindowPictures }),
		setTrinketsWindowPictures: (trinketsWindowPictures) => setState({ trinketsWindowPictures }),
	}), [setState])

	// Opens Find a Team right away for a friend who opened an invite link
	useEffect(() => openFindATeamFromInviteLink(), [])

	// Decides whether Roblox Verification opens on "Verified as <name>" or on the instructions
	useEffect(() => loadVerifiedRobloxAccount({
		setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
	}), [setState])
	const isRobloxVerified = Boolean(state.verifiedRobloxAccount)

	// Fills the badge checklist once verified, or the emoji code next to Copy otherwise
	useEffect(() => {
		if (isRobloxVerified) {
			loadRobloxBadgeChecklist({
				setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({
					robloxBadgeChecklist,
				}),
				setRobloxVerificationError: (robloxVerificationError) => setState({
					robloxVerificationError,
				}),
			})
		} else {
			loadVerificationEmojiCode({
				setVerificationEmojiCode: (verificationEmojiCode) => setState({
					verificationEmojiCode,
				}),
			})
		}
	}, [isRobloxVerified, setState])

	// Keeps both counters at the bottom of the screen up to date, and keeps the team on the server
	// in sync while it searches, while it has an "Invite friend" row, or while this page is an
	// invited friend's. A change of any of those checks in again right away.
	const hasInviteFriendRow = state.teamTableRows.some((row) => (
		!row.isLeftEmpty && row.playerChoice === 'invitedFriend'
	))
	useEffect(() => checkInWithServer({
		pageId: getSyncState().pageId,
		inviteCode: getSyncState().inviteCode,
		getTeamTableRows: () => getSyncState().teamTableRows,
		getTeamSettings: () => ({
			isDandyRun: getSyncState().isDandyRunCheckboxChecked,
			isEarlyDyle: getSyncState().isEarlyDyleCheckboxChecked,
			region: getSyncState().chosenRegionDropdownOption,
			floorGoal: getSyncState().chosenFloorGoalDropdownOption,
		}),
		getServerLink: () => getSyncState().serverLink,
		getIsFindingPlayers: () => getSyncState().isFindingPlayers,
		getInviteFromLink: () => getSyncState().inviteFromLink,
		getShownTeamStatus: () => getSyncState().shownTeamStatus,
		setOnThisPageCount: (onThisPageCount) => setState({ onThisPageCount }),
		setFindingPlayersCount: (findingPlayersCount) => setState({ findingPlayersCount }),
		setInvitingTeam: (invitingTeam) => setState({ invitingTeam }),
		setShownTeamStatus: (shownTeamStatus) => setState({ shownTeamStatus }),
		setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
		setInviteFromLink: (inviteFromLink) => setState({ inviteFromLink }),
		setFindPlayersError: (findPlayersError) => setState({ findPlayersError }),
	}), [
		state.isFindingPlayers,
		state.inviteFromLink,
		hasInviteFriendRow,
		getSyncState,
		setState,
	])
	const {
		invitingTeam,
		shownTeamStatus,
	} = state
	const isInvitedFriend = Boolean(state.inviteFromLink)
	// An invited friend only watches the team, and a searching team cannot change
	const isTableLocked = state.isFindingPlayers || isInvitedFriend
	const isSearching = isInvitedFriend
		? Boolean(shownTeamStatus?.isSearching)
		: state.isFindingPlayers
	const hasJoinedATeam = Boolean(shownTeamStatus?.hasJoinedATeam)
	const shownTeamTableRows = invitingTeam?.teamTableRows ?? state.teamTableRows

	// Opens the team found window as soon as the server link of the team arrives
	const teamServerLink = shownTeamStatus?.teamServerLink ?? ''
	useEffect(() => {
		if (teamServerLink) openTeamFoundWindow()
	}, [teamServerLink])

	// Clears the red error below Find Players once the user changes what it complained about.
	// mutateState keeps the rows array's identity, so the rows are compared as text.
	const teamTableRowsText = JSON.stringify(state.teamTableRows)
	useEffect(() => setState({ findPlayersError: '' }), [
		teamTableRowsText,
		state.serverLink,
		state.isDandyRunCheckboxChecked,
		state.isEarlyDyleCheckboxChecked,
		state.chosenRegionDropdownOption,
		state.chosenFloorGoalDropdownOption,
		setState,
	])

	// Remembers the Find a Team table across reloads

	// mutateState keeps the rows array's identity while editing its rows, so this runs on every render
	useEffect(() => saveTeamTable({ teamTableRows: state.teamTableRows }))

	return {

		// Roblox Verification icon, first in the row at the top of the screen, and its window
		robloxVerificationWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => growWindowFromIcon({
				id: 'account',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => shrinkWindowIntoIcon({
				id: 'account',
				event,
			}),
			onCloseClick: () => closeWindowFromXButton({ id: 'account' }),
		},
		isRobloxVerified,


		// Verified view of Roblox Verification: "Verified as <name>" and the badge checklist,

		// with Update Badges at the bottom left and Log out at the bottom right
		verifiedRobloxUsername: state.verifiedRobloxAccount?.username ?? '',
		showBadgeChecklist: Boolean(state.robloxBadgeChecklist),
		badgeChecklist: (state.robloxBadgeChecklist ?? []).map((badge) => ({
			name: badge.name,
			mark: badge.owned ? '✅' : '⬜',
		})),
		badgeChecklistLoadingText: state.robloxVerificationError || 'Loading badges...',
		// Red line under the badge checklist when Update Badges failed
		badgeUpdateError: state.robloxBadgeChecklist ? state.robloxVerificationError : '',
		updateRobloxBadgeChecklist: () => updateRobloxBadgeChecklist({
			getRobloxBadgeChecklist: () => getSyncState().robloxBadgeChecklist,
			setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({ robloxBadgeChecklist }),
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
		}),
		logOutOfRoblox: () => logOutOfRoblox({
			setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
			setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({ robloxBadgeChecklist }),
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
		}),


		// Unverified view of Roblox Verification: the emoji code with Copy, then the username

		// field with Check and any error below it
		verificationEmojiCode: state.verificationEmojiCode,
		copyVerificationEmojiCode: () => copyVerificationEmojiCode({
			getVerificationEmojiCode: () => getSyncState().verificationEmojiCode,
			setIsVerificationEmojiCodeCopied: (isVerificationEmojiCodeCopied) => setState({
				isVerificationEmojiCodeCopied,
			}),
		}),
		copyButtonText: state.isVerificationEmojiCodeCopied ? 'Copied!' : 'Copy',
		usernameFieldStartValue: state.usernameFieldStartValue,
		verifyRobloxUsername: (event: FormEvent<HTMLFormElement>) => verifyRobloxUsername({
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
			setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
			event,
		}),
		robloxVerificationError: state.robloxVerificationError,


		// Find a Team icon, second in the row at the top of the screen, and its window
		findATeamWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => growWindowFromIcon({
				id: 'team',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
				// React passes on the cancel of the Badges and Roles windows inside this one, which
				// close by themselves
				if (event.target !== event.currentTarget) return
				shrinkWindowIntoIcon({
					id: 'team',
					event,
				})
				// The next check-in brings back the current status of the team
				setState({ shownTeamStatus: null })
				leaveInvitingTeam({
					setInviteFromLink: (inviteFromLink) => setState({ inviteFromLink }),
					setInvitingTeam: (invitingTeam) => setState({ invitingTeam }),
				})
			},
			onCloseClick: () => closeWindowFromXButton({ id: 'team' }),
		},

		// Line at the top of Find a Team for a friend who opened an invite link
		invitedFriendText: (() => {
			if (!isInvitedFriend) return ''
			if (!invitingTeam) return 'Joining the team that invited you...'
			const host = invitingTeam.hostRobloxUsername
			return `You are in ${host ? `@${host}'s` : 'your friend\'s'} team. Closing this window takes you out of it.`
		})(),

		// Greys out the Toons and Trinkets side windows while the table is locked
		sideWindowClass: isTableLocked ? 'window team-locked' : 'window',
		// Line under the titles of the Toons and Trinkets side windows
		sideWindowDragHint: 'Drag onto the table',

		// "(Leave Empty)" tile, first in the Toons side window to the lower left
		dragLeaveEmptyTile: (event: DragEvent) => dragFromSideWindow({
			event,
			kind: 'leave-empty',
			name: '(Leave Empty)',
		}),

		// Toon pictures in the Toons side window to the lower left
		toonsWindowTiles: state.toonsWindowPictures.map((name) => ({
			name,
			src: `/toons/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: (event: DragEvent) => dragFromSideWindow({
				event,
				kind: 'toon',
				name,
			}),
		})),

		// Trinket pictures in the Trinkets side window to the upper right
		trinketsWindowTiles: state.trinketsWindowPictures.map((name) => ({
			name,
			src: `/trinkets/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: (event: DragEvent) => dragFromSideWindow({
				event,
				kind: 'trinket',
				name,
			}),
		})),

		// Badges window in the middle of the screen, which a Badges cell opens, with a checkbox for
		// each owned badge and a × that closes it
		badgesWindowCheckboxes: (state.robloxBadgeChecklist ?? [])
			.filter((badge) => badge.owned)
			.map((badge) => ({
				name: badge.name,
				isChecked: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames
					.includes(badge.name),
				toggleCheckbox: (event: ChangeEvent<HTMLInputElement>) => toggleBadgeCheckbox({
					getBadgeNames: () => (
						getSyncState().teamTableRows[getSyncState().rowIndexInBadgesWindow].badgeNames
					),
					setBadgeNames: (badgeNames) => mutateState((state) => {
						state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames = badgeNames
					}),
					event,
					name: badge.name,
				}),
			})),
		closeBadgesWindow: () => closeWindowFromXButton({ id: 'team-badges' }),

		// Roles window in the middle of the screen, which a Role cell opens, with a checkbox for each
		// role and a × that closes it
		rolesWindowCheckboxes: [
			'Distracts Pebble',
			'Distracts grabbers',
			'Distracts the rest',
			'Babysits Glisten',
			'Solar Support',
			'Extractor',
		].map((name) => ({
			name,
			isChecked: state.teamTableRows[state.rowIndexInRolesWindow].roleNames.includes(name),
			toggleCheckbox: (event: ChangeEvent<HTMLInputElement>) => toggleRoleCheckbox({
				getRoleNames: () => (
					getSyncState().teamTableRows[getSyncState().rowIndexInRolesWindow].roleNames
				),
				setRoleNames: (roleNames) => mutateState((state) => {
					state.teamTableRows[state.rowIndexInRolesWindow].roleNames = roleNames
				}),
				event,
				name,
			}),
		})),
		closeRolesWindow: () => closeWindowFromXButton({ id: 'team-roles' }),

		// Rows of the white table in the middle of Find a Team
		teamTableRows: shownTeamTableRows.map((row, index) => ({
			key: index,

			// Dropping "(Leave Empty)" anywhere on the row
			allowLeaveEmptyDropOnRow: (event: DragEvent) => allowLeaveEmptyDropOnRow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				event,
			}),
			leaveRowEmpty: (event: DragEvent) => leaveRowEmpty({
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
				event,
			}),

			// Grey "(Leave Empty)" cell that spans the whole row and clears when clicked
			isLeftEmpty: row.isLeftEmpty,
			leaveEmptyCellColSpan: isRobloxVerified ? 6 : 5,
			leaveEmptyCellClass: isTableLocked
				? 'team-disabled'
				: 'team-disabled team-clickable',
			undoLeaveRowEmpty: () => undoLeaveRowEmpty({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
			}),
			// Dropping a toon or trinket on the "(Leave Empty)" cell
			allowPictureDropOnLeftEmptyRow: (event: DragEvent) => allowPictureDropOnLeftEmptyRow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				event,
			}),
			dropPictureOnLeftEmptyRow: (event: DragEvent) => dropPictureOnLeftEmptyRow({
				getRowPicture: (column) => getSyncState().teamTableRows[index][column],
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
				setPicture: ({
					column, name,
				}) => mutateState((state) => {
					state.teamTableRows[index][column] = name
				}),
				setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
					tableDragLandedInAnotherCell,
				}),
				event,
			}),

			// Toon, Trinket A and Trinket B cells, the first three columns of the row
			pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
				.map((column) => ({
					column,
					allowPictureDropOnCell: (event: DragEvent) => allowPictureDropOnCell({
						getIsTableLocked: () => (
							getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
						),
						event,
						column,
					}),
					dropPictureOnCell: (event: DragEvent) => dropPictureOnCell({
						getRowPicture: (rowColumn) => getSyncState().teamTableRows[index][rowColumn],
						setPicture: (picture) => mutateState((state) => {
							state.teamTableRows[index][column] = picture
						}),
						setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
							tableDragLandedInAnotherCell,
						}),
						event,
						index,
						column,
					}),

					// Grey "(Any)" text in an empty Toon or Trinket cell
					anyText: row[column] ? '' : '(Any)',

					// Picture inside the cell, which drags to another cell or out of the table to
					// clear it
					picture: row[column] ? {
						src: `/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
						title: row[column].replace('.png', ''),
						draggable: !isTableLocked,
						dragPictureFromTable: (event: DragEvent) => dragPictureFromTable({
							getPicture: () => getSyncState().teamTableRows[index][column],
							event,
							index,
							column,
						}),
						endPictureDragFromTable: (event: DragEvent) => endPictureDragFromTable({
							getTableDragLandedInAnotherCell: () => (
								getSyncState().tableDragLandedInAnotherCell
							),
							setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => (
								setState({ tableDragLandedInAnotherCell })
							),
							setPicture: (picture) => mutateState((state) => {
								state.teamTableRows[index][column] = picture
							}),
							event,
						}),
					} : null,
				})),

			// Badges and Role cells, which open their window in the middle of the screen when clicked
			badgesAndRoleCellClass: isTableLocked ? '' : 'team-clickable',
			openBadgesWindow: () => openBadgesOrRolesWindow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				setRowIndexInWindow: (rowIndexInBadgesWindow) => setState({ rowIndexInBadgesWindow }),
				id: 'team-badges',
				index,
			}),
			openRolesWindow: () => openBadgesOrRolesWindow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				setRowIndexInWindow: (rowIndexInRolesWindow) => setState({ rowIndexInRolesWindow }),
				id: 'team-roles',
				index,
			}),

			// Grey "(none required)" text in an empty Badges or Role cell
			noBadgesText: row.badgeNames.length ? '' : '(none required)',
			noRolesText: row.roleNames.length ? '' : '(none required)',

			// Badge names stacked in the Badges cell, the fourth column, shown only once verified.
			// They are crossed out in a "Find any player" row.
			badges: row.badgeNames.map((name) => ({
				name,
				isCrossedOut: row.playerChoice === 'findPlayer',
				crossedOutTooltip: row.playerChoice === 'findPlayer'
					? 'Badges cannot be verified for unverified players'
					: undefined,
			})),

			// Role names stacked in the Role cell after Badges.
			// Solar Support is crossed out when the toon is not Bobette.
			roles: row.roleNames
				.map((name) => {
					const isCrossedOut = name === 'Solar Support' && row.toonPicture !== 'bobette.png'
					return {
						name,
						isCrossedOut,
						crossedOutTooltip: isCrossedOut
							? 'Only Bobette can help with Solar Distracting'
							: undefined,
					}
				}),

			// Player column, the last one: the player dropdown, or while the table is locked either
			// "Finding player..." or the grey name of the player in the row
			...(() => {
				const playerInRow = shownTeamStatus?.playersInRows[index] ?? null
				const playerInRowName = (() => {
					if (!playerInRow) return ''
					if ('robloxUsername' in playerInRow) {
						return playerInRow.robloxUsername
							? `@${playerInRow.robloxUsername}`
							: 'Unverified player'
					}
					return playerInRow.unverifiedFriendOf
						? `Friend of @${playerInRow.unverifiedFriendOf}`
						: 'Unverified friend'
				})()
				const showFindingPlayerText = isSearching
					&& !hasJoinedATeam
					&& !playerInRow
					&& (row.playerChoice === 'findPlayer' || row.playerChoice === 'findVerifiedPlayer')
				return {
					showFindingPlayerText,
					showPlayerName: isTableLocked && !showFindingPlayerText,
					playerName: playerInRowName ? `(${playerInRowName})` : {
						findPlayer: '(Find any player)',
						findVerifiedPlayer: '(Find verified player)',
						me: '(You)',
						unverifiedFriend: '(Unverified friend)',
						invitedFriend: '(Invite not accepted)',
					}[row.playerChoice],
					showPlayerDropdown: !isTableLocked,
					chosenPlayerDropdownOption: row.playerChoice,
					choosePlayerInRow: (event: ChangeEvent<HTMLSelectElement>) => choosePlayerInRow({
						getPlayerChoices: () => getSyncState().teamTableRows.map((row) => row.playerChoice),
						setPlayerChoices: (playerChoices) => mutateState((state) => {
							state.teamTableRows.forEach((row, rowIndex) => {
								row.playerChoice = playerChoices[rowIndex]
							})
						}),
						event,
						index,
					}),

					// "Copy invite link" button below the dropdown of an "Invite friend" row, and the
					// grey line below it that says whether the friend joined
					showInviteLink: !isTableLocked && row.playerChoice === 'invitedFriend',
					copyInviteLinkButtonText: state.copiedInviteLinkRowIndex === index
						? 'Copied!'
						: 'Copy invite link',
					copyInviteLink: () => copyInviteLink({
						inviteCode: getSyncState().inviteCode,
						setCopiedInviteLinkRowIndex: (copiedInviteLinkRowIndex) => setState({
							copiedInviteLinkRowIndex,
						}),
						index,
					}),
					invitedFriendText: playerInRowName
						? `${playerInRowName} joined`
						: 'Waiting for your friend...',
				}
			})(),
		})),

		// Options of the dropdown in every row of the Player column
		playerDropdownOptions: [
			{
				value: 'findPlayer',
				text: 'Find any player',
			},
			{
				value: 'findVerifiedPlayer',
				text: 'Find verified player',
			},
			{
				value: 'me',
				text: 'Me',
			},
			{
				value: 'unverifiedFriend',
				text: 'Unverified friend',
			},
			{
				value: 'invitedFriend',
				text: 'Invite friend',
			},
		] satisfies {
			value: PlayerChoice
			text: string
		}[],


		// "Server link (recommended):" field below the table and the help link below it, which an
		// invited friend does not see, since the host's server link is the one that counts
		showServerLinkField: !isInvitedFriend,
		serverLinkFieldStartValue: state.serverLinkFieldStartValue,
		isServerLinkFieldLocked: isTableLocked,
		saveServerLinkField: (event: ChangeEvent<HTMLInputElement>) => saveServerLinkField({
			setServerLink: (serverLink) => setState({ serverLink }),
			event,
		}),

		// "How do I get a server link?" link below the field, and the × of the screenshot window

		// that it opens
		openServerLinkHelpWindow,
		closeServerLinkHelpWindow,

		// Dandy Run and Early Dyle checkboxes in the left column of TEAM SETTINGS
		// An invited friend sees the settings of the team that invited them
		areDandyRunAndEarlyDyleCheckboxesLocked: isTableLocked,
		isDandyRunCheckboxChecked: invitingTeam?.isDandyRun ?? state.isDandyRunCheckboxChecked,
		toggleDandyRunCheckbox: (event: ChangeEvent<HTMLInputElement>) => (
			toggleDandyRunOrEarlyDyleCheckbox({
				localStorageKey: 'dandyRun',
				setIsChecked: (isDandyRunCheckboxChecked) => setState({ isDandyRunCheckboxChecked }),
				event,
			})
		),
		isEarlyDyleCheckboxChecked: invitingTeam?.isEarlyDyle ?? state.isEarlyDyleCheckboxChecked,
		toggleEarlyDyleCheckbox: (event: ChangeEvent<HTMLInputElement>) => (
			toggleDandyRunOrEarlyDyleCheckbox({
				localStorageKey: 'earlyDyle',
				setIsChecked: (isEarlyDyleCheckboxChecked) => setState({ isEarlyDyleCheckboxChecked }),
				event,
			})
		),

		// Region and Floor goal dropdowns in the right column of TEAM SETTINGS
		areRegionAndFloorGoalDropdownsLocked: isTableLocked,
		regionDropdownOptions: [
			'Any',
			'Africa',
			'Asia',
			'Europe',
			'North America',
			'South America',
			'Oceania',
		],
		chosenRegionDropdownOption: invitingTeam?.region ?? state.chosenRegionDropdownOption,
		chooseRegionDropdownOption: (event: ChangeEvent<HTMLSelectElement>) => (
			chooseRegionOrFloorGoalDropdownOption({
				localStorageKey: 'region',
				setChosenOption: (chosenRegionDropdownOption) => setState({
					chosenRegionDropdownOption,
				}),
				event,
			})
		),
		floorGoalDropdownOptions: [
			'10',
			'20',
			'25',
			'30',
			'40',
			'50',
			'60',
			'70',
			'80',
			'90',
			'100',
			'100+',
		],
		chosenFloorGoalDropdownOption: invitingTeam?.floorGoal ?? state.chosenFloorGoalDropdownOption,
		chooseFloorGoalDropdownOption: (event: ChangeEvent<HTMLSelectElement>) => (
			chooseRegionOrFloorGoalDropdownOption({
				localStorageKey: 'floorGoal',
				setChosenOption: (chosenFloorGoalDropdownOption) => setState({
					chosenFloorGoalDropdownOption,
				}),
				event,
			})
		),

		// Find Players button at the bottom right of Find a Team, with its spinner and the red
		// error line below it. An invited friend only watches, so they get no button.
		showFindPlayersButton: !isInvitedFriend,
		toggleFindingPlayers: (event: FormEvent<HTMLFormElement>) => toggleFindingPlayers({
			getTeamTableRows: () => getSyncState().teamTableRows,
			getServerLink: () => getSyncState().serverLink,
			getIsFindingPlayers: () => getSyncState().isFindingPlayers,
			setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
			setShownTeamStatus: (shownTeamStatus) => setState({ shownTeamStatus }),
			setFindPlayersError: (findPlayersError) => setState({ findPlayersError }),
			event,
		}),
		findPlayersButtonText: (() => {
			if (hasJoinedATeam) return 'Leave Team'
			return state.isFindingPlayers ? 'Finding Players (Click to Cancel)' : 'Find Players'
		})(),
		// The spinner stops once the team joined another team, or once every row of it is taken
		showFindingPlayersSpinner: isSearching
			&& !hasJoinedATeam
			&& shownTeamTableRows.some((row, index) => (
				!row.isLeftEmpty
				&& (row.playerChoice === 'findPlayer' || row.playerChoice === 'findVerifiedPlayer')
				&& !shownTeamStatus?.playersInRows[index]
			)),
		findPlayersError: state.findPlayersError,
		// Line below Find Players, visible while a search without a server link waits for players,
		// since two searches only match when at least one of them has a server link. It keeps its
		// space while hidden, so the window does not grow when a search starts.
		findingWithoutServerLinkHint:
			'Without a server link, you can only match a team that has one. Adding yours finds a team faster.',
		findingWithoutServerLinkHintClass: isSearching && !hasJoinedATeam && !state.serverLink.trim()
			? ''
			: 'team-invisible',

		// Window on top of Find a Team that opens once players got together, with the server link
		// of the team and a × that closes it
		closeTeamFoundWindow,
		teamFoundText: (() => {
			const host = shownTeamStatus?.hostRobloxUsername
			if (hasJoinedATeam) {
				if (host) return `The host is @${host}. Everyone, join their server!`
				return `${isInvitedFriend ? 'Your team' : 'You'} joined a team! Join its server:`
			}
			if (!isInvitedFriend) return 'Players joined your team! Everyone meets in this server:'
			return host
				? `Players joined @${host}'s team! Everyone meets in this server:`
				: 'Players joined the team! Everyone meets in this server:'
		})(),
		teamServerLink,


		// Two counters at the bottom middle of the screen
		onlineCounterText: `${state.onThisPageCount ?? '…'} online`,
		findingPlayersCounterText: `${state.findingPlayersCount ?? '…'} looking for a team`,
	}
}
