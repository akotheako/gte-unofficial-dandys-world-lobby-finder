import type { ReservedFor } from '../../shared/teamTypes.ts'
import type { DraggedItem } from './useLogic.ts'

export function dropReservationOnPlayerCell({
	getDraggedItem,
	setReservedFor,
	setTableDragLandedInAnotherCell,
	index,
}: {
	getDraggedItem: () => DraggedItem | null
	setReservedFor: (reservedFor: ReservedFor) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	index: number
}) {
	const draggedItem = getDraggedItem()
	if (draggedItem?.kind !== 'reserved-for') return
	if (draggedItem.fromTableCell === `${index} reservedFor`) return
	setReservedFor(draggedItem.name as ReservedFor)
	// A chip dragged from another Player cell moves out of that cell when its drag ends
	if (draggedItem.fromTableCell) setTableDragLandedInAnotherCell(true)
}
