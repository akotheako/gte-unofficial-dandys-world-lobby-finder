import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'

// The check-ins restart whenever this changes, and they carry the search to the server
export function toggleFindingPlayers({
	getServerLink,
	getIsFindingPlayers,
	setIsFindingPlayers,
	setShownTeamStatus,
	setFindPlayersError,
}: {
	getServerLink: () => string
	getIsFindingPlayers: () => boolean
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setShownTeamStatus: (shownTeamStatus: null) => void
	setFindPlayersError: (findPlayersError: string) => void
}) {
	if (getIsFindingPlayers()) {
		setIsFindingPlayers(false)
		// The status of a team that got together stays until it is cleared, so the next search
		// would show the old team
		setShownTeamStatus(null)
		return
	}
	const serverLink = getServerLink().trim()
	if (serverLink && !robloxServerLinkPattern.test(serverLink)) {
		setFindPlayersError('The server link is invalid!')
	} else {
		setFindPlayersError('')
		setIsFindingPlayers(true)
	}
}
