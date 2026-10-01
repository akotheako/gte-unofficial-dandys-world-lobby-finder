import type { FormEvent } from 'react'
import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'
import type { TeamTableRow } from '../../shared/teamTypes.ts'

// The check-ins restart whenever this changes, and they carry the search to the server
export function toggleFindingPlayers({
	getTeamTableRows,
	getServerLink,
	getIsFindingPlayers,
	setIsFindingPlayers,
	setFindPlayersError,
	event,
}: {
	getTeamTableRows: () => TeamTableRow[]
	getServerLink: () => string
	getIsFindingPlayers: () => boolean
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setFindPlayersError: (findPlayersError: string) => void
	event: FormEvent<HTMLFormElement>
}) {
	event.preventDefault()
	if (getIsFindingPlayers()) {
		setIsFindingPlayers(false)
		return
	}
	const filledRows = getTeamTableRows().filter((row) => !row.isLeftEmpty)
	const serverLink = getServerLink().trim()
	if (!filledRows.some((row) => row.playerChoice === 'findPlayer')) {
		setFindPlayersError('At least 1 "Find player" row is needed to start finding players!')
	} else if (filledRows.filter((row) => row.playerChoice === 'me').length !== 1) {
		setFindPlayersError('Exactly 1 row has to be "Me" to start finding players!')
	} else if (serverLink && !robloxServerLinkPattern.test(serverLink)) {
		setFindPlayersError('The server link is invalid!')
	} else {
		setFindPlayersError('')
		setIsFindingPlayers(true)
	}
}
