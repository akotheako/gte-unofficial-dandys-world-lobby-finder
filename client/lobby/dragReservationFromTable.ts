import type { DragEvent } from 'react'
import type { ReservedFor } from '../../shared/teamTypes.ts'

export function dragReservationFromTable({
	getReservedFor,
	event,
	index,
}: {
	getReservedFor: () => ReservedFor
	event: DragEvent
	index: number
}) {
	event.dataTransfer.setData('reserved-for', getReservedFor())
	event.dataTransfer.setData('from', `${index} reservedFor`)
}
