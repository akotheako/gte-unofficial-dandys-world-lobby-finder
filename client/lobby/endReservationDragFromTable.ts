import type { ReservedFor } from '../../shared/teamTypes.ts'
import type { DraggedItem } from './useLogic.ts'

// The chip leaves its Player cell when it moved to another one or was dropped outside the table
export function endReservationDragFromTable({
	getTableDragLandedInAnotherCell,
	getTableDragLandedOnTable,
	setTableDragLandedInAnotherCell,
	setTableDragLandedOnTable,
	setDraggedItem,
	setReservedFor,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	getTableDragLandedOnTable: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	setTableDragLandedOnTable: (tableDragLandedOnTable: boolean) => void
	setDraggedItem: (draggedItem: DraggedItem | null) => void
	setReservedFor: (reservedFor: ReservedFor) => void
}) {
	if (getTableDragLandedInAnotherCell() || !getTableDragLandedOnTable()) setReservedFor('')
	setTableDragLandedInAnotherCell(false)
	setTableDragLandedOnTable(false)
	setDraggedItem(null)
}
