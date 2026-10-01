import type { FoundTeam } from './useLogic.ts'

export function checkForFoundPlayers({
	searcherId,
	setFoundTeam,
	setIsFindingPlayers,
	setFindPlayersError,
}: {
	searcherId: string
	setFoundTeam: (foundTeam: FoundTeam | null) => void
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setFindPlayersError: (findPlayersError: string) => void
}) {
	// Answers that arrive after Cancel would otherwise show a stopped search again
	let isCancelled = false
	const check = async () => {
		// A failed request is retried on the next tick
		const res = await fetch(`/api/teams/${searcherId}`, { method: 'POST' }).catch(() => null)
		if (isCancelled || !res) return
		if (res.status === 404) {
			const { error } = await res.json() as { error: string }
			setIsFindingPlayers(false)
			setFoundTeam(null)
			setFindPlayersError(error)
		} else if (res.ok) {
			setFoundTeam(await res.json() as FoundTeam)
		}
	}
	check()
	const interval = setInterval(check, 5_000)
	// Closing or reloading the tab ends the search right away, instead of after 90 seconds
	const endSearch = () => fetch(`/api/teams/${searcherId}`, {
		method: 'DELETE',
		keepalive: true,
	})
	addEventListener('pagehide', endSearch)
	return () => {
		isCancelled = true
		clearInterval(interval)
		removeEventListener('pagehide', endSearch)
	}
}
