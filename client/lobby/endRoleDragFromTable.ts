import type { DragEvent } from 'react'

// The role leaves its row when it moved to another row or was dropped outside the table
export function endRoleDragFromTable({
	getTableDragLandedInAnotherCell,
	setTableDragLandedInAnotherCell,
	getRoleNames,
	setRoleNames,
	event,
	name,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	getRoleNames: () => string[]
	setRoleNames: (roleNames: string[]) => void
	event: DragEvent
	name: string
}) {
	if (getTableDragLandedInAnotherCell() || event.dataTransfer.dropEffect === 'none') {
		setRoleNames(getRoleNames().filter((role) => role !== name))
	}
	setTableDragLandedInAnotherCell(false)
}
