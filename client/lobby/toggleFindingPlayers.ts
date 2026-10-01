import type { FormEvent } from 'react'
import { robloxServerLinkPattern } from '../../shared/robloxServerLinkPattern.ts'
import type { FoundTeam, TeamTableRow } from './useLogic.ts'

export async function toggleFindingPlayers({
	getSearcherId,
	getTeamTableRows,
	getTeamSettings,
	getIsFindingPlayers,
	setIsFindingPlayers,
	setFindPlayersError,
	setFoundTeam,
	event,
}: {
	getSearcherId: () => string
	getTeamTableRows: () => TeamTableRow[]
	getTeamSettings: () => {
		isDandyRun: boolean
		isEarlyDyle: boolean
		region: string
		floorGoal: string
	}
	getIsFindingPlayers: () => boolean
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setFindPlayersError: (findPlayersError: string) => void
	setFoundTeam: (foundTeam: FoundTeam | null) => void
	event: FormEvent<HTMLFormElement>
}) {
	event.preventDefault()
	if (getIsFindingPlayers()) {
		setIsFindingPlayers(false)
		setFoundTeam(null)
		fetch(`/api/teams/${getSearcherId()}`, { method: 'DELETE' })
		return
	}
	const teamTableRows = getTeamTableRows()
	const serverLink = (new FormData(event.currentTarget).get('serverLink') as string).trim()
	if (!teamTableRows.some((row) => !row.isLeftEmpty && !row.isReserved)) {
		setFindPlayersError(
			'At least 1 non-empty & non-reserved row is needed to start finding players!',
		)
	} else if (!teamTableRows.some((row) => !row.isLeftEmpty && row.isReserved)) {
		setFindPlayersError(
			'At least 1 non-empty reserved row (You!) is needed to start finding players!',
		)
	} else if (serverLink && !robloxServerLinkPattern.test(serverLink)) {
		setFindPlayersError('The server link is invalid!')
	} else {
		setFindPlayersError('')
		const res = await fetch(`/api/teams/${getSearcherId()}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				// Solar Support is crossed out on every row whose toon is not Bobette
				teamTableRows: teamTableRows.map((row) => ({
					...row,
					roleNames: row.roleNames.filter((role) => (
						role !== 'Solar Support' || row.toonPicture === 'bobette.png'
					)),
				})),
				serverLink,
				...getTeamSettings(),
			}),
		}).catch(() => null)
		if (!res?.ok) {
			const data = await res?.json().catch(() => null) as { error?: string } | null
			setFindPlayersError(data?.error ?? 'The search could not start, try again')
			return
		}
		setFoundTeam(null)
		setIsFindingPlayers(true)
	}
}
