export function undoLeaveRowEmpty({
	getIsFindingPlayers,
	setIsLeftEmpty,
}: {
	getIsFindingPlayers: () => boolean
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
}) {
	if (getIsFindingPlayers()) return
	setIsLeftEmpty(false)
}
