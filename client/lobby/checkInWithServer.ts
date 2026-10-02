import type { CheckInAnswer, TeamTableRow } from '../../shared/teamTypes.ts'

export function checkInWithServer({
	pageId,
	inviteCode,
	getTeamTableRows,
	getTeamSettings,
	getServerLink,
	getIsFindingPlayers,
	getInviteFromLink,
	getShownTeamStatus,
	setOnThisPageCount,
	setFindingPlayersCount,
	setInvitingTeam,
	setShownTeamStatus,
	setIsFindingPlayers,
	setInviteFromLink,
	setFindPlayersError,
}: {
	pageId: string
	inviteCode: string
	getTeamTableRows: () => TeamTableRow[]
	getTeamSettings: () => {
		isDandyRun: boolean
		isEarlyDyle: boolean
		region: string
		floorGoal: string
	}
	getServerLink: () => string
	getIsFindingPlayers: () => boolean
	getInviteFromLink: () => {
		inviteCode: string
		rowIndex: number
	} | null
	getShownTeamStatus: () => CheckInAnswer['shownTeamStatus']
	setOnThisPageCount: (onThisPageCount: number) => void
	setFindingPlayersCount: (findingPlayersCount: number) => void
	setInvitingTeam: (invitingTeam: CheckInAnswer['invitingTeam']) => void
	setShownTeamStatus: (shownTeamStatus: CheckInAnswer['shownTeamStatus']) => void
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setInviteFromLink: (inviteFromLink: null) => void
	setFindPlayersError: (findPlayersError: string) => void
}) {
	// The ids survive reloads, so a reloaded tab keeps its team and its friend's invite link
	sessionStorage.setItem('pageId', pageId)
	sessionStorage.setItem('inviteCode', inviteCode)
	// Answers that arrive after the check-ins restarted would show an outdated team
	let isStopped = false
	let timeout: ReturnType<typeof setTimeout> | undefined
	const checkIn = async () => {
		const invite = getInviteFromLink()
		const teamTableRows = getTeamTableRows()
		const isFindingPlayers = getIsFindingPlayers()
		// The server keeps the team while it searches, or while a friend may open its invite link
		const team = !invite && (isFindingPlayers || teamTableRows.some((row) => (
			!row.isLeftEmpty && row.playerChoice === 'invitedFriend'
		)))
			? {
				// Solar Support is crossed out on every row whose toon is not Bobette
				teamTableRows: teamTableRows.map((row) => ({
					...row,
					roleNames: row.roleNames.filter((role) => (
						role !== 'Solar Support' || row.toonPicture === 'bobette.png'
					)),
				})),
				inviteCode,
				serverLink: getServerLink(),
				...getTeamSettings(),
				isFindingPlayers,
			}
			: null
		const answer = await fetch('/api/check-in', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pageId,
				team,
				invite,
			}),
		})
			.then((res) => res.ok ? res.json() as Promise<CheckInAnswer> : null)
			// A failed check-in is retried on the next one
			.catch(() => null)
		if (isStopped) return
		if (answer) {
			setOnThisPageCount(answer.onThisPageCount)
			setFindingPlayersCount(answer.findingPlayersCount)
			// Once the team got together, its status stays as it was until Find a Team is closed
			if (!getShownTeamStatus()?.teamServerLink) {
				setInvitingTeam(answer.invitingTeam)
				setShownTeamStatus(answer.shownTeamStatus)
			}
			if (answer.error) {
				setFindPlayersError(answer.error)
				if (invite) {
					history.replaceState(null, '', location.pathname)
					setInviteFromLink(null)
				} else {
					setIsFindingPlayers(false)
				}
			}
		}
		// Pages that take part in a team check in often, and the others only keep the counters fresh
		timeout = setTimeout(checkIn, team || invite ? 5_000 : 15_000)
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
