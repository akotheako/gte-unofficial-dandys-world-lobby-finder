import type { LastFoundTeam } from '../../shared/teamTypes.ts'

export function loadLastFoundTeam({
	setLastFoundTeam,
	setIsLastFoundTeamLoaded,
}: {
	setLastFoundTeam: (lastFoundTeam: LastFoundTeam | null) => void
	setIsLastFoundTeamLoaded: (isLastFoundTeamLoaded: boolean) => void
}) {
	fetch('/api/upvotes/last-team')
		.then((res) => res.json())
		.then((lastFoundTeam: LastFoundTeam | null) => {
			setLastFoundTeam(lastFoundTeam)
			setIsLastFoundTeamLoaded(true)
		})
}
