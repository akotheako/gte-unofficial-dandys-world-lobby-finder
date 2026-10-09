export function openBadgesOrRolesWindow({
	getIsTableLocked,
	setRowIndexInWindow,
	setIsWindowOpen,
	index,
}: {
	getIsTableLocked: () => boolean
	setRowIndexInWindow: (rowIndexInWindow: number) => void
	setIsWindowOpen: (isWindowOpen: boolean) => void
	index: number
}) {
	if (getIsTableLocked()) return
	setRowIndexInWindow(index)
	setIsWindowOpen(true)
}
