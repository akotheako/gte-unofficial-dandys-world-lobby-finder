import type { DragEvent } from 'react'

// The picture leaves its cell when it moved to another cell or was dropped outside the table
export function endPictureDragFromTable({
	getTableDragLandedInAnotherCell,
	setTableDragLandedInAnotherCell,
	setPicture,
	event,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	setPicture: (picture: string) => void
	event: DragEvent
}) {
	if (getTableDragLandedInAnotherCell() || event.dataTransfer.dropEffect === 'none') {
		setPicture('')
	}
	setTableDragLandedInAnotherCell(false)
}
