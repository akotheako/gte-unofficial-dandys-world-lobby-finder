import type { TeamTableRow } from './useLogic.ts'

export function saveTeamTable({ teamTableRows }: { teamTableRows: TeamTableRow[] }) {
	localStorage.setItem('team', JSON.stringify(teamTableRows))
}
