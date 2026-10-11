import { browseTeamsJoinTableRows } from '../../shared/browseTeamsJoinTableRows.ts'
import type { CheckInAnswer, TeamTableRow } from '../../shared/teamTypes.ts'
import type { JoinedBrowsedTeam } from './useLogic.ts'

// Join button of a free slot in Team Details, which replaces any join that already runs. The
// check-ins restart whenever the join changes, and they carry it to the server, which merges it
// into the chosen team as soon as the user's slot still fits there.
export function joinBrowsedTeamSlot({
	setJoinedBrowsedTeam,
	setBrowseTeamsError,
	browsedTeam,
	hostRowIndex,
	browseTeamsSlot,
	browseTeamSettings,
}: {
	setJoinedBrowsedTeam: (joinedBrowsedTeam: JoinedBrowsedTeam) => void
	setBrowseTeamsError: (browseTeamsError: string) => void
	browsedTeam: CheckInAnswer['browsedTeams'][number]
	// Row of the host's table whose Join button was clicked
	hostRowIndex: number
	// The row of YOUR SLOT
	browseTeamsSlot: TeamTableRow
	// TEAM SETTINGS of Browse Teams, which the join searches with, so that a more specific choice of
	// the user tightens the settings of the team that it joins
	browseTeamSettings: {
		dandyRun: string
		earlyDyle: string
		region: string
		floorGoal: string
	}
}) {
	setBrowseTeamsError('')
	setJoinedBrowsedTeam({
		hostTeamId: browsedTeam.hostTeamId,
		hostRowIndex,
		// The server tells a new join apart from an earlier one with the same team
		searchId: crypto.randomUUID(),
		teamTableRows: browseTeamsJoinTableRows({
			browseTeamsSlot,
			rowCount: browsedTeam.teamTableRows.filter((row) => !row.isLeftEmpty).length,
		}),
		...browseTeamSettings,
	})
}
