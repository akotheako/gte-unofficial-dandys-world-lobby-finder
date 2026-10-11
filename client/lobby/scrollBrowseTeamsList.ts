// Reaching the end of the card list asks the next check-in for 20 more teams. The check-ins
// restart whenever the count changes, so the new cards arrive right away.
export function scrollBrowseTeamsList({
	getHasMoreBrowsedTeams,
	getListedTeamCount,
	getBrowsedTeamCount,
	setBrowsedTeamCount,
	isNearListEnd,
}: {
	getHasMoreBrowsedTeams: () => boolean
	getListedTeamCount: () => number
	getBrowsedTeamCount: () => number
	setBrowsedTeamCount: (browsedTeamCount: number) => void
	isNearListEnd: boolean
}) {
	if (!isNearListEnd || !getHasMoreBrowsedTeams()) return
	// Every scroll event fires until the asked-for cards arrive, and those ask for nothing more
	if (getListedTeamCount() < getBrowsedTeamCount()) return
	setBrowsedTeamCount(getBrowsedTeamCount() + 20)
}
