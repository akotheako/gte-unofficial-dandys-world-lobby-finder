export function undoLeaveRowEmpty({
	getIsTableLocked,
	setIsLeftEmpty,
}: {
	getIsTableLocked: () => boolean
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
}) {
	if (getIsTableLocked()) return
	setIsLeftEmpty(false)
}
