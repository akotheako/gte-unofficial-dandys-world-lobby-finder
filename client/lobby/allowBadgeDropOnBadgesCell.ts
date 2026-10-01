import type { DragEvent } from 'react'

export function allowBadgeDropOnBadgesCell({
	getIsFindingPlayers,
	event,
}: {
	getIsFindingPlayers: () => boolean
	event: DragEvent
}) {
	if (!getIsFindingPlayers() && event.dataTransfer.types.includes('badge')) {
		event.preventDefault()
	}
}
