import type { DragEvent } from 'react'

export function allowBadgeDropOnBadgesCell({
	getIsTableLocked,
	event,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
}) {
	if (!getIsTableLocked() && event.dataTransfer.types.includes('badge')) {
		event.preventDefault()
	}
}
