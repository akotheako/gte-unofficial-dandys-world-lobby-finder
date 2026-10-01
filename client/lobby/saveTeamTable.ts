import type { TeamTableRow } from './useLobby.ts'

export function saveTeamTable({ teamTableRows }: { teamTableRows: TeamTableRow[] }) {
	localStorage.setItem('team', JSON.stringify(teamTableRows))
}
