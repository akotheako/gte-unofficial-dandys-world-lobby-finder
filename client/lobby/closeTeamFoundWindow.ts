// Closing "Team found!" ends the found search and unlocks the table. An invited friend only
// watches the host's team, so their window just closes.
export function closeTeamFoundWindow({
	getIsInvitedFriend,
	setIsTeamFoundWindowOpen,
	setIsFindingPlayers,
	setShownTeamStatus,
}: {
	getIsInvitedFriend: () => boolean
	setIsTeamFoundWindowOpen: (isTeamFoundWindowOpen: boolean) => void
	setIsFindingPlayers: (isFindingPlayers: boolean) => void
	setShownTeamStatus: (shownTeamStatus: null) => void
}) {
	setIsTeamFoundWindowOpen(false)
	if (getIsInvitedFriend()) return
	setIsFindingPlayers(false)
	setShownTeamStatus(null)
}
