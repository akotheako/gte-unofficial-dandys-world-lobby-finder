import type { DragEvent } from 'react'

// Solar Support drags as its own kind, because only a Bobette row accepts it
export function allowRoleDropOnRoleCell({
	getIsFindingPlayers,
	getToonPicture,
	event,
}: {
	getIsFindingPlayers: () => boolean
	getToonPicture: () => string
	event: DragEvent
}) {
	if (getIsFindingPlayers()) return
	if (
		event.dataTransfer.types.includes('role')
		|| (
			event.dataTransfer.types.includes('solar-support')
			&& getToonPicture() === 'bobette.png'
		)
	) {
		event.preventDefault()
	}
}
