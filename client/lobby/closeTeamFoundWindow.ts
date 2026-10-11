// Closing "Team found!" ends the found search or Browse Teams join and unlocks the table. An
// invited friend only watches the host's team, so their window just closes.
export function closeTeamFoundWindow({
	getIsInvitedFriend,
	setIsTeamFoundWindowOpen,
	setIsFindingPlayers,
	setJoinedBrowsedTeam,
	setShownTeamStatus,
}: {
	getIsInvitedFriend: () => boolean
	setIsTeamFoundWindowOpen: (isTeamFoundWindowOpen: boolean) => void
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setJoinedBrowsedTeam: (joinedBrowsedTeam: null) => void
	setShownTeamStatus: (shownTeamStatus: null) => void
}) {
	setIsTeamFoundWindowOpen(false)
	if (getIsInvitedFriend()) return
	setIsFindingPlayers(false)
	setJoinedBrowsedTeam(null)
	setShownTeamStatus(null)
}
