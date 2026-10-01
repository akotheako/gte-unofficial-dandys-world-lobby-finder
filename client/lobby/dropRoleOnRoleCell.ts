import type { DragEvent } from 'react'

export function dropRoleOnRoleCell({
	getRoleNames,
	setRoleNames,
	setTableDragLandedInAnotherCell,
	event,
	index,
}: {
	getRoleNames: () => string[]
	setRoleNames: (roleNames: string[]) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	event: DragEvent
	index: number
}) {
	const name = event.dataTransfer.getData('role')
	const from = event.dataTransfer.getData('from')
	if (!name || from === `${index} roles`) return
	setRoleNames([
		...getRoleNames().filter((role) => role !== name),
		name,
	])
	// A role dragged from another row moves out of that row when its drag ends
	if (from) setTableDragLandedInAnotherCell(true)
}
