import type { DraggedItem } from './useLogic.ts'

// The picture leaves its cell when it moved to another cell or was dropped outside the table
export function endPictureDragFromTable({
	getTableDragLandedInAnotherCell,
	getTableDragLandedOnTable,
	setTableDragLandedInAnotherCell,
	setTableDragLandedOnTable,
	setDraggedItem,
	setPicture,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	getTableDragLandedOnTable: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	setTableDragLandedOnTable: (tableDragLandedOnTable: boolean) => void
	setDraggedItem: (draggedItem: DraggedItem | null) => void
	setPicture: (picture: string) => void
}) {
	if (getTableDragLandedInAnotherCell() || !getTableDragLandedOnTable()) setPicture('')
	setTableDragLandedInAnotherCell(false)
	setTableDragLandedOnTable(false)
	setDraggedItem(null)
}
