import { browseTeamsJoinTableRows } from '../../shared/browseTeamsJoinTableRows.ts'
import type { CheckInAnswer, TeamTableRow } from '../../shared/teamTypes.ts'
import type { JoinedBrowsedTeam } from './useLogic.ts'

// The check-ins restart whenever this changes, and they carry the join to the server, which merges
// it into the chosen team as soon as the user's slot still fits there
export function toggleJoiningBrowsedTeam({
	getJoinedBrowsedTeam,
	setJoinedBrowsedTeam,
	setBrowseTeamsError,
	browsedTeam,
	hostRowIndex,
	browseTeamsSlot,
}: {
	getJoinedBrowsedTeam: () => JoinedBrowsedTeam | null
	setJoinedBrowsedTeam: (joinedBrowsedTeam: JoinedBrowsedTeam | null) => void
	setBrowseTeamsError: (browseTeamsError: string) => void
	browsedTeam: CheckInAnswer['browsedTeams'][number]
	// Row of the host's table whose Join button was clicked
	hostRowIndex: number
	// The row of YOUR SLOT
	browseTeamsSlot: TeamTableRow
}) {
	setBrowseTeamsError('')
	if (getJoinedBrowsedTeam()) {
		setJoinedBrowsedTeam(null)
		return
	}
	setJoinedBrowsedTeam({
		hostTeamId: browsedTeam.hostTeamId,
		hostRowIndex,
		// The server tells a new join apart from an earlier one with the same team
		searchId: crypto.randomUUID(),
		teamTableRows: browseTeamsJoinTableRows({
			browseTeamsSlot,
			rowCount: browsedTeam.teamTableRows.filter((row) => !row.isLeftEmpty).length,
		}),
		dandyRun: browsedTeam.dandyRun,
		earlyDyle: browsedTeam.earlyDyle,
		region: browsedTeam.region,
		floorGoal: browsedTeam.floorGoal,
	})
}
