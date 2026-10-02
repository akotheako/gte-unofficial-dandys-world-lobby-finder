export function openBadgesOrRolesWindow({
	getIsTableLocked,
	setRowIndexInWindow,
	id,
	index,
}: {
	getIsTableLocked: () => boolean
	setRowIndexInWindow: (rowIndexInWindow: number) => void
	id: 'team-badges' | 'team-roles'
	index: number
}) {
	if (getIsTableLocked()) return
	setRowIndexInWindow(index)
	;(document.getElementById(id) as HTMLDialogElement).showModal()
}
