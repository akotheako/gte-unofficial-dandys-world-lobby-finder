import { useEffect } from 'react'
import { isBadgeProvenByLaterCheckedBadge } from '../../shared/badgeCategories.ts'
import type {
	CheckInAnswer,
	ChosenSlot,
	LastFoundTeam,
	MergedTeamSettings,
	PlayerInRow,
	ReservedFor,
	TeamTableRow,
} from '../../shared/teamTypes.ts'
import { reportsReaderRobloxUserId, type Report } from '../../shared/reports.ts'
import { visibleTexts } from '../../shared/visibleTexts.ts'
import { useSyncState } from '../useSyncState.ts'
import { addUnverifiedFriend } from './addUnverifiedFriend.ts'
import { announceTeamFound } from './announceTeamFound.ts'
import { checkInWithServer } from './checkInWithServer.ts'
import { closeTeamFoundWindow } from './closeTeamFoundWindow.ts'
import {
	chooseTeamSettingsDropdownOption,
} from './chooseTeamSettingsDropdownOption.ts'
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
import { joinBrowsedTeamSlot } from './joinBrowsedTeamSlot.ts'
import { leaveInvitingTeam } from './leaveInvitingTeam.ts'
import { leaveRowEmpty } from './leaveRowEmpty.ts'
import { loadLastFoundTeam } from './loadLastFoundTeam.ts'
import { loadRobloxBadgeChecklist } from './loadRobloxBadgeChecklist.ts'
import { loadSideWindowPictures } from './loadSideWindowPictures.ts'
import { loadVerificationEmojiCode } from './loadVerificationEmojiCode.ts'
import { loadVerifiedRobloxAccount } from './loadVerifiedRobloxAccount.ts'
import { loadReports } from './loadReports.ts'
import { logOutOfRoblox } from './logOutOfRoblox.ts'
import { openBadgesOrRolesWindow } from './openBadgesOrRolesWindow.ts'
import { openWindowFromIcon } from './openWindowFromIcon.ts'
import { pasteChecklistNames } from './pasteChecklistNames.ts'
import { pickInPickWindow } from './pickInPickWindow.ts'
import { readSavedTeamTable } from './readSavedTeamTable.ts'
import { removeFriendFromReservedWindow } from './removeFriendFromReservedWindow.ts'
import { saveServerLinkField } from './saveServerLinkField.ts'
import { scrollBrowseTeamsList } from './scrollBrowseTeamsList.ts'
import { sendReport } from './sendReport.ts'
import { saveTeamTable } from './saveTeamTable.ts'
import { tapFindATeamCardBox } from './tapFindATeamCardBox.ts'
import { toggleBadgeCheckbox } from './toggleBadgeCheckbox.ts'
import { toggleFindingPlayers } from './toggleFindingPlayers.ts'
import { toggleNotificationCheckbox } from './toggleNotificationCheckbox.ts'
import { toggleOptionsCheckbox } from './toggleOptionsCheckbox.ts'
import { toggleOwnedPictureTile } from './toggleOwnedPictureTile.ts'
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

// Table of Find a Team, or the one-row table of YOUR SLOT in Browse Teams
type TableRowsKey = 'teamTableRows' | 'browseTeamsTableRows'

// Box of a Find a Team or YOUR SLOT card on a narrow screen whose pick window is open
export type CardBoxInPickWindow = {
	tableRowsKey: TableRowsKey
	index: number
	column: PictureColumn | 'reservedFor'
}

export type DesktopWindowName =
	| 'Roblox Verification'
	| 'Find a Team'
	| 'Browse Teams'
	| 'Upvote Players'
	| 'This is a fan project'
	| 'Contact/Report'
	| 'Options'
	| 'Reports'

// Tile, picture or chip that is being dragged. fromTableCell is '' for a side window, and otherwise
// names the cell that the drag started in, like "2 trinketAPicture" or "2 reservedFor".
export type DraggedItem = {
	kind: 'toon' | 'trinket' | 'leave-empty' | 'reserved-for'
	name: string
	fromTableCell: string
}

// Options that the dropdowns of a TEAM SETTINGS group box show
type TeamSettingsChosenOptions = {
	dandyRun: string
	earlyDyle: string
	region: string
	floorGoalFrom: string
	floorGoalTo: string
}

function ownedPicturesFirst(pictures: string[], missingPictures: string[]) {
	return [
		...pictures.filter((picture) => !missingPictures.includes(picture)),
		...pictures.filter((picture) => missingPictures.includes(picture)),
	]
}

// Team whose Join button the user clicked in Browse Teams, with the table that the join searches
// with, while it waits for the team to fill up
export type JoinedBrowsedTeam = {
	// Searches of the team, by which the page finds its card again once the team's host changed
	searchIds: string[]
	// Row whose Join button the user clicked, which reads "Joined this slot" until the server
	// tells the row of the join
	rowIndex: number
	// What the Join button sent, which the server finds the team and the slot by
	chosenSlot: ChosenSlot
	searchId: string
	teamTableRows: TeamTableRow[]
	dandyRun: string
	earlyDyle: string
	region: string
	floorGoal: string
}

// Name of the player in a row of Find a Team, Browse Teams or Upvote Players, or '' for an empty
// row
function playerNameOf(playerInRow: PlayerInRow | null) {
	if (!playerInRow) return ''
	if ('robloxUsername' in playerInRow) {
		return playerInRow.robloxUsername
			? visibleTexts.playerNames.robloxUsername(playerInRow.robloxUsername)
			: visibleTexts.playerNames.unverifiedPlayer
	}
	return playerInRow.unverifiedFriendOf
		? visibleTexts.playerNames.friendOf(playerInRow.unverifiedFriendOf)
		: visibleTexts.playerNames.unverifiedFriend
}

// Floors of the "from" and "to" dropdowns of the Floor goal in TEAM SETTINGS
const floorGoalDropdownOptions = [
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
]

