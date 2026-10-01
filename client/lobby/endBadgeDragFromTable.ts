import type { DragEvent } from 'react'

// The badge leaves its row when it moved to another row or was dropped outside the table
export function endBadgeDragFromTable({
	getTableDragLandedInAnotherCell,
	setTableDragLandedInAnotherCell,
	getBadgeNames,
	setBadgeNames,
	event,
	name,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	getBadgeNames: () => string[]
	setBadgeNames: (badgeNames: string[]) => void
	event: DragEvent
	name: string
}) {
	if (getTableDragLandedInAnotherCell() || event.dataTransfer.dropEffect === 'none') {
		setBadgeNames(getBadgeNames().filter((badge) => badge !== name))
	}
	setTableDragLandedInAnotherCell(false)
}
