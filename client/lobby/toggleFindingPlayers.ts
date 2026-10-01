import type { FormEvent } from 'react'
import type { TeamTableRow } from './useLogic.ts'

export function toggleFindingPlayers({
	getTeamTableRows,
	getIsFindingPlayers,
	setIsFindingPlayers,
	setFindPlayersError,
	event,
}: {
	getTeamTableRows: () => TeamTableRow[]
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
	const teamTableRows = getTeamTableRows()
	const serverLink = new FormData(event.currentTarget).get('serverLink') as string
	if (!teamTableRows.some((row) => !row.isLeftEmpty && !row.isReserved)) {
		setFindPlayersError(
			'At least 1 non-empty & non-reserved row is needed to start finding players!',
		)
	} else if (!teamTableRows.some((row) => !row.isLeftEmpty && row.isReserved)) {
		setFindPlayersError(
			'At least 1 non-empty reserved row (You!) is needed to start finding players!',
		)
	} else if (!serverLink.trim()) {
		setFindPlayersError('A server link is needed!')
	} else if (!/^https:\/\/www\.roblox\.com\/share\?code=[0-9a-f]{32}&type=Server$/i
		.test(serverLink.trim())) {
		setFindPlayersError('The server link is invalid!')
	} else {
		setFindPlayersError('')
		setIsFindingPlayers(true)
	}
}
