import type { TeamTableRow } from '../../shared/teamTypes.ts'

export function saveTeamTable({ teamTableRows }: { teamTableRows: TeamTableRow[] }) {
	localStorage.setItem('team', JSON.stringify(teamTableRows))
}
