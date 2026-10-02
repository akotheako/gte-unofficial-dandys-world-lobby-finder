import type { DragEvent } from 'react'
import type { ReservedFor } from '../../shared/teamTypes.ts'

// The chip leaves its Player cell when it moved to another one or was dropped outside the table
export function endReservationDragFromTable({
	getTableDragLandedInAnotherCell,
	setTableDragLandedInAnotherCell,
	setReservedFor,
	event,
}: {
	getTableDragLandedInAnotherCell: () => boolean
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	setReservedFor: (reservedFor: ReservedFor) => void
	event: DragEvent
}) {
	if (getTableDragLandedInAnotherCell() || event.dataTransfer.dropEffect === 'none') {
		setReservedFor('')
	}
	setTableDragLandedInAnotherCell(false)
}
