import type { DragEvent } from 'react'
import type { ReservedFor } from '../../shared/teamTypes.ts'

export function dropReservationOnPlayerCell({
	setReservedFor,
	setTableDragLandedInAnotherCell,
	event,
	index,
}: {
	setReservedFor: (reservedFor: ReservedFor) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	event: DragEvent
	index: number
}) {
	const reservedFor = event.dataTransfer.getData('reserved-for') as ReservedFor
	const from = event.dataTransfer.getData('from')
	if (!reservedFor || from === `${index} reservedFor`) return
	setReservedFor(reservedFor)
	// A chip dragged from another Player cell moves out of that cell when its drag ends
	if (from) setTableDragLandedInAnotherCell(true)
}
