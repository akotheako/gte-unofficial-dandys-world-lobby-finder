import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'
import { visibleTexts } from '../../shared/visibleTexts.ts'

// The check-ins restart whenever this changes, and they carry the search to the server
export function toggleFindingPlayers({
	getServerLink,
	getIsFindingPlayers,
	setIsFindingPlayers,
	setSearchId,
	setShownTeamStatus,
	setFindPlayersError,
}: {
	getServerLink: () => string
	getIsFindingPlayers: () => boolean
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setSearchId: (searchId: string) => void
	setShownTeamStatus: (shownTeamStatus: null) => void
	setFindPlayersError: (findPlayersError: string) => void
}) {
	if (getIsFindingPlayers()) {
		setIsFindingPlayers(false)
		setShownTeamStatus(null)
		return
	}
	const serverLink = getServerLink().trim()
	if (serverLink && !robloxServerLinkPattern.test(serverLink)) {
		setFindPlayersError(visibleTexts.findATeam.invalidServerLinkError)
	} else {
		setFindPlayersError('')
		// The server tells a new search apart from the search that the team was found with
		setSearchId(crypto.randomUUID())
		setIsFindingPlayers(true)
	}
}
