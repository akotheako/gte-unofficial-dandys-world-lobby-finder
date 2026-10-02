import type { DragEvent } from 'react'

export function allowReservationDropOnPlayerCell({
	getIsTableLocked,
	event,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
}) {
	if (!getIsTableLocked() && event.dataTransfer.types.includes('reserved-for')) {
		event.preventDefault()
	}
}
