import type { CheckInAnswer, TeamTableRow } from '../../shared/teamTypes.ts'
import type { JoinedBrowsedTeam } from './useLogic.ts'

export function checkInWithServer({
	pageId,
	inviteCode,
	getTeamTableRows,
	getRemovedVerifiedFriendUsernames,
	getMissingPictures,
	getIsInviteLinkCopied,
	getTeamSettings,
	getServerLink,
	getIsFindingPlayers,
	getSearchId,
	getInviteFromLink,
	getShownTeamStatus,
	getJoinedBrowsedTeam,
	getBrowseTeamsFilter,
	setOnThisPageCount,
	setFindingPlayersCount,
	setInvitingTeam,
	setShownTeamStatus,
	setIsFindingPlayers,
	setInviteFromLink,
	setFindPlayersError,
	setIsVerificationNeededToJoin,
	setBrowsedTeams,
	setHasMoreBrowsedTeams,
	setJoinedBrowsedTeam,
	setBrowseTeamsError,
}: {
	pageId: string
	inviteCode: string
	getTeamTableRows: () => TeamTableRow[]
	getRemovedVerifiedFriendUsernames: () => string[]
	getMissingPictures: () => {
		missingToons: string[]
		missingTrinkets: string[]
	}
	getIsInviteLinkCopied: () => boolean
	getTeamSettings: () => {
		dandyRun: string
		earlyDyle: string
		region: string
		floorGoal: string
	}
	getServerLink: () => string
	getIsFindingPlayers: () => boolean
	getSearchId: () => string
	getInviteFromLink: () => { inviteCode: string } | null
	getShownTeamStatus: () => CheckInAnswer['shownTeamStatus']
	getJoinedBrowsedTeam: () => JoinedBrowsedTeam | null
	// null while Browse Teams is closed
	getBrowseTeamsFilter: () => {
		toonPicture: string
		trinketAPicture: string
		trinketBPicture: string
		roleNames: string[]
		missingToons: string[]
		missingTrinkets: string[]
		dandyRun: string
		earlyDyle: string
		region: string
		floorGoal: string
		browsedTeamCount: number
	} | null
	setOnThisPageCount: (onThisPageCount: number) => void
	setFindingPlayersCount: (findingPlayersCount: number) => void
	setInvitingTeam: (invitingTeam: CheckInAnswer['invitingTeam']) => void
	setShownTeamStatus: (shownTeamStatus: CheckInAnswer['shownTeamStatus']) => void
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setInviteFromLink: (inviteFromLink: null) => void
	setFindPlayersError: (findPlayersError: string) => void
	setIsVerificationNeededToJoin: (isVerificationNeededToJoin: boolean) => void
	setBrowsedTeams: (browsedTeams: CheckInAnswer['browsedTeams']) => void
	setHasMoreBrowsedTeams: (hasMoreBrowsedTeams: boolean) => void
	setJoinedBrowsedTeam: (joinedBrowsedTeam: null) => void
	setBrowseTeamsError: (browseTeamsError: string) => void
}) {
	// The ids survive reloads, so a reloaded tab keeps its team and its friend's invite link
	sessionStorage.setItem('pageId', pageId)
	sessionStorage.setItem('inviteCode', inviteCode)
	// Answers that arrive after the check-ins restarted would show an outdated team
	let isStopped = false
	let timeout: ReturnType<typeof setTimeout> | undefined
	let lastOnThisPageCount = 0
	const checkIn = async () => {
		const invite = getInviteFromLink()
		const teamTableRows = getTeamTableRows()
		const isFindingPlayers = getIsFindingPlayers()
		const joinedBrowsedTeam = getJoinedBrowsedTeam()
		const browse = getBrowseTeamsFilter()
		// The server keeps the team while it searches, or once friends may open its invite link. A
		// join in Browse Teams searches with its own one-slot table instead of the Find a Team one.
		const team = (() => {
			if (invite) return null
			if (joinedBrowsedTeam) {
				return {
					teamTableRows: joinedBrowsedTeam.teamTableRows,
					removedRobloxUsernames: [],
					...getMissingPictures(),
					inviteCode,
					serverLink: '',
					dandyRun: joinedBrowsedTeam.dandyRun,
					earlyDyle: joinedBrowsedTeam.earlyDyle,
					region: joinedBrowsedTeam.region,
					floorGoal: joinedBrowsedTeam.floorGoal,
					isFindingPlayers: true,
					searchId: joinedBrowsedTeam.searchId,
					chosenHostTeamId: joinedBrowsedTeam.hostTeamId,
				}
			}
			return isFindingPlayers || getIsInviteLinkCopied() ? {
				// Solar Support is crossed out on every row whose toon is not Bobette
				teamTableRows: teamTableRows.map((row) => ({
					...row,
					roleNames: row.roleNames.filter((role) => (
						role !== 'Solar Support' || row.toonPicture === 'bobette.png'
					)),
				})),
				removedRobloxUsernames: getRemovedVerifiedFriendUsernames(),
				// The "(Any)" cells of the user's own rows can only become a picture that they own
				...getMissingPictures(),
				inviteCode,
				serverLink: getServerLink(),
				...getTeamSettings(),
				isFindingPlayers,
				searchId: getSearchId(),
			} : null
		})()
		const answer = await fetch('/api/check-in', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId,
				team,
				invite,
				browse,
			}),
		})
			.then((res) => res.ok ? res.json() as Promise<CheckInAnswer> : null)
			// A failed check-in is retried on the next one
			.catch(() => null)
		if (isStopped) return
		if (answer) {
			lastOnThisPageCount = answer.onThisPageCount
			setOnThisPageCount(answer.onThisPageCount)
			setFindingPlayersCount(answer.findingPlayersCount)
			// The status of a found team stays until its "Team found!" window closes, even when the
			// team falls apart, such as when the host closes their page
			if (!getShownTeamStatus()?.teamServerLink) {
				setInvitingTeam(answer.invitingTeam)
				setShownTeamStatus(answer.shownTeamStatus)
			}
			setIsVerificationNeededToJoin(answer.isVerificationNeededToJoin)
			setBrowsedTeams(answer.browsedTeams)
			setHasMoreBrowsedTeams(answer.hasMoreBrowsedTeams)
			if (answer.error) {
				if (invite) {
					setFindPlayersError(answer.error)
					history.replaceState(null, '', location.pathname)
					setInviteFromLink(null)
				} else if (joinedBrowsedTeam) {
					setBrowseTeamsError(answer.error)
					setJoinedBrowsedTeam(null)
				} else {
					setFindPlayersError(answer.error)
					setIsFindingPlayers(false)
				}
			}
		}
		// Pages that take part in a team or keep Browse Teams open check in often, and the others
		// only keep the counters fresh.
		// Every check-in waits for a lock that all of them share, so the other pages wait longer the
		// more pages are open, from 15 seconds up to 45 at 450 pages. The server counts a page as gone
		// after 90 silent seconds, and hidden tabs fire their timers only once a minute, so the wait
		// stays well under 60 seconds.
		timeout = setTimeout(
			checkIn,
			team || invite || browse ? 5_000 : Math.min(45_000, Math.max(15_000, lastOnThisPageCount * 100)),
		)
	}
	checkIn()
	// Closing or reloading the tab ends its search, its team and its invite right away, instead of
	// after 90 seconds
	const leave = () => fetch('/api/check-in/leave', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ pageId }),
		keepalive: true,
	})
	addEventListener('pagehide', leave)
	return () => {
		isStopped = true
		clearTimeout(timeout)
		removeEventListener('pagehide', leave)
	}
}
