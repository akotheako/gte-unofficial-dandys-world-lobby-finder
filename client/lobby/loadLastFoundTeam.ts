import type { LastFoundTeam } from '../../shared/teamTypes.ts'

export function loadLastFoundTeam({
	setLastFoundTeam,
	setIsLastFoundTeamLoaded,
	setLastFoundTeamError,
}: {
	setLastFoundTeam: (lastFoundTeam: LastFoundTeam | null) => void
	setIsLastFoundTeamLoaded: (isLastFoundTeamLoaded: boolean) => void
	setLastFoundTeamError: (lastFoundTeamError: string) => void
}) {
	setLastFoundTeamError('')
	fetch('/api/upvotes/last-team').then(async (res) => {
		const data = await res.json()
		if (!res.ok) {
			setLastFoundTeamError(data.error)
			return
		}
		setLastFoundTeam(data)
		setIsLastFoundTeamLoaded(true)
	})
}
