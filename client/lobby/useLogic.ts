import { useEffect } from 'react'
import type {
	CheckInAnswer,
	LastFoundTeam,
	PlayerInRow,
	ReservedFor,
	TeamTableRow,
} from '../../shared/teamTypes.ts'
import { useSyncState } from '../useSyncState.ts'
import { addUnverifiedFriend } from './addUnverifiedFriend.ts'
import { checkInWithServer } from './checkInWithServer.ts'
import {
	chooseRegionOrFloorGoalDropdownOption,
} from './chooseRegionOrFloorGoalDropdownOption.ts'
import { copyChecklistNames } from './copyChecklistNames.ts'
import { copyInviteLink } from './copyInviteLink.ts'
import { copyVerificationEmojiCode } from './copyVerificationEmojiCode.ts'
import { dragFromSideWindow } from './dragFromSideWindow.ts'
import { dragPictureFromTable } from './dragPictureFromTable.ts'
import { dropPictureOnCell } from './dropPictureOnCell.ts'
import { dropPictureOnLeftEmptyRow } from './dropPictureOnLeftEmptyRow.ts'
import { dragReservationFromTable } from './dragReservationFromTable.ts'
import { dropReservationOnPlayerCell } from './dropReservationOnPlayerCell.ts'
import { endPictureDragFromTable } from './endPictureDragFromTable.ts'
import { endReservationDragFromTable } from './endReservationDragFromTable.ts'
import { leaveInvitingTeam } from './leaveInvitingTeam.ts'
import { leaveRowEmpty } from './leaveRowEmpty.ts'
import { loadLastFoundTeam } from './loadLastFoundTeam.ts'
import { loadRobloxBadgeChecklist } from './loadRobloxBadgeChecklist.ts'
import { loadSideWindowPictures } from './loadSideWindowPictures.ts'
import { loadVerificationEmojiCode } from './loadVerificationEmojiCode.ts'
import { loadVerifiedRobloxAccount } from './loadVerifiedRobloxAccount.ts'
import { logOutOfRoblox } from './logOutOfRoblox.ts'
import { openBadgesOrRolesWindow } from './openBadgesOrRolesWindow.ts'
import { openWindowFromIcon } from './openWindowFromIcon.ts'
import { pasteChecklistNames } from './pasteChecklistNames.ts'
import { pickInPickWindow } from './pickInPickWindow.ts'
import { readSavedTeamTable } from './readSavedTeamTable.ts'
import { removeFriendFromReservedWindow } from './removeFriendFromReservedWindow.ts'
import { saveServerLinkField } from './saveServerLinkField.ts'
import { toggleDandyRunOrEarlyDyleCheckbox } from './toggleDandyRunOrEarlyDyleCheckbox.ts'
import { toggleDarkModeCheckbox } from './toggleDarkModeCheckbox.ts'
import { saveTeamTable } from './saveTeamTable.ts'
import { tapFindATeamCardBox } from './tapFindATeamCardBox.ts'
import { toggleBadgeCheckbox } from './toggleBadgeCheckbox.ts'
import { toggleFindingPlayers } from './toggleFindingPlayers.ts'
import { toggleRoleCheckbox } from './toggleRoleCheckbox.ts'
import { toggleUpvote } from './toggleUpvote.ts'
import { toggleVerifiedOnlyCheckbox } from './toggleVerifiedOnlyCheckbox.ts'
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

// Box of a Find a Team card on a narrow screen whose pick window is open
export type CardBoxInPickWindow = {
	index: number
	column: PictureColumn | 'reservedFor'
}

export type DesktopWindowName ='Roblox Verification' | 'Find a Team' | 'Upvote Players'

// Tile, picture or chip that is being dragged. fromTableCell is '' for a side window, and otherwise
// names the cell that the drag started in, like "2 trinketAPicture" or "2 reservedFor".
export type DraggedItem = {
	kind: 'toon' | 'trinket' | 'leave-empty' | 'reserved-for'
	name: string
	fromTableCell: string
}

