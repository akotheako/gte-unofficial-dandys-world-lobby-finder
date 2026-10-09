import type { ReservedFor } from '../../shared/teamTypes.ts'
import type { DraggedItem } from './useLogic.ts'

export function dragReservationFromTable({
	getReservedFor,
	setDraggedItem,
	index,
}: {
	getReservedFor: () => ReservedFor
	setDraggedItem: (draggedItem: DraggedItem) => void
	index: number
}) {
	setDraggedItem({
		kind: 'reserved-for',
		name: getReservedFor(),
		fromTableCell: `${index} reservedFor`,
	})
}
