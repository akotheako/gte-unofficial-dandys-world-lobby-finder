import type { DragEvent } from 'react'

export function allowLeaveEmptyDropOnRow({
	getIsTableLocked,
	event,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
}) {
	if (!getIsTableLocked() && event.dataTransfer.types.includes('leave-empty')) {
		event.preventDefault()
	}
}