// Small tags for the TEAM SETTINGS that are not Any, such as "Dandy Run", "No Early Dyle", the
// region, and "Floor Goal: 40 to 60", which the Browse Teams cards, Team Details, "Team found!" and
// Upvote Players show. Dandy Run and Early Dyle explain themselves on hover.
function teamSettingsTagsOf({
	teamSettings,
	isTeamComplete,
}: {
	teamSettings: MergedTeamSettings
	// A complete team plays to one floor, the one in the middle of its floor goal range
	isTeamComplete: boolean
}) {
	// A floor goal reads "40 to 60", or "50 to 50" for a single floor. The middle of a range is the
	// floor of the dropdowns within it that is closest to its middle, or the higher one of two that
	// are equally close, where "100+" counts as 101.
	const [fromOption, toOption = fromOption] = teamSettings.floorGoal.split(' to ')
	const floorOf = (option: string) => parseInt(option) + (option.endsWith('+') ? 1 : 0)
	const middleFloor = (floorOf(fromOption) + floorOf(toOption)) / 2
	const floorGoalText = (() => {
		if (fromOption === toOption) return fromOption
		if (!isTeamComplete) {
			return visibleTexts.teamSettings.floorGoalRange({
				fromFloor: fromOption,
				toFloor: toOption,
			})
		}
		return floorGoalDropdownOptions
			.filter((option) => floorOf(option) >= floorOf(fromOption) && floorOf(option) <= floorOf(toOption))
			.reduce((closest, option) => (
				Math.abs(floorOf(option) - middleFloor) <= Math.abs(floorOf(closest) - middleFloor)
					? option
					: closest
			))
	})()
	const dandyRunTag = {
		Yes: {
			text: visibleTexts.teamSettings.dandyRunTag,
			tooltip: visibleTexts.teamSettings.dandyRunTooltip,
		},
		No: {
			text: visibleTexts.teamSettings.noDandyRunTag,
			tooltip: visibleTexts.teamSettings.noDandyRunTooltip,
		},
	}[teamSettings.dandyRun]
	const earlyDyleTag = {
		Yes: {
			text: visibleTexts.teamSettings.earlyDyleTag,
			tooltip: visibleTexts.teamSettings.earlyDyleTooltip,
		},
		No: {
			text: visibleTexts.teamSettings.noEarlyDyleTag,
			tooltip: visibleTexts.teamSettings.noEarlyDyleTooltip,
		},
	}[teamSettings.earlyDyle]
	return [
		...dandyRunTag ? [dandyRunTag] : [],
		...earlyDyleTag ? [earlyDyleTag] : [],
		...teamSettings.region === 'Any' ? [] : [{
			text: teamSettings.region,
			tooltip: '',
		}],
		{
			text: visibleTexts.teamSettings.floorGoalTag(floorGoalText),
			tooltip: '',
		},
	]
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
		// Pictures that the My Toons and My Trinkets windows mark as missing, which the side windows
		// and pick windows of Find a Team list under "Missing", and those of Browse Teams leave out
		missingToons: string[]
		missingTrinkets: string[]
		openOwnedPicturesWindowKind: 'toon' | 'trinket' | null
		serverLinkFieldStartValue: string
		serverLink: string
		isDarkModeCheckboxChecked: boolean
		isDingSoundCheckboxChecked: boolean
		isNotificationCheckboxChecked: boolean
		notificationCheckboxError: string
		isNotificationPermissionPending: boolean
		isJoinAutomaticallyCheckboxChecked: boolean
		chosenDandyRunDropdownOption: string
		chosenEarlyDyleDropdownOption: string
		chosenRegionDropdownOption: string
		chosenFloorGoalFromDropdownOption: string
		chosenFloorGoalToDropdownOption: string
		findPlayersError: string
		isFindingPlayers: boolean
		searchId: string
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
		tableRowsKeyInRolesWindow: TableRowsKey
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
		// Error that replaces "Loading your last team..." when the server could not load it
		lastFoundTeamError: string
		chosenReportTopicDropdownOption: string
		reportMessage: string
		// "Sending...", "Sent! ...", or the server's error, below the Send button
		reportStatusText: string
		// null until the Reports window loaded them
		reports: Report[] | null
		reportsError: string
		// YOUR SLOT, a table with one row that holds "Me"
		browseTeamsTableRows: TeamTableRow[]
		browseTeamsChosenSettings: TeamSettingsChosenOptions
		// "Players" range of Browse Teams, which lists only the teams with that many slots
		browseTeamsChosenPlayersFromDropdownOption: string
		browseTeamsChosenPlayersToDropdownOption: string
		// null until the first check-in after Browse Teams opened answers
		browsedTeams: CheckInAnswer['browsedTeams'] | null
		hasMoreBrowsedTeams: boolean
		// How many cards Browse Teams asks the server for, which grows while the user scrolls
		browsedTeamCount: number
		// Searches of the team that Team Details shows, by which the page finds the team's card
		// again once its host changed, or null while Team Details is closed
		openedBrowsedSearchIds: string[] | null
		joinedBrowsedTeam: JoinedBrowsedTeam | null
		// Red line below the Join button when the server ended the join
		browseTeamsError: string
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
		missingToons: JSON.parse(localStorage.getItem('missingToons') ?? '[]'),
		missingTrinkets: JSON.parse(localStorage.getItem('missingTrinkets') ?? '[]'),
		openOwnedPicturesWindowKind: null,
		serverLinkFieldStartValue: localStorage.getItem('serverLink') ?? '',
		serverLink: localStorage.getItem('serverLink') ?? '',
		isDarkModeCheckboxChecked: localStorage.getItem('darkMode') === 'true',
		isDingSoundCheckboxChecked: localStorage.getItem('dingSound') === 'true',
		// The browser's permission can be taken back in its settings at any time
		isNotificationCheckboxChecked: localStorage.getItem('notification') === 'true'
			&& 'Notification' in window
			&& Notification.permission === 'granted',
		notificationCheckboxError: '',
		isNotificationPermissionPending: false,
		isJoinAutomaticallyCheckboxChecked: localStorage.getItem('joinAutomatically') === 'true',
		chosenDandyRunDropdownOption: localStorage.getItem('dandyRunOption') ?? 'Any',
		chosenEarlyDyleDropdownOption: localStorage.getItem('earlyDyleOption') ?? 'Any',
		chosenRegionDropdownOption: localStorage.getItem('region') ?? 'Any',
		chosenFloorGoalFromDropdownOption: localStorage.getItem('floorGoalFrom') ?? '10',
		chosenFloorGoalToDropdownOption: localStorage.getItem('floorGoalTo') ?? '100+',
		findPlayersError: '',
		isFindingPlayers: false,
		searchId: '',
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
		tableRowsKeyInRolesWindow: 'teamTableRows',
		cardBoxInPickWindow: null,
		copiedBadgeNames: null,
		copiedRoleNames: null,
		badgesWindowConfirmedButton: null,
		rolesWindowConfirmedButton: null,
		lastFoundTeam: null,
		isLastFoundTeamLoaded: false,
		lastFoundTeamError: '',
		chosenReportTopicDropdownOption: visibleTexts.contactReport.bugInTheWebsiteTopic,
		reportMessage: '',
		reportStatusText: '',
		reports: null,
		reportsError: '',
		browseTeamsTableRows: JSON.parse(localStorage.getItem('browseTeamsTableRows') ?? 'null') ?? [{
			toonPicture: '',
			trinketAPicture: '',
			trinketBPicture: '',
			badgeNames: [],
			roleNames: [],
			isVerifiedPlayerRequired: false,
			reservedFor: 'me',
			isLeftEmpty: false,
		}],
		browseTeamsChosenSettings: JSON.parse(
			localStorage.getItem('browseTeamsSettings') ?? 'null',
		) ?? {
			dandyRun: 'Any',
			earlyDyle: 'Any',
			region: 'Any',
			floorGoalFrom: '10',
			floorGoalTo: '100+',
		},
		browseTeamsChosenPlayersFromDropdownOption: localStorage.getItem('browseTeamsPlayersFrom') ?? '2',
		browseTeamsChosenPlayersToDropdownOption: localStorage.getItem('browseTeamsPlayersTo') ?? '8',
		browsedTeams: null,
		hasMoreBrowsedTeams: false,
		browsedTeamCount: 20,
		openedBrowsedSearchIds: null,
		joinedBrowsedTeam: null,
		browseTeamsError: '',
	}))

	// Fills the Toons and Trinkets side windows with pictures
	useEffect(() => loadSideWindowPictures({
		setToonsWindowPictures: (toonsWindowPictures) => {
			setState({ toonsWindowPictures })
			// A new player owns only the two toons that the game gives for free, and no trinkets
			if (localStorage.getItem('missingToons') === null) {
				const missingToons = toonsWindowPictures.filter((picture) => (
					!['poppy.png', 'boxten.png'].includes(picture)
				))
				localStorage.setItem('missingToons', JSON.stringify(missingToons))
				setState({ missingToons })
			}
		},
		setTrinketsWindowPictures: (trinketsWindowPictures) => {
			setState({ trinketsWindowPictures })
			if (localStorage.getItem('missingTrinkets') === null) {
				const missingTrinkets = [...trinketsWindowPictures]
				localStorage.setItem('missingTrinkets', JSON.stringify(missingTrinkets))
				setState({ missingTrinkets })
			}
		},
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

	// Keeps both counters at the bottom of the screen up to date, keeps the team on the server in
	// sync while it searches, once its invite link was copied, while this page is an invited
	// friend's, or while it joins a team of Browse Teams, and keeps the cards of Browse Teams up to
	// date while it is open. A change of any of those, or of what picks the cards, checks in again
	// right away.
	const isBrowseTeamsWindowOpen = state.openDesktopWindowName === 'Browse Teams'
	const browseTeamsFilterText = JSON.stringify([
		state.browseTeamsTableRows,
		state.missingToons,
		state.missingTrinkets,
		state.browsedTeamCount,
		state.browseTeamsChosenSettings,
		state.browseTeamsChosenPlayersFromDropdownOption,
		state.browseTeamsChosenPlayersToDropdownOption,
	])
	useEffect(() => checkInWithServer({
		pageId: getSyncState().pageId,
		inviteCode: getSyncState().inviteCode,
		getTeamTableRows: () => getSyncState().teamTableRows,
		getRemovedVerifiedFriendUsernames: () => getSyncState().removedVerifiedFriendUsernames,
		getMissingPictures: () => ({
			missingToons: getSyncState().missingToons,
			missingTrinkets: getSyncState().missingTrinkets,
		}),
		getIsInviteLinkCopied: () => getSyncState().isInviteLinkCopied,
		getTeamSettings: () => ({
			dandyRun: getSyncState().chosenDandyRunDropdownOption,
			earlyDyle: getSyncState().chosenEarlyDyleDropdownOption,
			region: getSyncState().chosenRegionDropdownOption,
			floorGoal: `${getSyncState().chosenFloorGoalFromDropdownOption} to ${
				getSyncState().chosenFloorGoalToDropdownOption
			}`,
		}),
		getServerLink: () => getSyncState().serverLink,
		getIsFindingPlayers: () => getSyncState().isFindingPlayers,
		getSearchId: () => getSyncState().searchId,
		getInviteFromLink: () => getSyncState().inviteFromLink,
		getShownTeamStatus: () => getSyncState().shownTeamStatus,
		getJoinedBrowsedTeam: () => getSyncState().joinedBrowsedTeam,
		getBrowseTeamsFilter: () => (getSyncState().openDesktopWindowName === 'Browse Teams' ? {
			toonPicture: getSyncState().browseTeamsTableRows[0].toonPicture,
			trinketAPicture: getSyncState().browseTeamsTableRows[0].trinketAPicture,
			trinketBPicture: getSyncState().browseTeamsTableRows[0].trinketBPicture,
			// Solar Support is crossed out unless the toon is Bobette, as in Find a Team
			roleNames: getSyncState().browseTeamsTableRows[0].roleNames.filter((role) => (
				role !== 'Solar Support'
				|| getSyncState().browseTeamsTableRows[0].toonPicture === 'bobette.png'
			)),
			missingToons: getSyncState().missingToons,
			missingTrinkets: getSyncState().missingTrinkets,
			dandyRun: getSyncState().browseTeamsChosenSettings.dandyRun,
			earlyDyle: getSyncState().browseTeamsChosenSettings.earlyDyle,
			region: getSyncState().browseTeamsChosenSettings.region,
			floorGoal: `${getSyncState().browseTeamsChosenSettings.floorGoalFrom} to ${
				getSyncState().browseTeamsChosenSettings.floorGoalTo
			}`,
			playersFrom: Number(getSyncState().browseTeamsChosenPlayersFromDropdownOption),
			playersTo: Number(getSyncState().browseTeamsChosenPlayersToDropdownOption),
			browsedTeamCount: getSyncState().browsedTeamCount,
		} : null),
		getOpenedBrowsedSearchIds: () => getSyncState().openedBrowsedSearchIds,
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
		setBrowsedTeams: (browsedTeams) => setState({ browsedTeams }),
		setHasMoreBrowsedTeams: (hasMoreBrowsedTeams) => setState({ hasMoreBrowsedTeams }),
		setJoinedBrowsedTeam: (joinedBrowsedTeam) => setState({ joinedBrowsedTeam }),
		setBrowseTeamsError: (browseTeamsError) => setState({ browseTeamsError }),
		setOpenedBrowsedSearchIds: (openedBrowsedSearchIds) => setState({ openedBrowsedSearchIds }),
	}), [
		state.isFindingPlayers,
		state.inviteFromLink,
		state.isInviteLinkCopied,
		state.joinedBrowsedTeam,
		isBrowseTeamsWindowOpen,
		browseTeamsFilterText,
		getSyncState,
		setState,
	])

	// Remembers the slot and the TEAM SETTINGS of Browse Teams across reloads
	// mutateState keeps the rows array's identity while editing its row, so the row is compared
	// as text
	const browseTeamsTableRowsText = JSON.stringify(state.browseTeamsTableRows)
	useEffect(() => localStorage.setItem(
		'browseTeamsTableRows',
		browseTeamsTableRowsText,
	), [browseTeamsTableRowsText])
	useEffect(() => localStorage.setItem(
		'browseTeamsSettings',
		JSON.stringify(state.browseTeamsChosenSettings),
	), [state.browseTeamsChosenSettings])
	useEffect(() => {
		localStorage.setItem('browseTeamsPlayersFrom', state.browseTeamsChosenPlayersFromDropdownOption)
		localStorage.setItem('browseTeamsPlayersTo', state.browseTeamsChosenPlayersToDropdownOption)
	}, [
		state.browseTeamsChosenPlayersFromDropdownOption,
		state.browseTeamsChosenPlayersToDropdownOption,
	])
	const { invitingTeam } = state
	// A join in Browse Teams gets the status of its own one-slot table, which Find a Team leaves out
	const shownTeamStatus = state.joinedBrowsedTeam ? null : state.shownTeamStatus
	const isInvitedFriend = Boolean(state.inviteFromLink)
	// An invited friend only watches the team, and a searching team cannot change. The search of
	// a found team ends on the server, while the page keeps it running until "Team found!" closes,
	// so that the Player column keeps the found players.
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
			if (!isInvitedFriend) return visibleTexts.playerNames.me
			return invitingTeam?.hostRobloxUsername
				? visibleTexts.playerNames.robloxUsername(invitingTeam.hostRobloxUsername)
				: visibleTexts.playerNames.host
		}
		if (reservedFor.startsWith('unverifiedFriend:')) {
			return visibleTexts.playerNames.numberedUnverifiedFriend(reservedFor.split(':')[1])
		}
		const username = reservedFor.slice('verifiedFriend:'.length)
		return !shownTeamStatus || verifiedFriendUsernamesInTeam.includes(username)
			? visibleTexts.playerNames.robloxUsername(username)
			: visibleTexts.playerNames.verifiedFriendWhoLeft(username)
	}

	// Opens the team found window as soon as the server link of the team arrives, together with the
	// bell!, the notification and the automatic join that Options turned on. Team
	// Details of Browse Teams closes, since a found team leaves the list of searching teams.
	const teamServerLink = state.shownTeamStatus?.teamServerLink ?? ''
	useEffect(() => {
		if (!teamServerLink) return
		setState({
			isTeamFoundWindowOpen: true,
			openedBrowsedSearchIds: null,
		})
		return announceTeamFound({
			teamServerLink,
			isDingSoundCheckboxChecked: getSyncState().isDingSoundCheckboxChecked,
			isNotificationCheckboxChecked: getSyncState().isNotificationCheckboxChecked,
			isJoinAutomaticallyCheckboxChecked: getSyncState().isJoinAutomaticallyCheckboxChecked,
		})
	}, [teamServerLink, getSyncState, setState])

	// Clears the red error below Find Players once the user changes what it complained about.
	// mutateState keeps the rows array's identity, so the rows are compared as text.
	const teamTableRowsText = JSON.stringify(state.teamTableRows)
	useEffect(() => setState({ findPlayersError: '' }), [
		teamTableRowsText,
		state.serverLink,
		state.chosenDandyRunDropdownOption,
		state.chosenEarlyDyleDropdownOption,
		state.chosenRegionDropdownOption,
		state.chosenFloorGoalFromDropdownOption,
		state.chosenFloorGoalToDropdownOption,
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

	// A tap on a tile or a name of the pick window that a Find a Team or YOUR SLOT card box opened,
	// which fills the table of that box
	const tableRowsKeyInPickWindow = () => (
		getSyncState().cardBoxInPickWindow?.tableRowsKey ?? 'teamTableRows'
	)
	const pick = (pick: {
		kind: 'picture' | 'leave-empty' | 'reserved-for'
		name: string
	}) => pickInPickWindow({
		getCardBoxInPickWindow: () => getSyncState().cardBoxInPickWindow,
		getRowPicture: ({
			index,
			column,
		}) => getSyncState()[tableRowsKeyInPickWindow()][index][column],
		setPicture: ({
			index,
			column,
			picture,
		}) => mutateState((state) => {
			state[tableRowsKeyInPickWindow()][index][column] = picture
		}),
		setIsLeftEmpty: (index) => mutateState((state) => {
			state[tableRowsKeyInPickWindow()][index].isLeftEmpty = true
		}),
		setReservedFor: ({
			index,
			reservedFor,
		}) => mutateState((state) => {
			state[tableRowsKeyInPickWindow()][index].reservedFor = reservedFor
		}),
		setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
		pick,
	})

	// "TEAM SETTINGS" group box of Find a Team and of Browse Teams, which each keep their own chosen
	// options: Dandy Run and Early Dyle in the left column, where Any matches a team with either
	// choice, and Region, Floor goal and, in Browse Teams only, Players in the right column
	const teamSettingsGroupBoxOf = ({
		areDropdownsLocked,
		chosenOptions,
		chooseOption,
		players,
	}: {
		areDropdownsLocked: boolean
		chosenOptions: TeamSettingsChosenOptions
		chooseOption: (choice: {
			setting: keyof TeamSettingsChosenOptions
			chosenOption: string
		}) => void
		players: {
			chosenFromOption: string
			chosenToOption: string
			chooseFromOption: (chosenOption: string) => void
			chooseToOption: (chosenOption: string) => void
		} | null
	}) => {
		const playersDropdownOptions = [
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
		]
		return {
			areDropdownsLocked,
			// Each dropdown of Players offers only the counts that keep "from" at or below "to"
			players: players && {
				fromDropdownOptions: playersDropdownOptions.slice(
					0,
					playersDropdownOptions.indexOf(players.chosenToOption) + 1,
				),
				chosenFromDropdownOption: players.chosenFromOption,
				chooseFromDropdownOption: players.chooseFromOption,
				toDropdownOptions: playersDropdownOptions.slice(
					playersDropdownOptions.indexOf(players.chosenFromOption),
				),
				chosenToDropdownOption: players.chosenToOption,
				chooseToDropdownOption: players.chooseToOption,
			},
			dandyRunAndEarlyDyleDropdownOptions: [
				'Any',
				'Yes',
				'No',
			],
			chosenDandyRunDropdownOption: chosenOptions.dandyRun,
			chooseDandyRunDropdownOption: (chosenOption: string) => chooseOption({
				setting: 'dandyRun',
				chosenOption,
			}),
			chosenEarlyDyleDropdownOption: chosenOptions.earlyDyle,
			chooseEarlyDyleDropdownOption: (chosenOption: string) => chooseOption({
				setting: 'earlyDyle',
				chosenOption,
			}),
			regionDropdownOptions: [
				'Any',
				'Africa',
				'Asia',
				'Europe',
				'North America',
				'South America',
				'Oceania',
			],
			chosenRegionDropdownOption: chosenOptions.region,
			chooseRegionDropdownOption: (chosenOption: string) => chooseOption({
				setting: 'region',
				chosenOption,
			}),
			// Each dropdown of the Floor goal offers only the floors that keep "from" at or below "to"
			floorGoalFromDropdownOptions: floorGoalDropdownOptions.slice(
				0,
				floorGoalDropdownOptions.indexOf(chosenOptions.floorGoalTo) + 1,
			),
			chosenFloorGoalFromDropdownOption: chosenOptions.floorGoalFrom,
			chooseFloorGoalFromDropdownOption: (chosenOption: string) => chooseOption({
				setting: 'floorGoalFrom',
				chosenOption,
			}),
			floorGoalToDropdownOptions: floorGoalDropdownOptions.slice(
				floorGoalDropdownOptions.indexOf(chosenOptions.floorGoalFrom),
			),
			chosenFloorGoalToDropdownOption: chosenOptions.floorGoalTo,
			chooseFloorGoalToDropdownOption: (chosenOption: string) => chooseOption({
				setting: 'floorGoalTo',
				chosenOption,
			}),
		}
	}


	// Bugs in the game and players are reported on the official Discord server instead
	const isReportTopicForDiscord = [
		visibleTexts.contactReport.bugInTheGameTopic,
		visibleTexts.contactReport.playerTopic,
	].includes(state.chosenReportTopicDropdownOption)

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
			mark: badge.owned
				? visibleTexts.robloxVerification.ownedBadgeMark
				: visibleTexts.robloxVerification.missingBadgeMark,
		})),
		badgeChecklistLoadingText: (
			state.robloxVerificationError || visibleTexts.robloxVerification.badgeChecklistLoading
		),
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
		copyButtonText: state.isVerificationEmojiCodeCopied
			? visibleTexts.robloxVerification.copiedButton
			: visibleTexts.robloxVerification.copyButton,
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
			if (state.isVerificationNeededToJoin) return visibleTexts.findATeam.verifyToJoin
			if (!invitingTeam) return visibleTexts.findATeam.joiningInvitingTeam
			return invitingTeam.hostRobloxUsername
				? visibleTexts.findATeam.inHostsTeam(invitingTeam.hostRobloxUsername)
				: visibleTexts.findATeam.inUnverifiedHostsTeam
		})(),

		// Greys out the Toons and Trinkets side windows while the table is locked
		sideWindowClass: isTableLocked ? 'window team-locked' : 'window',
		// Line under the titles of the Toons and Trinkets side windows
		sideWindowDragHint: visibleTexts.sideWindows.dragHint,
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
		toonsWindowTiles: ownedPicturesFirst(state.toonsWindowPictures, state.missingToons).map((name) => ({
			name,
			src: `/pixelated/toons/${name}`,
			title: name.replace('.png', ''),
			isOwned: !state.missingToons.includes(name),
			dragFromSideWindow: () => dragFromSideWindow({
				setDraggedItem: (draggedItem) => setState({ draggedItem }),
				kind: 'toon',
				name,
			}),
		})),

		// Trinket pictures in the Trinkets side window to the upper right
		trinketsWindowTiles: ownedPicturesFirst(
			state.trinketsWindowPictures,
			state.missingTrinkets,
		).map((name) => ({
			name,
			src: `/pixelated/trinkets/${name}`,
			title: name.replace('.png', ''),
			isOwned: !state.missingTrinkets.includes(name),
			dragFromSideWindow: () => dragFromSideWindow({
				setDraggedItem: (draggedItem) => setState({ draggedItem }),
				kind: 'trinket',
				name,
			}),
		})),

		// "N/N Toons" and "N/N Trinkets" buttons right of the drag hints, which count the owned
		// pictures and open the My Toons or My Trinkets window
		ownedToonsButtonText: visibleTexts.sideWindows.ownedToonsButton({
			ownedCount: state.toonsWindowPictures
				.filter((name) => !state.missingToons.includes(name)).length,
			totalCount: state.toonsWindowPictures.length,
		}),
		openOwnedToonsWindow: () => setState({ openOwnedPicturesWindowKind: 'toon' }),
		ownedTrinketsButtonText: visibleTexts.sideWindows.ownedTrinketsButton({
			ownedCount: state.trinketsWindowPictures
				.filter((name) => !state.missingTrinkets.includes(name)).length,
			totalCount: state.trinketsWindowPictures.length,
		}),
		openOwnedTrinketsWindow: () => setState({ openOwnedPicturesWindowKind: 'trinket' }),
		// The "N/N" buttons are greyed out, with this tooltip, while a search or a join of Browse
		// Teams runs
		areOwnedPicturesButtonsDisabled: state.isFindingPlayers || Boolean(state.joinedBrowsedTeam),
		ownedPicturesButtonsTooltip: state.isFindingPlayers || state.joinedBrowsedTeam
			? visibleTexts.sideWindows.ownedPicturesButtonsTooltip
			: '',

		// My Toons or My Trinkets window in the middle of the screen, with the pictures in category
		// groups. Clicking a tile changes its owned or missing status. All pictures stay available in
		// the side and pick windows. Its close controls work as usual.
		...(() => {
			const isToonsWindow = state.openOwnedPicturesWindowKind === 'toon'
			const pictures = isToonsWindow ? state.toonsWindowPictures : state.trinketsWindowPictures
			const missingPictures = isToonsWindow ? state.missingToons : state.missingTrinkets
			const localStorageKey = isToonsWindow ? 'missingToons' : 'missingTrinkets'
			const categories: {
				title: string
				names: string[]
			}[] = isToonsWindow ? [
				{
					title: visibleTexts.ownedPicturesWindow.mainCharacters,
					names: [
						'astro',
						'pebble',
						'shelly',
						'sprout',
						'vee',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.secondaryCharacters,
					names: [
						'poppy',
						'boxten',
						'connie',
						'cosmo',
						'finn',
						'glisten',
						'teagan',
						'rodger',
						'toodles',
						'brusha',
						'tisha',
						'goob',
						'scraps',
						'gigi',
						'flutter',
						'brightney',
						'razzle_and_dazzle',
						'squirm',
						'looey',
						'yatta',
						'blot',
						'shrimpo',
						'waxwell',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.christmasToons,
					names: [
						'bobette',
						'coal',
						'ginger',
						'rudie',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.halloweenToons,
					names: [
						'gourdy',
						'soulvester',
						'eclipse',
						'ribecca',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.easterToons,
					names: [
						'bassie',
						'cocoa',
						'flyte',
						'eggson',
					],
				},
			] : [
				{
					title: visibleTexts.ownedPicturesWindow.skillcheck,
					names: [
						'magnifying_glass',
						'mime_makeup',
						'paint_bucket',
						'participation_award',
						'thinking_cap',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.moveSpeed,
					names: [
						'alarm',
						'bone',
						'brick',
						'clown_horn',
						'dog_plush',
						'pink_bow',
						'pull_toy',
						'ribbon_spool',
						'speedy_shoes',
						'train_whistle',
						'vanity_mirror',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.stamina,
					names: [
						'cooler',
						'feather_duster',
						'friendship_bracelet',
						'peppermint_icing',
						'pop_pack',
						'speedometer',
						'star_pillow',
						'thermos',
						'whispering_flower',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.stealth,
					names: [
						'coal_trinket_',
						'diary',
						'megaphone',
						'scrapbook',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.extractionSpeed,
					names: [
						'blue_bandana',
						'machine_manual',
						'stress_ball',
						'vees_remote',
						'wrench',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.abilityCooldown,
					names: [
						'ghost_snakes_in_a_can',
						'sweet_charm',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.hitPrevention,
					names: [
						'blushy_bat',
						'cardboard_armor',
						'savory_charm',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.itemFindingAndUsage,
					names: [
						'crayon_set',
						'glazed_fondant_bag',
						'memory_locket',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.toonSpecificTrinkets,
					names: [
						'cherished_blanket',
						'lucky_coin',
						'soul_sword',
						'toy_kit',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.tapeTrinkets,
					names: [
						'coin_purse',
						'dandy_plush',
						'fancy_purse',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.researchAndHolidayCurrencyTrinkets,
					names: [
						'bone_needle_and_thread',
						'egg_radar',
						'festive_lights',
						'research_map',
					],
				},
				{
					title: visibleTexts.ownedPicturesWindow.visibilityTrinkets,
					names: [
						'fishing_rod',
						'moon_pack_heirloom',
						'party_popper',
						'spare_bulb',
					],
				},
			]
			const categorizedPictures = categories.flatMap((category) => (
				category.names.map((name) => `${name}.png`)
			))
			// A picture that the server has but no category lists yet goes into a last "More" group
			const uncategorizedNames = pictures
				.filter((name) => !categorizedPictures.includes(name))
				.map((name) => name.replace('.png', ''))
			return {
				isOwnedPicturesWindowOpen: Boolean(state.openOwnedPicturesWindowKind),
				closeOwnedPicturesWindow: () => setState({ openOwnedPicturesWindowKind: null }),
				ownedPicturesWindowTitle: isToonsWindow
					? visibleTexts.ownedPicturesWindow.toonsTitle
					: visibleTexts.ownedPicturesWindow.trinketsTitle,
				ownedPicturesWindowHint: visibleTexts.ownedPicturesWindow.hint,
				ownedPicturesWindowCategories: [
					...categories,
					...uncategorizedNames.length
						? [{
							title: visibleTexts.ownedPicturesWindow.more,
							names: uncategorizedNames,
						}]
						: [],
				].map((category) => ({
					title: category.title,
					tiles: category.names
						.map((name) => `${name}.png`)
						.filter((name) => pictures.includes(name))
						.map((name) => ({
							name,
							src: `/pixelated/${isToonsWindow ? 'toons' : 'trinkets'}/${name}`,
							title: name.replace('.png', ''),
							isMissing: missingPictures.includes(name),
							isToon: isToonsWindow,
							ownedMark: missingPictures.includes(name)
								? ''
								: isToonsWindow
									? visibleTexts.ownedPicturesWindow.ownedToonMark
									: visibleTexts.ownedPicturesWindow.ownedTrinketMark,
							missingMark: missingPictures.includes(name)
								? visibleTexts.ownedPicturesWindow.missingMark
								: '',
							toggle: () => toggleOwnedPictureTile({
								localStorageKey,
								getMissingPictures: () => (
									localStorageKey === 'missingToons'
										? getSyncState().missingToons
										: getSyncState().missingTrinkets
								),
								setMissingPictures: (missingPictures) => setState({
									[localStorageKey]: missingPictures,
								}),
								name,
							}),
						})),
				})),
			}
		})(),

		// Reserved window below the Trinkets window, with "Me", every verified friend who opened the
		// invite link and every unverified friend as a chip that drags into the Player column.
		// Every friend's chip has an × that removes the friend. Group boxes separate "Me", the
		// verified friends with "Copy invite link", and the unverified friends with their add button. An
		// invited friend only watches the host's team, so they do not see this window.
		showReservedWindow: !isInvitedFriend,
		reservedWindowDragHint: visibleTexts.reservedSlots.dragHint,
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
		copyInviteLinkButtonText: state.isCopiedTextShown
			? visibleTexts.reservedSlots.copiedInviteLinkButton
			: visibleTexts.reservedSlots.copyInviteLinkButton,
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
					[
						'Quick Reaction Time',
						'Just Keep Swimming',
					],
					[
						'Double Digits!',
						'Skilled Toon!',
						'Super Skilled Pro!',
						'Twisteds Fear Me.',
					],
				].filter((group) => (
					group.includes(badge.name) || group.includes(ownedBadges[index - 1].name)
				)).length === 2,
				// A checked later badge of the same category proves this badge, so this badge then
				// looks checked and greyed out, whether or not it is checked itself
				isChecked: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames
					.includes(badge.name) || isBadgeProvenByLaterCheckedBadge({
					badgeName: badge.name,
					checkedBadgeNames: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames,
				}),
				isGreyedOut: isBadgeProvenByLaterCheckedBadge({
					badgeName: badge.name,
					checkedBadgeNames: state.teamTableRows[state.rowIndexInBadgesWindow].badgeNames,
				}),
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
		badgesWindowCopyButtonText: state.badgesWindowConfirmedButton === 'Copy'
			? visibleTexts.checklistWindows.copiedButton
			: visibleTexts.checklistWindows.copyButton,
		badgesWindowPasteButtonText: state.badgesWindowConfirmedButton === 'Paste'
			? visibleTexts.checklistWindows.pastedButton
			: visibleTexts.checklistWindows.pasteButton,
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
			isChecked: state[state.tableRowsKeyInRolesWindow][state.rowIndexInRolesWindow].roleNames
				.includes(name),
			isGreyedOut: false,
			toggleCheckbox: (isChecked: boolean) => toggleRoleCheckbox({
				getRoleNames: () => getSyncState()[getSyncState().tableRowsKeyInRolesWindow][
					getSyncState().rowIndexInRolesWindow
				].roleNames,
				setRoleNames: (roleNames) => mutateState((state) => {
					state[state.tableRowsKeyInRolesWindow][state.rowIndexInRolesWindow].roleNames = roleNames
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
		rolesWindowCopyButtonText: state.rolesWindowConfirmedButton === 'Copy'
			? visibleTexts.checklistWindows.copiedButton
			: visibleTexts.checklistWindows.copyButton,
		rolesWindowPasteButtonText: state.rolesWindowConfirmedButton === 'Paste'
			? visibleTexts.checklistWindows.pastedButton
			: visibleTexts.checklistWindows.pasteButton,
		isRolesWindowPasteDisabled: !state.copiedRoleNames,
		copyRolesWindowNames: () => copyChecklistNames({
			checkedNames: state[state.tableRowsKeyInRolesWindow][state.rowIndexInRolesWindow].roleNames,
			setCopiedNames: (copiedRoleNames) => setState({ copiedRoleNames }),
			setConfirmedButton: (rolesWindowConfirmedButton) => setState({
				rolesWindowConfirmedButton,
			}),
		}),
		pasteRolesWindowNames: () => pasteChecklistNames({
			copiedNames: state.copiedRoleNames ?? [],
			setCheckedNames: (roleNames) => mutateState((state) => {
				state[state.tableRowsKeyInRolesWindow][state.rowIndexInRolesWindow].roleNames = roleNames
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
			const chosenName = cardBox ? state[cardBox.tableRowsKey][cardBox.index][cardBox.column] : ''
			const isToonBox = cardBox?.column === 'toonPicture'
			const pictureFolder = isToonBox ? 'toons' : 'trinkets'
			const isBrowseTeamsSlot = cardBox?.tableRowsKey === 'browseTeamsTableRows'
			const pictures = isToonBox ? state.toonsWindowPictures : state.trinketsWindowPictures
			const missingPictures = isToonBox ? state.missingToons : state.missingTrinkets
			const ownedPictures = pictures.filter((name) => !missingPictures.includes(name))
			const missingPictureChoices = isBrowseTeamsSlot
				? []
				: pictures.filter((name) => missingPictures.includes(name))
			const sectionHeader = (name: string) => ({
				key: `section-${name}`,
				text: name,
				src: '',
				title: '',
				isChosen: false,
				isSectionHeader: true as const,
			})
			const pictureTile = (name: string) => ({
				key: name,
				text: '',
				src: `/pixelated/${pictureFolder}/${name}`,
				title: name.replace('.png', ''),
				isChosen: name === chosenName,
				pick: () => pick({
					kind: 'picture' as const,
					name,
				}),
			})
			return {
				isPickWindowOpen: Boolean(cardBox),
				closePickWindow: () => setState({ cardBoxInPickWindow: null }),
				pickWindowTitle: (() => {
					if (cardBox?.column === 'reservedFor') return visibleTexts.reservedSlots.title
					return isToonBox
						? visibleTexts.sideWindows.toonsTitle
						: visibleTexts.sideWindows.trinketsTitle
				})(),
				showPickWindowTiles: cardBox?.column !== 'reservedFor',
				// "N/N Toons" or "N/N Trinkets" button above the tiles, which opens the My Toons or My
				// Trinkets window on top
				pickWindowOwnedPicturesButtonText: (isToonBox
					? visibleTexts.sideWindows.ownedToonsButton
					: visibleTexts.sideWindows.ownedTrinketsButton)({
					ownedCount: ownedPictures.length,
					totalCount: pictures.length,
				}),
				openOwnedPicturesWindowFromPickWindow: () => setState({
					openOwnedPicturesWindowKind: isToonBox ? 'toon' : 'trinket',
				}),
				// "(Any)" and, for a Toon box of Find a Team, "(Leave Empty)" come before the pictures.
				// The tile that the box holds has a navy frame.
				pickWindowTiles: [
					{
						key: '(Any)',
						text: visibleTexts.teamTable.any,
						src: '',
						title: visibleTexts.sideWindows.anyTileTooltip,
						isChosen: !chosenName,
						pick: () => pick({
							kind: 'picture',
							name: '',
						}),
					},
					...isToonBox && cardBox?.tableRowsKey === 'teamTableRows' ? [{
						key: '(Leave Empty)',
						text: visibleTexts.teamTable.leaveEmpty,
						src: '',
						title: visibleTexts.sideWindows.leaveEmptyTileTooltip,
						isChosen: false,
						pick: () => pick({
							kind: 'leave-empty',
							name: '',
						}),
					}] : [],
					...(ownedPictures.length
						? [
							...(isBrowseTeamsSlot
								? []
								: [sectionHeader(visibleTexts.sideWindows.ownedSection)]),
							...ownedPictures.map(pictureTile),
						]
						: []),
					...(missingPictureChoices.length
						? [
							sectionHeader(visibleTexts.sideWindows.missingSection),
							...missingPictureChoices.map(pictureTile),
						]
						: []),
				],
				pickWindowFindAPlayerButtonText: visibleTexts.teamTable.findAPlayer,
				pickFindAPlayer: () => pick({
					kind: 'reserved-for',
					name: '',
				}),
			}
		})(),

		// A drag from the table that ends anywhere else empties its cell
		landDragOnTable: () => setState({ tableDragLandedOnTable: true }),

		...(() => {
			// Rows of a white table, and the cards that replace them on a narrow screen
			const tableRowsOf = ({
				tableRowsKey,
				rows,
				isTableLocked,
				getIsTableLocked,
				cardTitleOf,
			}: {
				tableRowsKey: TableRowsKey
				rows: TeamTableRow[]
				isTableLocked: boolean
				getIsTableLocked: () => boolean
				cardTitleOf: (index: number) => string
			}) => rows.map((row, index) => ({
				key: index,

				// Dropping "(Leave Empty)" anywhere on the row
				canDropLeaveEmptyOnRow: !isTableLocked && state.draggedItem?.kind === 'leave-empty',
				leaveRowEmpty: () => leaveRowEmpty({
					getDraggedItem: () => getSyncState().draggedItem,
					setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
						state[tableRowsKey][index].isLeftEmpty = isLeftEmpty
					}),
				}),

				// Grey "(Leave Empty)" cell that spans the whole row and clears when clicked
				isLeftEmpty: row.isLeftEmpty,
				leaveEmptyCellColSpan: isRobloxVerified ? 6 : 5,
				leaveEmptyCellClass: isTableLocked
					? 'team-disabled'
					: 'team-disabled team-clickable',
				undoLeaveRowEmpty: () => undoLeaveRowEmpty({
					getIsTableLocked,
					setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
						state[tableRowsKey][index].isLeftEmpty = isLeftEmpty
					}),
				}),
				// Dropping a toon or trinket on the "(Leave Empty)" cell
				canDropPictureOnLeftEmptyRow: !isTableLocked && (
					state.draggedItem?.kind === 'toon' || state.draggedItem?.kind === 'trinket'
				),
				dropPictureOnLeftEmptyRow: () => dropPictureOnLeftEmptyRow({
					getDraggedItem: () => getSyncState().draggedItem,
					getRowPicture: (column) => getSyncState()[tableRowsKey][index][column],
					setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
						state[tableRowsKey][index].isLeftEmpty = isLeftEmpty
					}),
					setPicture: ({
						column, name,
					}) => mutateState((state) => {
						state[tableRowsKey][index][column] = name
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
							getRowPicture: (rowColumn) => getSyncState()[tableRowsKey][index][rowColumn],
							setPicture: (picture) => mutateState((state) => {
								state[tableRowsKey][index][column] = picture
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
							toonPicture: visibleTexts.teamTable.toonColumn,
							trinketAPicture: visibleTexts.teamTable.trinketAColumn,
							trinketBPicture: visibleTexts.teamTable.trinketBColumn,
						}[column],
						cardBoxClass: isTableLocked
							? 'team-card-box team-card-picture-box'
							: 'team-card-box team-card-picture-box team-clickable',
						tapCardBox: () => tapFindATeamCardBox({
							getIsTableLocked,
							setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
							cardBox: {
								tableRowsKey,
								index,
								column,
							},
						}),

						// Grey "(Any)" text in an empty Toon or Trinket cell
						anyText: row[column] ? '' : visibleTexts.teamTable.any,

						// Picture inside the cell, which drags to another cell or out of the table to
						// clear it
						picture: row[column] ? {
							src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
							title: row[column].replace('.png', ''),
							isMissingForMe: tableRowsKey === 'teamTableRows'
								&& (row.reservedFor === 'me'
									|| (!isInvitedFriend
										&& !isRobloxVerified
										&& shownTeamStatus?.hostRowIndex === index))
								&& (column === 'toonPicture'
									? state.missingToons.includes(row[column])
									: state.missingTrinkets.includes(row[column])),
							draggable: !isTableLocked,
							dragPictureFromTable: () => dragPictureFromTable({
								getPicture: () => getSyncState()[tableRowsKey][index][column],
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
									state[tableRowsKey][index][column] = picture
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
				cardTitle: cardTitleOf(index),
				leftEmptyCardBoxClass: isTableLocked
					? 'team-card-box team-card-left-empty'
					: 'team-card-box team-card-left-empty team-clickable',
				openBadgesWindow: () => openBadgesOrRolesWindow({
					getIsTableLocked,
					setRowIndexInWindow: (rowIndexInBadgesWindow) => setState({ rowIndexInBadgesWindow }),
					setIsWindowOpen: (isBadgesWindowOpen) => setState({ isBadgesWindowOpen }),
					index,
				}),
				openRolesWindow: () => openBadgesOrRolesWindow({
					getIsTableLocked,
					setRowIndexInWindow: (rowIndexInRolesWindow) => setState({
						rowIndexInRolesWindow,
						tableRowsKeyInRolesWindow: tableRowsKey,
					}),
					setIsWindowOpen: (isRolesWindowOpen) => setState({ isRolesWindowOpen }),
					index,
				}),

				// Grey "(none required)" text in an empty Badges or Role cell
				noBadgesText: row.badgeNames.length ? '' : visibleTexts.teamTable.noneRequired,
				noRolesText: row.roleNames.length ? '' : visibleTexts.teamTable.noneRequired,

				// Badge names stacked in the Badges cell, the fourth column, shown only once verified.
				// They are crossed out while "Verified only" is unchecked. A badge that a checked later
				// badge of its category proves is left out.
				badges: row.badgeNames.filter((name) => !isBadgeProvenByLaterCheckedBadge({
					badgeName: name,
					checkedBadgeNames: row.badgeNames,
				})).map((name) => ({
					name,
					isCrossedOut: !row.isVerifiedPlayerRequired
						|| (tableRowsKey === 'teamTableRows'
							&& (row.reservedFor === 'me'
								|| (!isInvitedFriend
									&& !isRobloxVerified
									&& shownTeamStatus?.hostRowIndex === index))
							&& state.robloxBadgeChecklist?.some((badge) => (
								badge.name === name && !badge.owned
							))),
				})),
				badgesCellTooltip: row.isVerifiedPlayerRequired || !row.badgeNames.length
					? visibleTexts.teamTable.badgesCellTooltip
					: visibleTexts.teamTable.badgesCellUnverifiedOnlyTooltip,

				// Role names stacked in the Role cell after Badges.
				// Solar Support is crossed out when the toon is not Bobette.
				roles: row.roleNames
					.map((name) => {
						const isCrossedOut = name === 'Solar Support' && row.toonPicture !== 'bobette.png'
						return {
							name,
							isCrossedOut,
							crossedOutTooltip: isCrossedOut
								? visibleTexts.teamTable.solarSupportTooltip
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
					const playerInRowName = isOwnUnverifiedRow
						? visibleTexts.playerNames.me
						: playerNameOf(playerInRow)
					// A searching row without a player shows "Finding player..." once the server told
					// which rows the team's own players are in, since a chip on several rows takes
					// only one of them
					const showFindingPlayerText = isSearching
					&& Boolean(shownTeamStatus)
					&& !playerInRow
					return {
					// Player box of the row's card on a narrow screen, which opens the Reserved Slots
					// pick window when tapped, and reads "(Find a player)" while it holds no name
						tapPlayerCardBox: () => tapFindATeamCardBox({
							getIsTableLocked,
							setCardBoxInPickWindow: (cardBoxInPickWindow) => setState({ cardBoxInPickWindow }),
							cardBox: {
								tableRowsKey,
								index,
								column: 'reservedFor',
							},
						}),
						findAPlayerText: !isTableLocked && !row.reservedFor
							? visibleTexts.teamTable.findAPlayer
							: '',
						showFindingPlayerText,
						// "Player found!" above the name of a player who took the row with a Join button
						// of Browse Teams, while the team keeps searching
						showPlayerFoundText: isSearching
						&& Boolean(shownTeamStatus?.browseTeamsPlayerRowIndexes.includes(index)),
						showPlayerName: isTableLocked && !showFindingPlayerText,
						playerName: visibleTexts.playerNames.inBrackets(playerInRowName || (() => {
							if (row.reservedFor) return reservationChipText(row.reservedFor)
							return isRobloxVerified && row.isVerifiedPlayerRequired
								? visibleTexts.playerNames.findVerifiedPlayer
								: visibleTexts.playerNames.findAnyPlayer
						})()),
						// Dropping a chip from the Reserved window or from another Player cell
						canDropReservationOnPlayerCell: !isTableLocked
						&& state.draggedItem?.kind === 'reserved-for',
						dropReservationOnPlayerCell: () => dropReservationOnPlayerCell({
							getDraggedItem: () => getSyncState().draggedItem,
							setReservedFor: (reservedFor) => mutateState((state) => {
								state[tableRowsKey][index].reservedFor = reservedFor
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
								getReservedFor: () => getSyncState()[tableRowsKey][index].reservedFor,
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
									state[tableRowsKey][index].reservedFor = reservedFor
								}),
							}),
						} : null,

						// "Verified only" checkbox below the chip, only for a verified host
						showVerifiedOnlyCheckbox: isRobloxVerified && !isTableLocked,
						verifiedOnlyCheckboxTooltip: visibleTexts.teamTable.verifiedOnlyCheckboxTooltip,
						isVerifiedOnlyCheckboxChecked: row.isVerifiedPlayerRequired,
						toggleVerifiedOnlyCheckbox: (isChecked: boolean) => toggleVerifiedOnlyCheckbox({
							setIsVerifiedPlayerRequired: (isVerifiedPlayerRequired) => mutateState((state) => {
								state[tableRowsKey][index].isVerifiedPlayerRequired = isVerifiedPlayerRequired
							}),
							isChecked,
						}),
					}
				})(),
			}))
			return {
				// Rows of the white table in the middle of Find a Team
				teamTableRows: tableRowsOf({
					tableRowsKey: 'teamTableRows',
					rows: shownTeamTableRows,
					isTableLocked,
					getIsTableLocked: () => (
						getSyncState().isFindingPlayers || Boolean(getSyncState().inviteFromLink)
					),
					cardTitleOf: (index) => visibleTexts.teamTable.playerSlotCardTitle(index + 1),
				}),
				// Row of YOUR SLOT at the top of Browse Teams, which a join locks
				browseTeamsTableRows: tableRowsOf({
					tableRowsKey: 'browseTeamsTableRows',
					rows: state.browseTeamsTableRows,
					isTableLocked: Boolean(state.joinedBrowsedTeam),
					getIsTableLocked: () => Boolean(getSyncState().joinedBrowsedTeam),
					cardTitleOf: () => visibleTexts.teamTable.yourSlotCardTitle,
				}),
			}
		})(),
		// Tooltip of the Player column header, which explains what a row without a chip means
		playerColumnHeaderTooltip: visibleTexts.teamTable.playerColumnTooltip,


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

		// TEAM SETTINGS below the server link field
		// An invited friend sees the settings of the team that invited them, whose floor goal the
		// server sends as "40 to 60"
		findATeamSettings: teamSettingsGroupBoxOf({
			areDropdownsLocked: isTableLocked,
			chosenOptions: invitingTeam ? {
				dandyRun: invitingTeam.dandyRun,
				earlyDyle: invitingTeam.earlyDyle,
				region: invitingTeam.region,
				floorGoalFrom: invitingTeam.floorGoal.split(' to ')[0],
				floorGoalTo: invitingTeam.floorGoal.split(' to ')[1],
			} : {
				dandyRun: state.chosenDandyRunDropdownOption,
				earlyDyle: state.chosenEarlyDyleDropdownOption,
				region: state.chosenRegionDropdownOption,
				floorGoalFrom: state.chosenFloorGoalFromDropdownOption,
				floorGoalTo: state.chosenFloorGoalToDropdownOption,
			},
			chooseOption: ({
				setting,
				chosenOption,
			}) => chooseTeamSettingsDropdownOption({
				localStorageKey: {
					dandyRun: 'dandyRunOption',
					earlyDyle: 'earlyDyleOption',
					region: 'region',
					floorGoalFrom: 'floorGoalFrom',
					floorGoalTo: 'floorGoalTo',
				}[setting],
				setChosenOption: (chosenOption) => setState({
					[{
						dandyRun: 'chosenDandyRunDropdownOption',
						earlyDyle: 'chosenEarlyDyleDropdownOption',
						region: 'chosenRegionDropdownOption',
						floorGoalFrom: 'chosenFloorGoalFromDropdownOption',
						floorGoalTo: 'chosenFloorGoalToDropdownOption',
					}[setting]]: chosenOption,
				}),
				chosenOption,
			}),
			players: null,
		}),

		// Find Players button at the bottom right of Find a Team, with its spinner and the red
		// error line below it. An invited friend only watches, so they get no button.
		showFindPlayersButton: !isInvitedFriend,
		toggleFindingPlayers: () => toggleFindingPlayers({
			getServerLink: () => getSyncState().serverLink,
			getIsFindingPlayers: () => getSyncState().isFindingPlayers,
			setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
			setSearchId: (searchId) => setState({ searchId }),
			setShownTeamStatus: (shownTeamStatus) => setState({ shownTeamStatus }),
			setFindPlayersError: (findPlayersError) => setState({ findPlayersError }),
		}),
		findPlayersButtonText: state.isFindingPlayers
			? visibleTexts.findATeam.findingPlayersButton
			: visibleTexts.findATeam.findPlayersButton,
		// Find Players is greyed out, with this tooltip saying why, while the team cannot search
		...(() => {
			const filledRows = state.teamTableRows.filter((row) => !row.isLeftEmpty)
			const reservations = new Set(filledRows.flatMap((row) => (
				row.reservedFor ? [row.reservedFor] : []
			)))
			const findPlayersButtonDisabledTooltip = (() => {
				if (state.isFindingPlayers) return ''
				if (state.joinedBrowsedTeam) return visibleTexts.findATeam.cancelJoinFirstTooltip
				if (!reservations.has('me')) return visibleTexts.findATeam.meNotInTableTooltip
				if (reservations.size >= filledRows.length) {
					return visibleTexts.findATeam.noRowLeftToFindTooltip
				}
				if ([...reservations].some((reservedFor) => (
					reservedFor.startsWith('verifiedFriend:')
					&& !verifiedFriendUsernamesInTeam.some((username) => (
						reservedFor === `verifiedFriend:${username}`
					))
				))) {
					return visibleTexts.findATeam.verifiedFriendLeftTooltip
				}
				const myRow = filledRows.find((row) => row.reservedFor === 'me')
				if (myRow && (
					(myRow.toonPicture && state.missingToons.includes(myRow.toonPicture))
					|| [myRow.trinketAPicture, myRow.trinketBPicture]
						.some((picture) => picture && state.missingTrinkets.includes(picture))
					|| (myRow.isVerifiedPlayerRequired && myRow.badgeNames
						.filter((name) => !isBadgeProvenByLaterCheckedBadge({
							badgeName: name,
							checkedBadgeNames: myRow.badgeNames,
						}))
						.some((name) => state.robloxBadgeChecklist?.some((badge) => (
							badge.name === name && !badge.owned
						))))
				)) {
					return visibleTexts.findATeam.missingPictureInMyRowTooltip
				}
				return ''
			})()
			return {
				isFindPlayersButtonDisabled: Boolean(findPlayersButtonDisabledTooltip),
				findPlayersButtonDisabledTooltip,
			}
		})(),
		// The spinner stops once every row of the team is taken
		showFindingPlayersSpinner: isSearching
			&& shownTeamTableRows.some((row, index) => (
				!row.isLeftEmpty && !shownTeamStatus?.playersInRows[index]
			)),
		findPlayersError: state.findPlayersError,
		// Line below Find Players, visible while a search without a server link waits for players,
		// since a team is only complete once one of its searches has a server link
		findingWithoutServerLinkHint: visibleTexts.findATeam.findingWithoutServerLinkHint,
		findingWithoutServerLinkHintClass: isSearching && !hasJoinedATeam && !state.serverLink.trim()
			? ''
			: 'team-invisible',

		// Window on top of Find a Team that opens once players got together, with the server link
		// of the team, which its × and Esc close
		isTeamFoundWindowOpen: state.isTeamFoundWindowOpen,
		closeTeamFoundWindow: () => closeTeamFoundWindow({
			getIsInvitedFriend: () => Boolean(getSyncState().inviteFromLink),
			setIsTeamFoundWindowOpen: (isTeamFoundWindowOpen) => setState({ isTeamFoundWindowOpen }),
			setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
			setJoinedBrowsedTeam: (joinedBrowsedTeam) => setState({ joinedBrowsedTeam }),
			setShownTeamStatus: (shownTeamStatus) => setState({ shownTeamStatus }),
		}),
		// Text of the window, split around the host's username, which the view shows as a link to
		// the host's Roblox profile when the text names the host
		teamFoundText: (() => {
			const host = state.shownTeamStatus?.hostRobloxUsername ?? ''
			const hostProfileLink = `https://www.roblox.com/user.aspx?username=${encodeURIComponent(host)
			}`
			const textWithoutHost = (text: string) => ({
				beforeHost: text,
				host: '',
				hostProfileLink: '',
				afterHost: '',
			})
			if (state.shownTeamStatus?.hasJoinedATeam) {
				if (host) {
					return {
						beforeHost: visibleTexts.teamFound.hostIsBeforeHost,
						host: visibleTexts.playerNames.robloxUsername(host),
						hostProfileLink,
						afterHost: visibleTexts.teamFound.hostIsAfterHost,
					}
				}
				return textWithoutHost(isInvitedFriend
					? visibleTexts.teamFound.yourTeamJoinedATeam
					: visibleTexts.teamFound.youJoinedATeam)
			}
			if (!isInvitedFriend) return textWithoutHost(visibleTexts.teamFound.playersJoinedYourTeam)
			if (!host) return textWithoutHost(visibleTexts.teamFound.playersJoinedTheTeam)
			return {
				beforeHost: visibleTexts.teamFound.playersJoinedBeforeHost,
				host: visibleTexts.playerNames.robloxUsername(host),
				hostProfileLink,
				afterHost: visibleTexts.teamFound.playersJoinedAfterHost,
			}
		})(),
		// Tags below the text with the TEAM SETTINGS of the whole team, which hold the most specific
		// choice of every search in it
		teamFoundSettingsTags: state.shownTeamStatus
			? teamSettingsTagsOf({
				teamSettings: state.shownTeamStatus.teamSettings,
				isTeamComplete: true,
			})
			: [],
		// Rows of the read-only table of the whole team, one for each slot, with what the slot asks
		// for once the rows of every table in it count together, and the player in it. The user's
		// own row is light blue and reads "(You)". "(Leave Empty)" rows are left out.
		teamFoundRows: (state.shownTeamStatus?.slotRows ?? []).flatMap((row, index) => {
			if (row.isLeftEmpty) return []
			const isOwnRow = !isInvitedFriend && index === state.shownTeamStatus!.hostRowIndex
			return [{
				key: index,
				cardTitle: visibleTexts.teamTable.playerSlotCardTitle(index + 1),
				slotClass: isOwnRow ? 'team-found-own-slot' : '',
				pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
					.map((column) => ({
						key: column,
						cardBoxLabel: {
							toonPicture: visibleTexts.teamTable.toonColumn,
							trinketAPicture: visibleTexts.teamTable.trinketAColumn,
							trinketBPicture: visibleTexts.teamTable.trinketBColumn,
						}[column],
						anyText: row[column] ? '' : visibleTexts.teamTable.any,
						picture: row[column] ? {
							src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
							title: row[column].replace('.png', ''),
						} : null,
					})),
				// Badges only count on a "Verified only" row, as in Find a Team
				noBadgesText: row.badgeNames.length && row.isVerifiedPlayerRequired
					? ''
					: visibleTexts.teamTable.noneRequired,
				badgeNames: row.isVerifiedPlayerRequired
					? row.badgeNames.filter((name) => !isBadgeProvenByLaterCheckedBadge({
						badgeName: name,
						checkedBadgeNames: row.badgeNames,
					}))
					: [],
				noRolesText: row.roleNames.length ? '' : visibleTexts.teamTable.noneRequired,
				roleNames: row.roleNames,
				playerName: isOwnRow
					? visibleTexts.playerNames.you
					: visibleTexts.playerNames.inBrackets(
						playerNameOf(state.shownTeamStatus!.playersInRows[index] ?? null)
						|| visibleTexts.playerNames.freeSlot,
					),
			}]
		}),
		teamServerLink,


		// Browse Teams icon, third in the row at the top of the screen, and its window with the team
		// list and a modal for the selected team's details
		browseTeamsWindow: {
			isOpen: isBrowseTeamsWindowOpen,
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'Browse Teams',
			}),
			close: () => setState({
				openDesktopWindowName: null,
				openedBrowsedSearchIds: null,
			}),
		},

		// Toons and Trinkets side windows around Browse Teams, which grey out while a join runs.
		// The row of YOUR SLOT is browseTeamsTableRows above.
		browseTeamsSideWindowClass: state.joinedBrowsedTeam ? 'window team-locked' : 'window',

		// TEAM SETTINGS below YOUR SLOT, which pick the listed teams, and which a join locks
		browseTeamsSettings: teamSettingsGroupBoxOf({
			areDropdownsLocked: Boolean(state.joinedBrowsedTeam),
			chosenOptions: state.browseTeamsChosenSettings,
			chooseOption: ({
				setting,
				chosenOption,
			}) => setState({
				browseTeamsChosenSettings: {
					...getSyncState().browseTeamsChosenSettings,
					[setting]: chosenOption,
				},
			}),
			players: {
				chosenFromOption: state.browseTeamsChosenPlayersFromDropdownOption,
				chosenToOption: state.browseTeamsChosenPlayersToDropdownOption,
				chooseFromOption: (chosenOption) => setState({
					browseTeamsChosenPlayersFromDropdownOption: chosenOption,
				}),
				chooseToOption: (chosenOption) => setState({
					browseTeamsChosenPlayersToDropdownOption: chosenOption,
				}),
			},
		}),

		// List of team cards below TEAM SETTINGS, which scrolls, and loads 20 more cards whenever it
		// is scrolled to its end
		showBrowsedTeamCards: true,
		browseTeamsListText: (() => {
			if (!state.browsedTeams) return visibleTexts.browseTeams.lookingForTeams
			if (!state.browsedTeams.length) return visibleTexts.browseTeams.noTeamsMatch
			return visibleTexts.browseTeams.listIntro
		})(),
		// Card with a row of the team's toons, where a toon that the team leaves open is a grey
		// "(Any)", and a row of tags below it for the TEAM SETTINGS that are not Any
		browsedTeamCards: (state.browsedTeams ?? []).map((browsedTeam) => ({
			key: browsedTeam.hostTeamId,
			toons: browsedTeam.teamTableRows.flatMap((row, index) => (row.isLeftEmpty ? [] : [{
				key: index,
				anyText: row.toonPicture ? '' : visibleTexts.teamTable.any,
				src: row.toonPicture ? `/pixelated/toons/${row.toonPicture}` : '',
				title: row.toonPicture.replace('.png', ''),
			}])),
			// A "Joined" tag comes first on the card of the team that the user joined
			tags: [
				...browsedTeam.searchIds.some((searchId) => (
					state.joinedBrowsedTeam?.searchIds.includes(searchId)
				))
					? [{
						text: visibleTexts.browseTeams.joinedTag,
						tooltip: '',
					}]
					: [],
				...teamSettingsTagsOf({
					teamSettings: browsedTeam,
					isTeamComplete: false,
				}),
			],
			open: () => setState({
				openedBrowsedSearchIds: browsedTeam.searchIds,
				browseTeamsError: '',
			}),
		})),
		scrollBrowseTeamsList: (isNearListEnd: boolean) => scrollBrowseTeamsList({
			getHasMoreBrowsedTeams: () => getSyncState().hasMoreBrowsedTeams,
			getListedTeamCount: () => getSyncState().browsedTeams?.length ?? 0,
			getBrowsedTeamCount: () => getSyncState().browsedTeamCount,
			setBrowsedTeamCount: (browsedTeamCount) => setState({ browsedTeamCount }),
			isNearListEnd,
		}),
		// Grey line at the end of the list while more teams fit than it shows
		browseTeamsMoreText: state.hasMoreBrowsedTeams ? visibleTexts.browseTeams.loadingMoreTeams : '',
		// Modal with the selected team's details and Join action
		...(() => {
			const openedBrowsedTeam = state.browsedTeams?.find((browsedTeam) => (
				browsedTeam.searchIds.some((searchId) => state.openedBrowsedSearchIds?.includes(searchId))
			))
			// Row of the opened team that the user's running join takes, or -1. Until the server tells
			// the row, it is the row whose Join button the user clicked.
			const joinedRowIndex = (() => {
				const isOpenedBrowsedTeamJoined = openedBrowsedTeam?.searchIds.some((searchId) => (
					state.joinedBrowsedTeam?.searchIds.includes(searchId)
				))
				if (!openedBrowsedTeam || !state.joinedBrowsedTeam || !isOpenedBrowsedTeamJoined) return -1
				return openedBrowsedTeam.joinedRowIndex === -1
					? state.joinedBrowsedTeam.rowIndex
					: openedBrowsedTeam.joinedRowIndex
			})()
			// Tooltip of a greyed-out Join button of a free slot
			const joinButtonBlockedTooltip = (() => {
				if (state.isFindingPlayers) return visibleTexts.teamDetails.cancelFindPlayersFirstTooltip
				if (isInvitedFriend) return visibleTexts.teamDetails.inInvitingTeamTooltip
				return ''
			})()
			return {
				showOpenedBrowsedTeam: Boolean(state.openedBrowsedSearchIds),
				// Closing Team Details also ends the join of one of its slots, unless its team was found,
				// whose join ends when "Team found!" closes
				closeOpenedBrowsedTeam: () => setState({
					openedBrowsedSearchIds: null,
					...getSyncState().shownTeamStatus?.teamServerLink ? {} : { joinedBrowsedTeam: null },
				}),
				// Line above the table with the host's name and the TEAM SETTINGS, or why the team
				// is gone
				openedBrowsedTeamHostText: openedBrowsedTeam
					? openedBrowsedTeam.hostRobloxUsername
						? visibleTexts.teamDetails.hostsTeam(openedBrowsedTeam.hostRobloxUsername)
						: visibleTexts.teamDetails.unverifiedHostsTeam
					: '',
				// A found team leaves the list too, and then Team Details closes behind "Team found!"
				openedBrowsedTeamMissingText: openedBrowsedTeam || state.shownTeamStatus?.teamServerLink
					? ''
					: visibleTexts.teamDetails.teamGone,
				// Tags below the host's name with the TEAM SETTINGS of the whole team
				openedBrowsedTeamSettingsTags: openedBrowsedTeam
					? teamSettingsTagsOf({
						teamSettings: openedBrowsedTeam,
						isTeamComplete: false,
					})
					: [],
				// "Looking for players..." above the table while the user's join waits for the other slots
				showLookingForPlayersText: joinedRowIndex !== -1 && !state.shownTeamStatus?.teamServerLink,
				// Rows of the read-only table, with the Toon, Trinket A, Trinket B, Badges, Role and
				// Player columns. "(Leave Empty)" rows are left out.
				openedBrowsedTeamRows: (openedBrowsedTeam?.teamTableRows ?? []).flatMap((row, index) => (
					row.isLeftEmpty ? [] : [{
						key: index,
						cardTitle: visibleTexts.teamTable.playerSlotCardTitle(index + 1),
						pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
							.map((column) => ({
								key: column,
								cardBoxLabel: {
									toonPicture: visibleTexts.teamTable.toonColumn,
									trinketAPicture: visibleTexts.teamTable.trinketAColumn,
									trinketBPicture: visibleTexts.teamTable.trinketBColumn,
								}[column],
								anyText: row[column] ? '' : visibleTexts.teamTable.any,
								picture: row[column] ? {
									src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${
										row[column]
									}`,
									title: row[column].replace('.png', ''),
								} : null,
							})),
						noBadgesText: row.badgeNames.length && row.isVerifiedPlayerRequired
							? ''
							: visibleTexts.teamTable.noneRequired,
						// Badges only count on a "Verified only" row, as in Find a Team
						badgeNames: row.isVerifiedPlayerRequired
							? row.badgeNames.filter((name) => !isBadgeProvenByLaterCheckedBadge({
								badgeName: name,
								checkedBadgeNames: row.badgeNames,
							}))
							: [],
						noRolesText: row.roleNames.length ? '' : visibleTexts.teamTable.noneRequired,
						roleNames: row.roleNames,
						// The slot that the user joined has a light blue background and a bold player
						// name, and the other names are grey
						slotClass: index === joinedRowIndex ? 'browse-joined-slot' : '',
						playerNameClass: index === joinedRowIndex
							? 'browse-joined-slot-text'
							: 'team-placeholder',
						playerName: (() => {
							if (index === joinedRowIndex) return visibleTexts.teamDetails.joinedThisSlot
							return openedBrowsedTeam!.playersInRows[index]
								? visibleTexts.teamDetails.slotFilled
								: visibleTexts.teamDetails.requirementsIncompatible
						})(),
						// Join button in the Player cell of a free slot that the user fits, which is
						// greyed out with a tooltip while the user cannot join. The other rows, and the
						// slot that the user joined, show playerName instead.
						joinButton: index !== joinedRowIndex
							&& openedBrowsedTeam!.joinableRowIndexes.includes(index)
							? {
								text: visibleTexts.teamDetails.joinButton,
								tooltip: joinButtonBlockedTooltip,
								isDisabled: Boolean(joinButtonBlockedTooltip),
								join: () => joinBrowsedTeamSlot({
									setJoinedBrowsedTeam: (joinedBrowsedTeam) => setState({ joinedBrowsedTeam }),
									setBrowseTeamsError: (browseTeamsError) => setState({ browseTeamsError }),
									browsedTeam: openedBrowsedTeam!,
									rowIndex: index,
									browseTeamsSlot: getSyncState().browseTeamsTableRows[0],
									browseTeamSettings: {
										dandyRun: getSyncState().browseTeamsChosenSettings.dandyRun,
										earlyDyle: getSyncState().browseTeamsChosenSettings.earlyDyle,
										region: getSyncState().browseTeamsChosenSettings.region,
										floorGoal: `${getSyncState().browseTeamsChosenSettings.floorGoalFrom} to ${
											getSyncState().browseTeamsChosenSettings.floorGoalTo
										}`,
									},
								}),
							}
							: null,
					}]
				)),
				// Red line below the table when the server ended the join
				browseTeamsError: state.browseTeamsError,
			}
		})(),


		// Upvote Players icon, fourth in the row at the top of the screen, and its window, which
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
					setLastFoundTeamError: (lastFoundTeamError) => setState({ lastFoundTeamError }),
				})
			},
			close: () => setState({ openDesktopWindowName: null }),
		},
		// Line at the top of Upvote Players
		upvotePlayersIntroText: (() => {
			if (!isRobloxVerified) return visibleTexts.upvotePlayers.verifyToUpvote
			if (state.lastFoundTeamError) return state.lastFoundTeamError
			if (!state.isLastFoundTeamLoaded) return visibleTexts.upvotePlayers.loadingLastTeam
			if (!state.lastFoundTeam) return visibleTexts.upvotePlayers.noTeamYet
			return visibleTexts.upvotePlayers.lastTeamIntro
		})(),
		showLastFoundTeam: isRobloxVerified && Boolean(state.lastFoundTeam),
		// TEAM SETTINGS and server link of the last found team, below the line at the top
		lastFoundTeamSettingsTags: state.lastFoundTeam
			? teamSettingsTagsOf({
				teamSettings: state.lastFoundTeam,
				isTeamComplete: true,
			})
			: [],
		lastFoundTeamServerLink: state.lastFoundTeam?.serverLink ?? '',
		// Rows of the read-only table, with the same columns as Find a Team once verified and an
		// Upvote column at the end. "(Leave Empty)" rows are left out.
		lastFoundTeamRows: (state.lastFoundTeam?.teamTableRows ?? []).flatMap((row, index) => (
			row.isLeftEmpty ? [] : [{
				row,
				index,
			}]
		)).map(({
			row, index,
		}) => ({
			key: index,
			// Title above the row's card on a narrow screen
			cardTitle: visibleTexts.teamTable.playerSlotCardTitle(index + 1),
			pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
				.map((column) => ({
					key: column,
					cardBoxLabel: {
						toonPicture: visibleTexts.teamTable.toonColumn,
						trinketAPicture: visibleTexts.teamTable.trinketAColumn,
						trinketBPicture: visibleTexts.teamTable.trinketBColumn,
					}[column],
					anyText: row[column] ? '' : visibleTexts.teamTable.any,
					picture: row[column] ? {
						src: `/pixelated/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
						title: row[column].replace('.png', ''),
					} : null,
				})),
			noBadgesText: row.badgeNames.length ? '' : visibleTexts.teamTable.noneRequired,
			// A badge that a checked later badge of its category proves is left out, as in Find a Team
			badgeNames: row.badgeNames.filter((name) => !isBadgeProvenByLaterCheckedBadge({
				badgeName: name,
				checkedBadgeNames: row.badgeNames,
			})),
			noRolesText: row.roleNames.length ? '' : visibleTexts.teamTable.noneRequired,
			// Solar Support only counts for Bobette, as in Find a Team
			roleNames: row.roleNames.filter((role) => (
				role !== 'Solar Support' || row.toonPicture === 'bobette.png'
			)),
			playerName: visibleTexts.playerNames.inBrackets(
				playerNameOf(state.lastFoundTeam!.playersInRows[index] ?? null)
				|| visibleTexts.playerNames.nobody,
			),
			// Grey text in the Upvote cell that says why the row's player cannot be upvoted, which
			// is empty for a row that nobody took and for a player who can be upvoted
			cannotUpvoteText: (() => {
				const playerInRow = state.lastFoundTeam!.playersInRows[index]
				if (!playerInRow) return ''
				if (!('robloxUsername' in playerInRow) || !playerInRow.robloxUsername) {
					return visibleTexts.upvotePlayers.cannotUpvoteUnverified
				}
				if (playerInRow.robloxUsername === state.verifiedRobloxAccount?.username) {
					return visibleTexts.upvotePlayers.cannotUpvoteYourself
				}
				const player = state.lastFoundTeam!.verifiedPlayers.find((verifiedPlayer) => (
					verifiedPlayer.robloxUsername === playerInRow.robloxUsername
				))
				if (player?.inviteLinkSide === 'friend whom the user invited') {
					return visibleTexts.upvotePlayers.cannotUpvoteInvitedFriends
				}
				if (player?.inviteLinkSide === 'friend who invited the user') {
					return visibleTexts.upvotePlayers.cannotUpvoteInvitingFriend
				}
				return ''
			})(),
			// Upvote button of the row's player, for every other verified player except the friend
			// who invited the user and a friend whom the user invited
			upvoteButton: (() => {
				const playerInRow = state.lastFoundTeam!.playersInRows[index]
				const player = state.lastFoundTeam!.verifiedPlayers.find((verifiedPlayer) => (
					playerInRow
					&& 'robloxUsername' in playerInRow
					&& verifiedPlayer.robloxUsername === playerInRow.robloxUsername
				))
				if (!player || !player.canBeUpvoted) return null
				return {
					text: player.isUpvoted
						? visibleTexts.upvotePlayers.upvotedButton
						: visibleTexts.upvotePlayers.upvoteButton,
					upvotedPictureSrc: player.isUpvoted ? '/upvoted.webp' : null,
					title: player.isUpvoted ? visibleTexts.upvotePlayers.upvotedButtonTooltip : '',
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
				}
			})(),
		})),


		// This is a fan project icon, fifth in the row at the top of the screen, and its window
		fanProjectWindow: {
			isOpen: state.openDesktopWindowName === 'This is a fan project',
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'This is a fan project',
			}),
			close: () => setState({ openDesktopWindowName: null }),
		},


		// Contact/Report icon, sixth in the row at the top of the screen, and its window with a topic
		// dropdown, a message box and a Send button
		contactReportWindow: {
			isOpen: state.openDesktopWindowName === 'Contact/Report',
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'Contact/Report',
			}),
			close: () => setState({ openDesktopWindowName: null }),
		},
		reportTopicDropdownOptions: [
			visibleTexts.contactReport.bugInTheWebsiteTopic,
			visibleTexts.contactReport.bugInTheGameTopic,
			visibleTexts.contactReport.playerTopic,
			visibleTexts.contactReport.otherTopic,
		],
		chosenReportTopicDropdownOption: state.chosenReportTopicDropdownOption,
		chooseReportTopicDropdownOption: (chosenOption: string) => setState({
			chosenReportTopicDropdownOption: chosenOption,
			reportStatusText: '',
		}),
		// Red line below the dropdown that sends game bugs and players to the official Discord server
		reportOnDiscordLine: isReportTopicForDiscord
			? {
				beforeLink: visibleTexts.contactReport.discordLineBeforeLink(
					state.chosenReportTopicDropdownOption,
				),
				linkText: visibleTexts.contactReport.discordLink,
				link: 'https://discord.com/invite/dandysworld',
				afterLink: visibleTexts.contactReport.discordLineAfterLink,
			}
			: null,
		reportMessage: state.reportMessage,
		isReportMessageBoxDisabled: isReportTopicForDiscord,
		typeReportMessage: (reportMessage: string) => setState({ reportMessage }),
		isSendReportButtonDisabled: isReportTopicForDiscord
			|| !state.reportMessage.trim()
			|| state.reportStatusText === visibleTexts.contactReport.sending,
		sendReport: () => sendReport({
			topic: getSyncState().chosenReportTopicDropdownOption,
			message: getSyncState().reportMessage,
			setReportMessage: (reportMessage) => setState({ reportMessage }),
			setReportStatusText: (reportStatusText) => setState({ reportStatusText }),
		}),
		reportStatusText: state.reportStatusText,


		// Options icon, seventh in the row at the top of the screen, and its window
		optionsWindow: {
			isOpen: state.openDesktopWindowName === 'Options',
			openFromIcon: () => openWindowFromIcon({
				getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
				setOpenDesktopWindowName: (openDesktopWindowName) => setState({ openDesktopWindowName }),
				closeFindATeamWindow,
				desktopWindowName: 'Options',
			}),
			close: () => setState({ openDesktopWindowName: null }),
		},
		// "Dark mode" checkbox at the top of Options, which swaps the wallpaper and the window colors
		isDarkModeCheckboxChecked: state.isDarkModeCheckboxChecked,
		toggleDarkModeCheckbox: (isChecked: boolean) => toggleOptionsCheckbox({
			localStorageKey: 'darkMode',
			setIsChecked: (isDarkModeCheckboxChecked) => setState({ isDarkModeCheckboxChecked }),
			isChecked,
		}),
		// Checkboxes of the "WHEN A TEAM IS FOUND" group box below it, each with a grey or red line
		// below it when it needs one
		teamFoundOptionsCheckboxes: [
			{
				label: visibleTexts.options.bellSoundCheckbox,
				hint: '',
				isError: false,
				isDisabled: false,
				isChecked: state.isDingSoundCheckboxChecked,
				toggle: (isChecked: boolean) => toggleOptionsCheckbox({
					localStorageKey: 'dingSound',
					setIsChecked: (isDingSoundCheckboxChecked) => setState({ isDingSoundCheckboxChecked }),
					isChecked,
				}),
			},
			// iPhones only offer notifications to a site that was added to the Home Screen
			...(() => {
				const canShowNotifications = 'Notification' in window && 'serviceWorker' in navigator
				return [{
					label: visibleTexts.options.notificationCheckbox,
					hint: (() => {
						if (!canShowNotifications) return visibleTexts.options.notificationsUnsupported
						if (state.isNotificationPermissionPending) {
							return visibleTexts.options.notificationPermissionPending
						}
						return state.notificationCheckboxError || visibleTexts.options.notificationHint
					})(),
					isError: Boolean(state.notificationCheckboxError),
					isDisabled: !canShowNotifications,
					isChecked: state.isNotificationCheckboxChecked,
					toggle: (isChecked: boolean) => toggleNotificationCheckbox({
						setIsChecked: (isNotificationCheckboxChecked) => setState({
							isNotificationCheckboxChecked,
						}),
						setNotificationCheckboxError: (notificationCheckboxError) => setState({
							notificationCheckboxError,
						}),
						setIsNotificationPermissionPending: (isNotificationPermissionPending) => setState({
							isNotificationPermissionPending,
						}),
						isChecked,
					}),
				}]
			})(),
			{
				label: visibleTexts.options.joinAutomaticallyCheckbox,
				hint: visibleTexts.options.joinAutomaticallyHint,
				isError: false,
				isDisabled: false,
				isChecked: state.isJoinAutomaticallyCheckboxChecked,
				toggle: (isChecked: boolean) => toggleOptionsCheckbox({
					localStorageKey: 'joinAutomatically',
					setIsChecked: (isJoinAutomaticallyCheckboxChecked) => setState({
						isJoinAutomaticallyCheckboxChecked,
					}),
					isChecked,
				}),
			},
		],


		// Reports icon, eighth in the row at the top of the screen, which only @akotheakotheako sees,
		// and its window, which loads every report whenever it opens
		showReportsIcon: state.verifiedRobloxAccount?.id === reportsReaderRobloxUserId,
		reportsWindow: {
			isOpen: state.openDesktopWindowName === 'Reports',
			openFromIcon: () => {
				openWindowFromIcon({
					getOpenDesktopWindowName: () => getSyncState().openDesktopWindowName,
					setOpenDesktopWindowName: (openDesktopWindowName) => setState({
						openDesktopWindowName,
					}),
					closeFindATeamWindow,
					desktopWindowName: 'Reports',
				})
				loadReports({
					setReports: (reports) => setState({ reports }),
					setReportsError: (reportsError) => setState({ reportsError }),
				})
			},
			close: () => setState({ openDesktopWindowName: null }),
		},
		// Line at the top of the Reports window
		reportsIntroText: (() => {
			if (state.reportsError) return state.reportsError
			if (!state.reports) return visibleTexts.reports.loading
			if (!state.reports.length) return visibleTexts.reports.noReports
			return visibleTexts.reports.reportCount(state.reports.length)
		})(),
		reportCards: (state.reports ?? []).map((report) => ({
			key: report.id,
			titleText: visibleTexts.reports.reportTitle({
				topic: report.topic,
				sentAt: new Date(report.sentAt).toLocaleString(),
				sender: report.robloxUsername
					? visibleTexts.playerNames.robloxUsername(report.robloxUsername)
					: visibleTexts.reports.unverifiedSender,
			}),
			message: report.message,
		})),


		// Two counters at the bottom middle of the screen
		onlineCounterText: visibleTexts.counters.online(state.onThisPageCount),
		findingPlayersCounterText: visibleTexts.counters.lookingForATeam(state.findingPlayersCount),
	}
}