// Name of the player in a row of Find a Team or Upvote Players, or '' for an empty row
function playerNameOf(playerInRow: PlayerInRow | null) {
	if (!playerInRow) return ''
	if ('robloxUsername' in playerInRow) {
		return playerInRow.robloxUsername ? `@${playerInRow.robloxUsername}` : 'Unverified player'
	}
	return playerInRow.unverifiedFriendOf
		? `Friend of @${playerInRow.unverifiedFriendOf}`
		: 'Unverified friend'
}

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
		unverifiedFriendNumbers: number[]
		removedVerifiedFriendUsernames: string[]
		isInviteLinkCopied: boolean
		isCopiedTextShown: boolean
		teamTableRows: TeamTableRow[]
		toonsWindowPictures: string[]
		trinketsWindowPictures: string[]
		serverLinkFieldStartValue: string
		serverLink: string
		isDarkModeCheckboxChecked: boolean
		isDandyRunCheckboxChecked: boolean
		isEarlyDyleCheckboxChecked: boolean
		chosenRegionDropdownOption: string
		chosenFloorGoalDropdownOption: string
		findPlayersError: string
		isFindingPlayers: boolean
		pageId: string
		inviteCode: string
		inviteFromLink: { inviteCode: string } | null
		invitingTeam: CheckInAnswer['invitingTeam']
		isVerificationNeededToJoin: boolean
		shownTeamStatus: CheckInAnswer['shownTeamStatus']
		// null until the first check-in answers
		onThisPageCount: number | null
		findingPlayersCount: number | null
		openDesktopWindowName: DesktopWindowName | null
		isBadgesWindowOpen: boolean
		isRolesWindowOpen: boolean
		isTeamFoundWindowOpen: boolean
		isServerLinkHelpWindowOpen: boolean
		draggedItem: DraggedItem | null
		tableDragLandedInAnotherCell: boolean
		tableDragLandedOnTable: boolean
		rowIndexInBadgesWindow: number
		rowIndexInRolesWindow: number
		// null while no pick window is open
		cardBoxInPickWindow: CardBoxInPickWindow | null
		// null until Copy is clicked in that window
		copiedBadgeNames: string[] | null
		copiedRoleNames: string[] | null
		// Button of that window that reads "Copied!" or "Pasted!" for 3 seconds after its click
		badgesWindowConfirmedButton: 'Copy' | 'Paste' | null
		rolesWindowConfirmedButton: 'Copy' | 'Paste' | null
		// null when no search of this player found a team yet
		lastFoundTeam: LastFoundTeam | null
		isLastFoundTeamLoaded: boolean
	} => ({
		verifiedRobloxAccount: null,
		verificationEmojiCode: '',
		isVerificationEmojiCodeCopied: false,
		robloxVerificationError: '',
		robloxBadgeChecklist: null,
		usernameFieldStartValue: localStorage.getItem('robloxUsername') ?? '',
		...(() => {
			const unverifiedFriendNumbers: number[] = JSON.parse(
				localStorage.getItem('unverifiedFriendNumbers') ?? '[]',
			)
			return {
				unverifiedFriendNumbers,
				teamTableRows: readSavedTeamTable({ unverifiedFriendNumbers }),
			}
		})(),
		removedVerifiedFriendUsernames: JSON.parse(
			sessionStorage.getItem('removedVerifiedFriendUsernames') ?? '[]',
		),
		isInviteLinkCopied: sessionStorage.getItem('isInviteLinkCopied') === 'true',
		isCopiedTextShown: false,
		toonsWindowPictures: [],
		trinketsWindowPictures: [],
		serverLinkFieldStartValue: localStorage.getItem('serverLink') ?? '',
		serverLink: localStorage.getItem('serverLink') ?? '',
		isDarkModeCheckboxChecked: localStorage.getItem('darkMode') === 'true',
		isDandyRunCheckboxChecked: localStorage.getItem('dandyRun') === 'true',
		isEarlyDyleCheckboxChecked: localStorage.getItem('earlyDyle') === 'true',
		chosenRegionDropdownOption: localStorage.getItem('region') ?? 'Any',
		chosenFloorGoalDropdownOption: localStorage.getItem('floorGoal') ?? '50',
		findPlayersError: '',
		isFindingPlayers: false,
		pageId: sessionStorage.getItem('pageId') ?? crypto.randomUUID(),
		inviteCode: sessionStorage.getItem('inviteCode') ?? crypto.randomUUID(),
		// Invite links look like /?invite=<invite code>
		inviteFromLink: (() => {
			const inviteCode = new URLSearchParams(location.search).get('invite')
			return inviteCode ? { inviteCode } : null
		})(),
		invitingTeam: null,
		isVerificationNeededToJoin: false,
		shownTeamStatus: null,
		onThisPageCount: null,
		findingPlayersCount: null,
		// A friend who opens an invite link lands in Find a Team, which shows the team that invited them
		openDesktopWindowName: new URLSearchParams(location.search).has('invite')
			? 'Find a Team'
			: null,
		isBadgesWindowOpen: false,
		isRolesWindowOpen: false,
		isTeamFoundWindowOpen: false,
		isServerLinkHelpWindowOpen: false,
		draggedItem: null,
		tableDragLandedInAnotherCell: false,
		tableDragLandedOnTable: false,
		rowIndexInBadgesWindow: 0,
		rowIndexInRolesWindow: 0,
		cardBoxInPickWindow: null,
		copiedBadgeNames: null,
		copiedRoleNames: null,
		badgesWindowConfirmedButton: null,
		rolesWindowConfirmedButton: null,
		lastFoundTeam: null,
		isLastFoundTeamLoaded: false,
	}))

	// Fills the Toons and Trinkets side windows with pictures
	useEffect(() => loadSideWindowPictures({
		setToonsWindowPictures: (toonsWindowPictures) => setState({ toonsWindowPictures }),
		setTrinketsWindowPictures: (trinketsWindowPictures) => setState({ trinketsWindowPictures }),
	}), [setState])

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
	// in sync while it searches, once its invite link was copied, or while this page is an invited
	// friend's. A change of any of those checks in again right away.
	useEffect(() => checkInWithServer({
		pageId: getSyncState().pageId,
		inviteCode: getSyncState().inviteCode,
		getTeamTableRows: () => getSyncState().teamTableRows,
		getRemovedVerifiedFriendUsernames: () => getSyncState().removedVerifiedFriendUsernames,
		getIsInviteLinkCopied: () => getSyncState().isInviteLinkCopied,
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
		setIsVerificationNeededToJoin: (isVerificationNeededToJoin) => setState({
			isVerificationNeededToJoin,
		}),
	}), [
		state.isFindingPlayers,
		state.inviteFromLink,
		state.isInviteLinkCopied,
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

	// Text of a chip from the Reserved side window, which shows in that window and in the Player
	// column. An invited friend sees the host's name on the host's "Me" chips. The server's list of
	// verified friends catches up with a removal on the next check-in.
	const verifiedFriendUsernamesInTeam = (shownTeamStatus?.verifiedFriendRobloxUsernames ?? [])
		.filter((username) => !state.removedVerifiedFriendUsernames.includes(username))
	const reservationChipText = (reservedFor: ReservedFor) => {
		if (reservedFor === 'me') {
			if (!isInvitedFriend) return 'Me'
			return invitingTeam?.hostRobloxUsername ? `@${invitingTeam.hostRobloxUsername}` : 'Host'
		}
		if (reservedFor.startsWith('unverifiedFriend:')) {
			return `Unverified friend #${reservedFor.split(':')[1]}`
		}
		const username = reservedFor.slice('verifiedFriend:'.length)
		return !shownTeamStatus || verifiedFriendUsernamesInTeam.includes(username)
			? `@${username}`
			: `@${username} (left the team)`
	}

	// Opens the team found window as soon as the server link of the team arrives
	const teamServerLink = shownTeamStatus?.teamServerLink ?? ''
	useEffect(() => {
		if (teamServerLink) setState({ isTeamFoundWindowOpen: true })
	}, [teamServerLink, setState])

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

	// Find a Team shrinks into its icon on its ×, on Esc, or when another icon opens its window
	const closeFindATeamWindow = () => {
		setState({ openDesktopWindowName: null })
		// The next check-in brings back the current status of the team
		setState({ shownTeamStatus: null })
		leaveInvitingTeam({
			setInviteFromLink: (inviteFromLink) => setState({ inviteFromLink }),
			setInvitingTeam: (invitingTeam) => setState({ invitingTeam }),
		})
	}

	// A tap on a tile or a name of the pick window that a Find a Team card box opened
	const pick = (pick: {
		kind: 'picture' | 'leave-empty' | 'reserved-for'
		name: string
	}) => pickInPickWindow({
		getCardBoxInPickWindow: () => getSyncState().cardBoxInPickWindow,
		getRowPicture: ({
			index,
			column,
		}) => getSyncState().teamTableRows[index][column],
		setPicture: ({
			index,
			column,
			picture,
		}) => mutateState((state) => {
			state.teamTableRows[index][column] = picture
		}),
		setIsLeftEmpty: (index) => mutateState((state) => {
			state.teamTableRows[index].isLeftEmpty = true
		}),
		setReservedFor: ({
			index,
			reservedFor,
		}) => mutateState((state) => {
			state.teamTableRows[index].reservedFor = reservedFor
		}),
		setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
		pick,
	})

	return {

		// Roblox Verification icon, first in the row at the top of the screen, and its window, which
		// shrinks into the icon on its × or on Esc
		robloxVerificationWindow: {
			isOpen: state.openDesktopWindowName === 'Roblox Verification',
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'Roblox Verification',
			}),
			close: () => setState({ openDesktopWindowName: null }),
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
		verifyRobloxUsername: (username: string) => verifyRobloxUsername({
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
			setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
			username,
		}),
		robloxVerificationError: state.robloxVerificationError,


		// Find a Team icon, second in the row at the top of the screen, and its window
		findATeamWindow: {
			isOpen: state.openDesktopWindowName === 'Find a Team',
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'Find a Team',
			}),
			close: closeFindATeamWindow,
		},

		// Line at the top of Find a Team for a friend who opened an invite link
		invitedFriendText: (() => {
			if (!isInvitedFriend) return ''
			if (state.isVerificationNeededToJoin) {
				return 'Verify your Roblox account in Roblox Verification to join the team that invited you.'
			}
			if (!invitingTeam) return 'Joining the team that invited you...'
			const host = invitingTeam.hostRobloxUsername
			return `You are in ${host ? `@${host}'s` : 'your friend\'s'} team. Closing this window takes you out of it.`
		})(),

		// Greys out the Toons and Trinkets side windows while the table is locked
		sideWindowClass: isTableLocked ? 'window team-locked' : 'window',
		// Line under the titles of the Toons and Trinkets side windows
		sideWindowDragHint: 'Drag onto the table',
		// Every tile and chip of the side windows forgets what it dragged once its drag ends
		endDragFromSideWindow: () => setState({
			draggedItem: null,
			tableDragLandedOnTable: false,
		}),

		// "(Leave Empty)" tile, first in the Toons side window to the lower left
		dragLeaveEmptyTile: () => dragFromSideWindow({
			setDraggedItem: (draggedItem) => setState({ draggedItem }),
			kind: 'leave-empty',
			name: '(Leave Empty)',
		}),

		// Toon pictures in the Toons side window to the lower left
		toonsWindowTiles: state.toonsWindowPictures.map((name) => ({
			name,
			src: `/pixelated/toons/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: () => dragFromSideWindow({
				setDraggedItem: (draggedItem) => setState({ draggedItem }),
				kind: 'toon',
				name,
			}),
		})),

		// Trinket pictures in the Trinkets side window to the upper right
		trinketsWindowTiles: state.trinketsWindowPictures.map((name) => ({
			name,
			src: `/pixelated/trinkets/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: () => dragFromSideWindow({
				setDraggedItem: (draggedItem) => setState({ draggedItem }),
				kind: 'trinket',
				name,
			}),
		})),

		// Reserved window below the Trinkets window, with "Me", every verified friend who opened the
		// invite link and every unverified friend as a chip that drags into the Player column.
		// Every friend's chip has an × that removes the friend. Group boxes separate "Me", the
		// verified friends with "Copy invite link", and the unverified friends with their add button. An
		// invited friend only watches the host's team, so they do not see this window.
		showReservedWindow: !isInvitedFriend,
		reservedWindowDragHint: 'Drag onto the Player column',
		...(() => {
			const reservedWindowChipOf = (reservedFor: ReservedFor) => {
				return {
					key: reservedFor,
					text: reservationChipText(reservedFor),
					dragFromSideWindow: () => dragFromSideWindow({
						setDraggedItem: (draggedItem) => setState({ draggedItem }),
						kind: 'reserved-for',
						name: reservedFor,
					}),
					endDragFromSideWindow: () => setState({
						draggedItem: null,
						tableDragLandedOnTable: false,
					}),
					pickForPlayerCardBox: () => pick({
						kind: 'reserved-for',
						name: reservedFor,
					}),
					showRemoveFriendButton: reservedFor !== 'me',
					removeFriend: () => removeFriendFromReservedWindow({
						getUnverifiedFriendNumbers: () => getSyncState().unverifiedFriendNumbers,
						setUnverifiedFriendNumbers: (unverifiedFriendNumbers) => setState({
							unverifiedFriendNumbers,
						}),
						getRemovedVerifiedFriendUsernames: () => (
							getSyncState().removedVerifiedFriendUsernames
						),
						setRemovedVerifiedFriendUsernames: (removedVerifiedFriendUsernames) => setState({
							removedVerifiedFriendUsernames,
						}),
						clearReservationFromTable: (removedReservedFor) => mutateState((state) => {
							state.teamTableRows.forEach((row) => {
								if (row.reservedFor === removedReservedFor) row.reservedFor = ''
							})
						}),
						reservedFor,
					}),
				}
			}
			return {
				reservedWindowMeChip: reservedWindowChipOf('me'),
				// "VERIFIED FRIENDS" box, only for a verified host
				showReservedWindowVerifiedFriends: isRobloxVerified,
				reservedWindowVerifiedFriendChips: verifiedFriendUsernamesInTeam.map((username) => (
					reservedWindowChipOf(`verifiedFriend:${username}`)
				)),
				reservedWindowUnverifiedFriendChips: state.unverifiedFriendNumbers.map((number) => (
					reservedWindowChipOf(`unverifiedFriend:${number}`)
				)),
			}
		})(),
		copyInviteLinkButtonText: state.isCopiedTextShown ? 'Copied!' : 'Copy invite link',
		copyInviteLink: () => copyInviteLink({
			inviteCode: getSyncState().inviteCode,
			setIsInviteLinkCopied: (isInviteLinkCopied) => setState({ isInviteLinkCopied }),
			setIsCopiedTextShown: (isCopiedTextShown) => setState({ isCopiedTextShown }),
		}),
		addUnverifiedFriend: () => addUnverifiedFriend({
			getUnverifiedFriendNumbers: () => getSyncState().unverifiedFriendNumbers,
			setUnverifiedFriendNumbers: (unverifiedFriendNumbers) => setState({
				unverifiedFriendNumbers,
			}),
		}),

		// Badges window in the middle of the screen, which a Badges cell opens, with a checkbox for
		// each owned badge and a × that closes it
		badgesWindowCheckboxes: (state.robloxBadgeChecklist ?? [])
			.filter((badge) => badge.owned)
			.map((badge, index, ownedBadges) => ({
				name: badge.name,
				// Grey line between two listed badges of different groups, which is when two groups
				// hold one of them each
				hasLineAbove: index > 0 && [
					[
						'Speed Walker',
						'Long Distance Runner',
						'Marathon Runner',
					],
					[
						'Machine Enthusiast',
						'Machine Master',
						'THE Machine',
					],
					[
						'Clocked In',
						'Overtime',
						'Hissy Fit',
					],
					['Just Keep Swimming'],
					[
						'Double Digits!',
						'Skilled Toon!',
						'Super Skilled Pro!',
						'Twisteds Fear Me.',
					],
				].filter((group) => (
					group.includes(badge.name) || group.includes(ownedBadges[index - 1].name)
				)).length === 2,
				isChecked: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames
					.includes(badge.name),
				toggleCheckbox: (isChecked: boolean) => toggleBadgeCheckbox({
					getBadgeNames: () => (
						getSyncState().teamTableRows[getSyncState().rowIndexInBadgesWindow].badgeNames
					),
					setBadgeNames: (badgeNames) => mutateState((state) => {
						state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames = badgeNames
					}),
					isChecked,
					name: badge.name,
				}),
			})),
		isBadgesWindowOpen: state.isBadgesWindowOpen,
		// The × of the Badges window, Esc, and a click outside it all close it
		closeBadgesWindow: () => setState({ isBadgesWindowOpen: false }),
		// Copy and Paste buttons at the bottom of the Badges window. Paste is greyed out until Copy
		// was clicked there.
		badgesWindowCopyButtonText: state.badgesWindowConfirmedButton === 'Copy' ? 'Copied!' : 'Copy',
		badgesWindowPasteButtonText: (
			state.badgesWindowConfirmedButton === 'Paste' ? 'Pasted!' : 'Paste'
		),
		isBadgesWindowPasteDisabled: !state.copiedBadgeNames,
		copyBadgesWindowNames: () => copyChecklistNames({
			checkedNames: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames,
			setCopiedNames: (copiedBadgeNames) => setState({ copiedBadgeNames }),
			setConfirmedButton: (badgesWindowConfirmedButton) => setState({
				badgesWindowConfirmedButton,
			}),
		}),
		pasteBadgesWindowNames: () => pasteChecklistNames({
			copiedNames: state.copiedBadgeNames ?? [],
			setCheckedNames: (badgeNames) => mutateState((state) => {
				state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames = badgeNames
			}),
			setConfirmedButton: (badgesWindowConfirmedButton) => setState({
				badgesWindowConfirmedButton,
			}),
		}),

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
			hasLineAbove: false,
			isChecked: state.teamTableRows[state.rowIndexInRolesWindow].roleNames.includes(name),
			toggleCheckbox: (isChecked: boolean) => toggleRoleCheckbox({
				getRoleNames: () => (
					getSyncState().teamTableRows[getSyncState().rowIndexInRolesWindow].roleNames
				),
				setRoleNames: (roleNames) => mutateState((state) => {
					state.teamTableRows[state.rowIndexInRolesWindow].roleNames = roleNames
				}),
				isChecked,
				name,
			}),
		})),
		isRolesWindowOpen: state.isRolesWindowOpen,
		// The × of the Roles window, Esc, and a click outside it all close it
		closeRolesWindow: () => setState({ isRolesWindowOpen: false }),
		// Copy and Paste buttons at the bottom of the Roles window. Paste is greyed out until Copy
		// was clicked there.
		rolesWindowCopyButtonText: state.rolesWindowConfirmedButton === 'Copy' ? 'Copied!' : 'Copy',
		rolesWindowPasteButtonText: (
			state.rolesWindowConfirmedButton === 'Paste' ? 'Pasted!' : 'Paste'
		),
		isRolesWindowPasteDisabled: !state.copiedRoleNames,
		copyRolesWindowNames: () => copyChecklistNames({
			checkedNames: state.teamTableRows[state.rowIndexInRolesWindow].roleNames,
			setCopiedNames: (copiedRoleNames) => setState({ copiedRoleNames }),
			setConfirmedButton: (rolesWindowConfirmedButton) => setState({
				rolesWindowConfirmedButton,
			}),
		}),
		pasteRolesWindowNames: () => pasteChecklistNames({
			copiedNames: state.copiedRoleNames ?? [],
			setCheckedNames: (roleNames) => mutateState((state) => {
				state.teamTableRows[state.rowIndexInRolesWindow].roleNames = roleNames
			}),
			setConfirmedButton: (rolesWindowConfirmedButton) => setState({
				rolesWindowConfirmedButton,
			}),
		}),

		// Pick window in the middle of a narrow screen, which a box of a Find a Team card opens: Toons
		// or Trinkets with a tile for each picture, or Reserved Slots with the names of the Reserved
		// window. Its ×, Esc, a click outside it and every pick close it.
		...(() => {
			const cardBox = state.cardBoxInPickWindow
			const chosenName = cardBox ? state.teamTableRows[cardBox.index][cardBox.column] : ''
			const isToonBox = cardBox?.column === 'toonPicture'
			const pictureFolder = isToonBox ? 'toons' : 'trinkets'
			return {
				isPickWindowOpen: Boolean(cardBox),
				closePickWindow: () => setState({ cardBoxInPickWindow: null }),
				pickWindowTitle: (() => {
					if (cardBox?.column === 'reservedFor') return 'Reserved Slots'
					return isToonBox ? 'Toons' : 'Trinkets'
				})(),
				showPickWindowTiles: cardBox?.column !== 'reservedFor',
				// "(Any)" and, for a Toon box, "(Leave Empty)" come before the pictures. The tile that
				// the box holds has a navy frame.
				pickWindowTiles: [
					{
						key: '(Any)',
						text: '(Any)',
						src: '',
						title: 'Empty the box',
						isChosen: !chosenName,
						pick: () => pick({
							kind: 'picture',
							name: '',
						}),
					},
					...isToonBox ? [{
						key: '(Leave Empty)',
						text: '(Leave Empty)',
						src: '',
						title: 'Leave the whole card empty',
						isChosen: false,
						pick: () => pick({
							kind: 'leave-empty',
							name: '',
						}),
					}] : [],
					...(isToonBox ? state.toonsWindowPictures : state.trinketsWindowPictures)
						.map((name) => ({
							key: name,
							text: '',
							src: `/pixelated/${pictureFolder}/${name}`,
							title: name.replace('.png', ''),
							isChosen: name === chosenName,
							pick: () => pick({
								kind: 'picture',
								name,
							}),
						})),
				],
				pickWindowFindAPlayerButtonText: '(Find a player)',
				pickFindAPlayer: () => pick({
					kind: 'reserved-for',
					name: '',
				}),
			}
		})(),

		// A drag from the table that ends anywhere else empties its cell
		landDragOnTable: () => setState({ tableDragLandedOnTable: true }),

		// Rows of the white table in the middle of Find a Team
		teamTableRows: shownTeamTableRows.map((row, index) => ({
			key: index,

			// Dropping "(Leave Empty)" anywhere on the row
			canDropLeaveEmptyOnRow: !isTableLocked && state.draggedItem?.kind === 'leave-empty',
			leaveRowEmpty: () => leaveRowEmpty({
				getDraggedItem: () => getSyncState().draggedItem,
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
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
			canDropPictureOnLeftEmptyRow: !isTableLocked && (
				state.draggedItem?.kind === 'toon' || state.draggedItem?.kind === 'trinket'
			),
			dropPictureOnLeftEmptyRow: () => dropPictureOnLeftEmptyRow({
				getDraggedItem: () => getSyncState().draggedItem,
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
			}),

			// Toon, Trinket A and Trinket B cells, the first three columns of the row
			pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
				.map((column) => ({
					column,
					canDropPictureOnCell: !isTableLocked
						&& state.draggedItem?.kind === (column === 'toonPicture' ? 'toon' : 'trinket'),
					dropPictureOnCell: () => dropPictureOnCell({
						getDraggedItem: () => getSyncState().draggedItem,
						getRowPicture: (rowColumn) => getSyncState().teamTableRows[index][rowColumn],
						setPicture: (picture) => mutateState((state) => {
							state.teamTableRows[index][column] = picture
						}),
						setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
							tableDragLandedInAnotherCell,
						}),
						index,
						column,
					}),

					// Toon or Trinket box of the row's card on a narrow screen, which opens the Toons or
					// Trinkets pick window when tapped
					cardBoxLabel: {
						toonPicture: 'Toon',
						trinketAPicture: 'Trinket A',
						trinketBPicture: 'Trinket B',
					}[column],
					cardBoxClass: isTableLocked
						? 'team-card-box team-card-picture-box'
						: 'team-card-box team-card-picture-box team-clickable',
					tapCardBox: () => tapFindATeamCardBox({
						getIsTableLocked: () => (
							getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
						),
						setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
						cardBox: {
							index,
							column,
						},
					}),

					// Grey "(Any)" text in an empty Toon or Trinket cell
					anyText: row[column] ? '' : '(Any)',

					// Picture inside the cell, which drags to another cell or out of the table to
					// clear it
					picture: row[column] ? {
						src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
						title: row[column].replace('.png', ''),
						draggable: !isTableLocked,
						dragPictureFromTable: () => dragPictureFromTable({
							getPicture: () => getSyncState().teamTableRows[index][column],
							setDraggedItem: (draggedItem) => setState({ draggedItem }),
							index,
							column,
						}),
						endPictureDragFromTable: () => endPictureDragFromTable({
							getTableDragLandedInAnotherCell: () => (
								getSyncState().tableDragLandedInAnotherCell
							),
							getTableDragLandedOnTable: () => getSyncState().tableDragLandedOnTable,
							setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => (
								setState({ tableDragLandedInAnotherCell })
							),
							setTableDragLandedOnTable: (tableDragLandedOnTable) => (
								setState({ tableDragLandedOnTable })
							),
							setDraggedItem: (draggedItem) => setState({ draggedItem }),
							setPicture: (picture) => mutateState((state) => {
								state.teamTableRows[index][column] = picture
							}),
						}),
					} : null,
				})),

			// Badges and Role cells, which open their window in the middle of the screen when clicked
			badgesAndRoleCellClass: isTableLocked ? '' : 'team-clickable',
			// Every box of the row's card on a narrow screen, which reacts to a tap while the table
			// is unlocked
			cardBoxClass: isTableLocked ? 'team-card-box' : 'team-card-box team-clickable',
			// Title above the row's card
			cardTitle: `Player Slot #${index + 1}`,
			leftEmptyCardBoxClass: isTableLocked
				? 'team-card-box team-card-left-empty'
				: 'team-card-box team-card-left-empty team-clickable',
			openBadgesWindow: () => openBadgesOrRolesWindow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				setRowIndexInWindow: (rowIndexInBadgesWindow) => setState({ rowIndexInBadgesWindow }),
				setIsWindowOpen: (isBadgesWindowOpen) => setState({ isBadgesWindowOpen }),
				index,
			}),
			openRolesWindow: () => openBadgesOrRolesWindow({
				getIsTableLocked: () => (
					getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
				),
				setRowIndexInWindow: (rowIndexInRolesWindow) => setState({ rowIndexInRolesWindow }),
				setIsWindowOpen: (isRolesWindowOpen) => setState({ isRolesWindowOpen }),
				index,
			}),

			// Grey "(none required)" text in an empty Badges or Role cell
			noBadgesText: row.badgeNames.length ? '' : '(none required)',
			noRolesText: row.roleNames.length ? '' : '(none required)',

			// Badge names stacked in the Badges cell, the fourth column, shown only once verified.
			// They are crossed out while "Verified only" is unchecked.
			badges: row.badgeNames.map((name) => ({
				name,
				isCrossedOut: !row.isVerifiedPlayerRequired,
			})),
			badgesCellTooltip: row.isVerifiedPlayerRequired || !row.badgeNames.length
				? 'Click to modify required badges'
				: 'Only verified players can require badges.',

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

			// Player column, the last one: a chip from the Reserved window above a "Verified only"
			// checkbox, or while the table is locked either "Finding player..." or the grey name of
			// the player in the row
			...(() => {
				const playerInRow = shownTeamStatus?.playersInRows[index] ?? null
				// A host without a Roblox account would otherwise read "Unverified player" in their
				// own row
				const isOwnUnverifiedRow = !isInvitedFriend
					&& !isRobloxVerified
					&& shownTeamStatus?.hostRowIndex === index
				const playerInRowName = isOwnUnverifiedRow ? 'Me' : playerNameOf(playerInRow)
				// A searching row without a player shows "Finding player..." once the server told
				// which rows the team's own players are in, since a chip on several rows takes
				// only one of them
				const showFindingPlayerText = isSearching
					&& !hasJoinedATeam
					&& Boolean(shownTeamStatus)
					&& !playerInRow
				return {
					// Player box of the row's card on a narrow screen, which opens the Reserved Slots
					// pick window when tapped, and reads "(Find a player)" while it holds no name
					tapPlayerCardBox: () => tapFindATeamCardBox({
						getIsTableLocked: () => (
							getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
						),
						setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
						cardBox: {
							index,
							column: 'reservedFor',
						},
					}),
					findAPlayerText: !isTableLocked && !row.reservedFor ? '(Find a player)' : '',
					showFindingPlayerText,
					showPlayerName: isTableLocked && !showFindingPlayerText,
					playerName: `(${playerInRowName || (() => {
						if (row.reservedFor) return reservationChipText(row.reservedFor)
						return isRobloxVerified && row.isVerifiedPlayerRequired
							? 'Find verified player'
							: 'Find any player'
					})()})`,
					// Dropping a chip from the Reserved window or from another Player cell
					canDropReservationOnPlayerCell: !isTableLocked
						&& state.draggedItem?.kind === 'reserved-for',
					dropReservationOnPlayerCell: () => dropReservationOnPlayerCell({
						getDraggedItem: () => getSyncState().draggedItem,
						setReservedFor: (reservedFor) => mutateState((state) => {
							state.teamTableRows[index].reservedFor = reservedFor
						}),
						setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
							tableDragLandedInAnotherCell,
						}),
						index,
					}),

					// Chip in the cell, which drags to another Player cell or out of the table to
					// clear it
					reservationChip: !isTableLocked && row.reservedFor ? {
						text: reservationChipText(row.reservedFor),
						dragReservationFromTable: () => dragReservationFromTable({
							getReservedFor: () => getSyncState().teamTableRows[index].reservedFor,
							setDraggedItem: (draggedItem) => setState({ draggedItem }),
							index,
						}),
						endReservationDragFromTable: () => endReservationDragFromTable({
							getTableDragLandedInAnotherCell: () => (
								getSyncState().tableDragLandedInAnotherCell
							),
							getTableDragLandedOnTable: () => getSyncState().tableDragLandedOnTable,
							setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => (
								setState({ tableDragLandedInAnotherCell })
							),
							setTableDragLandedOnTable: (tableDragLandedOnTable) => (
								setState({ tableDragLandedOnTable })
							),
							setDraggedItem: (draggedItem) => setState({ draggedItem }),
							setReservedFor: (reservedFor) => mutateState((state) => {
								state.teamTableRows[index].reservedFor = reservedFor
							}),
						}),
					} : null,

					// "Verified only" checkbox below the chip, only for a verified host
					showVerifiedOnlyCheckbox: isRobloxVerified && !isTableLocked,
					verifiedOnlyCheckboxTooltip: `Allow only verified players into this player slot.`,
					isVerifiedOnlyCheckboxChecked: row.isVerifiedPlayerRequired,
					toggleVerifiedOnlyCheckbox: (isChecked: boolean) => toggleVerifiedOnlyCheckbox({
						setIsVerifiedPlayerRequired: (isVerifiedPlayerRequired) => mutateState((state) => {
							state.teamTableRows[index].isVerifiedPlayerRequired = isVerifiedPlayerRequired
						}),
						isChecked,
					}),
				}
			})(),
		})),
		// Tooltip of the Player column header, which explains what a row without a chip means
		playerColumnHeaderTooltip: `A row without a chip is left for a player to find, and so is every extra row that shares a chip.
"Verified only" lets only verified players take it.`,


		// "Server link (recommended):" field below the table and the "?" right of it, which an
		// invited friend does not see, since the host's server link is the one that counts
		showServerLinkField: !isInvitedFriend,
		serverLinkFieldStartValue: state.serverLinkFieldStartValue,
		isServerLinkFieldLocked: isTableLocked,
		saveServerLinkField: (serverLink: string) => saveServerLinkField({
			setServerLink: (serverLink) => setState({ serverLink }),
			serverLink,
		}),

		// "?" right of the server link field, and the screenshot window that it opens, which its × and
		// Esc close
		isServerLinkHelpWindowOpen: state.isServerLinkHelpWindowOpen,
		openServerLinkHelpWindow: () => setState({ isServerLinkHelpWindowOpen: true }),
		closeServerLinkHelpWindow: () => setState({ isServerLinkHelpWindowOpen: false }),

		// Dandy Run and Early Dyle checkboxes in the left column of TEAM SETTINGS
		// An invited friend sees the settings of the team that invited them
		areDandyRunAndEarlyDyleCheckboxesLocked: isTableLocked,
		isDandyRunCheckboxChecked: invitingTeam?.isDandyRun ?? state.isDandyRunCheckboxChecked,
		toggleDandyRunCheckbox: (isChecked: boolean) => toggleDandyRunOrEarlyDyleCheckbox({
			localStorageKey: 'dandyRun',
			setIsChecked: (isDandyRunCheckboxChecked) => setState({ isDandyRunCheckboxChecked }),
			isChecked,
		}),
		isEarlyDyleCheckboxChecked: invitingTeam?.isEarlyDyle ?? state.isEarlyDyleCheckboxChecked,
		toggleEarlyDyleCheckbox: (isChecked: boolean) => toggleDandyRunOrEarlyDyleCheckbox({
			localStorageKey: 'earlyDyle',
			setIsChecked: (isEarlyDyleCheckboxChecked) => setState({ isEarlyDyleCheckboxChecked }),
			isChecked,
		}),

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
		chooseRegionDropdownOption: (chosenOption: string) => chooseRegionOrFloorGoalDropdownOption({
			localStorageKey: 'region',
			setChosenOption: (chosenRegionDropdownOption) => setState({
				chosenRegionDropdownOption,
			}),
			chosenOption,
		}),
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
		chooseFloorGoalDropdownOption: (chosenOption: string) => chooseRegionOrFloorGoalDropdownOption({
			localStorageKey: 'floorGoal',
			setChosenOption: (chosenFloorGoalDropdownOption) => setState({
				chosenFloorGoalDropdownOption,
			}),
			chosenOption,
		}),

		// Find Players button at the bottom right of Find a Team, with its spinner and the red
		// error line below it. An invited friend only watches, so they get no button.
		showFindPlayersButton: !isInvitedFriend,
		toggleFindingPlayers: () => toggleFindingPlayers({
			getServerLink: () => getSyncState().serverLink,
			getIsFindingPlayers: () => getSyncState().isFindingPlayers,
			setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
			setShownTeamStatus: (shownTeamStatus) => setState({ shownTeamStatus }),
			setFindPlayersError: (findPlayersError) => setState({ findPlayersError }),
		}),
		findPlayersButtonText: (() => {
			if (hasJoinedATeam) return 'Leave Team'
			return state.isFindingPlayers ? 'Finding Players (Click to Cancel)' : 'Find Players'
		})(),
		// Find Players is greyed out, with this tooltip saying why, while the team cannot search
		...(() => {
			const filledRows = state.teamTableRows.filter((row) => !row.isLeftEmpty)
			const reservations = new Set(filledRows.flatMap((row) => (
				row.reservedFor ? [row.reservedFor] : []
			)))
			const findPlayersButtonDisabledTooltip = (() => {
				if (state.isFindingPlayers || hasJoinedATeam) return ''
				if (!reservations.has('me')) {
					return '"Me" from the Reserved window has to be on at least 1 row that is not "(Leave Empty)".'
				}
				if (reservations.size >= filledRows.length) {
					return `At least 1 row has to be left for a player to find.
That is a row without a chip, or an extra row that shares a chip.`
				}
				if ([...reservations].some((reservedFor) => (
					reservedFor.startsWith('verifiedFriend:')
					&& !verifiedFriendUsernamesInTeam.some((username) => (
						reservedFor === `verifiedFriend:${username}`
					))
				))) {
					return 'A verified friend in the table left the team. Drag their name out of the table.'
				}
				return ''
			})()
			return {
				isFindPlayersButtonDisabled: Boolean(findPlayersButtonDisabledTooltip),
				findPlayersButtonDisabledTooltip,
			}
		})(),
		// The spinner stops once the team joined another team, or once every row of it is taken
		showFindingPlayersSpinner: isSearching
			&& !hasJoinedATeam
			&& shownTeamTableRows.some((row, index) => (
				!row.isLeftEmpty && !shownTeamStatus?.playersInRows[index]
			)),
		findPlayersError: state.findPlayersError,
		// Line below Find Players, visible while a search without a server link waits for players,
		// since two searches only match when at least one of them has a server link
		findingWithoutServerLinkHint:
			'Without a server link, you can only match a team that has one. Adding yours finds a team faster.',
		findingWithoutServerLinkHintClass: isSearching && !hasJoinedATeam && !state.serverLink.trim()
			? ''
			: 'team-invisible',

		// Window on top of Find a Team that opens once players got together, with the server link
		// of the team, which its × and Esc close
		isTeamFoundWindowOpen: state.isTeamFoundWindowOpen,
		closeTeamFoundWindow: () => setState({ isTeamFoundWindowOpen: false }),
		// Text of the window, split around the host's username, which the view shows as a link to
		// the host's Roblox profile when the text names the host
		teamFoundText: (() => {
			const host = shownTeamStatus?.hostRobloxUsername ?? ''
			const hostProfileLink = `https://www.roblox.com/user.aspx?username=${encodeURIComponent(host)
			}`
			const textWithoutHost = (text: string) => ({
				beforeHost: text,
				host: '',
				hostProfileLink: '',
				afterHost: '',
			})
			if (hasJoinedATeam) {
				if (host) {
					return {
						beforeHost: 'The host is ',
						host: `@${host}`,
						hostProfileLink,
						afterHost: '. Everyone, join their server!',
					}
				}
				return textWithoutHost(
					`${isInvitedFriend ? 'Your team' : 'You'} joined a team! Join its server:`,
				)
			}
			if (!isInvitedFriend) {
				return textWithoutHost('Players joined your team! Everyone meets in your server:')
			}
			if (!host) return textWithoutHost('Players joined the team! Everyone meets in this server:')
			return {
				beforeHost: 'Players joined ',
				host: `@${host}`,
				hostProfileLink,
				afterHost: '\'s team! Everyone meets in this server:',
			}
		})(),
		teamServerLink,


		// Upvote Players icon, third in the row at the top of the screen, and its window, which
		// loads the last found team whenever it opens for a verified user
		upvotePlayersWindow: {
			isOpen: state.openDesktopWindowName === 'Upvote Players',
			openFromIcon: () => {
				openWindowFromIcon({
					getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
					setOpenDesktopWindowName: (openDesktopWindowName) => setState({
						openDesktopWindowName,
					}),
					closeFindATeamWindow,
					desktopWindowName: 'Upvote Players',
				})
				if (!getSyncState().verifiedRobloxAccount) return
				loadLastFoundTeam({
					setLastFoundTeam: (lastFoundTeam) => setState({ lastFoundTeam }),
					setIsLastFoundTeamLoaded: (isLastFoundTeamLoaded) => setState({
						isLastFoundTeamLoaded,
					}),
				})
			},
			close: () => setState({ openDesktopWindowName: null }),
		},
		// Line at the top of Upvote Players
		upvotePlayersIntroText: (() => {
			if (!isRobloxVerified) {
				return `Only players with a verified Roblox account can upvote, so that every player can only upvote someone once.
Verify your account in Roblox Verification, and the players of the last team that you find show up here.`
			}
			if (!state.isLastFoundTeamLoaded) return 'Loading your last team...'
			if (!state.lastFoundTeam) {
				return 'You\'ll be able to upvote other players here after you find a team!'
			}
			return 'Your last team. Upvote the players who kept to the plan, played well and were nice!'
		})(),
		showLastFoundTeam: isRobloxVerified && Boolean(state.lastFoundTeam),
		// TEAM SETTINGS and server link of the last found team, below the line at the top
		lastFoundTeamSettingsText: state.lastFoundTeam ? [
			`Region: ${state.lastFoundTeam.region}`,
			`Floor goal: ${state.lastFoundTeam.floorGoal}`,
			...state.lastFoundTeam.isDandyRun ? ['Dandy Run'] : [],
			...state.lastFoundTeam.isEarlyDyle ? ['Early Dyle'] : [],
		].join(' · ') : '',
		lastFoundTeamServerLink: state.lastFoundTeam?.serverLink ?? '',
		// Rows of the read-only table, with the same columns as Find a Team once verified
		lastFoundTeamRows: (state.lastFoundTeam?.teamTableRows ?? []).map((row, index) => ({
			key: index,
			isLeftEmpty: row.isLeftEmpty,
			pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
				.map((column) => ({
					key: column,
					anyText: row[column] ? '' : '(Any)',
					picture: row[column] ? {
						src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
						title: row[column].replace('.png', ''),
					} : null,
				})),
			noBadgesText: row.badgeNames.length ? '' : '(none required)',
			badgeNames: row.badgeNames,
			noRolesText: row.roleNames.length ? '' : '(none required)',
			// Solar Support only counts for Bobette, as in Find a Team
			roleNames: row.roleNames.filter((role) => (
				role !== 'Solar Support' || row.toonPicture === 'bobette.png'
			)),
			playerName: `(${playerNameOf(state.lastFoundTeam!.playersInRows[index] ?? null)
				|| 'Nobody'})`,
		})),
		// Every other verified player of the team, each with an Upvote button unless they are the
		// host who invited the user or a friend whom the user invited
		noOtherVerifiedPlayersText: state.lastFoundTeam?.verifiedPlayers.length === 0
			? 'Nobody else in this team verified their Roblox account.'
			: '',
		upvoteEntries: (state.lastFoundTeam?.verifiedPlayers ?? []).map((player) => ({
			key: player.robloxUserId,
			text: `@${player.robloxUsername}`,
			showUpvoteButton: isRobloxVerified && player.canBeUpvoted,
			upvoteButtonText: player.isUpvoted ? 'Upvoted ✓' : 'Upvote',
			upvoteButtonTitle: player.isUpvoted ? 'Click to take the upvote back' : '',
			toggleUpvote: () => toggleUpvote({
				robloxUserId: player.robloxUserId,
				isUpvoted: player.isUpvoted,
				setIsUpvoted: (isUpvoted) => mutateState((state) => {
					const upvotedPlayer = state.lastFoundTeam?.verifiedPlayers.find((other) => (
						other.robloxUserId === player.robloxUserId
					))
					if (upvotedPlayer) upvotedPlayer.isUpvoted = isUpvoted
				}),
			}),
		})),


		// Two counters at the bottom middle of the screen
		onlineCounterText: `${state.onThisPageCount ?? '…'} online`,
		findingPlayersCounterText: `${state.findingPlayersCount ?? '…'} looking for a team`,


		// Dark mode checkbox at the bottom right of the screen, which swaps the wallpaper and the
		// window colors
		isDarkModeCheckboxChecked: state.isDarkModeCheckboxChecked,
		toggleDarkModeCheckbox: (isChecked: boolean) => toggleDarkModeCheckbox({
			setIsChecked: (isDarkModeCheckboxChecked) => setState({ isDarkModeCheckboxChecked }),
			isChecked,
		}),
	}
}
