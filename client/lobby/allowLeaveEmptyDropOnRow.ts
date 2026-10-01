import type { DragEvent } from 'react'

export function allowLeaveEmptyDropOnRow({
	getIsFindingPlayers,
	event,
}: {
	getIsFindingPlayers: () => boolean
	event: DragEvent
}) {
	if (!getIsFindingPlayers() && event.dataTransfer.types.includes('leave-empty')) {
		event.preventDefault()
	}
}
