import type { DragEvent } from 'react'

export function allowRoleDropOnRoleCell({
	getIsFindingPlayers,
	event,
}: {
	getIsFindingPlayers: () => boolean
	event: DragEvent
}) {
	if (getIsFindingPlayers()) return
	if (event.dataTransfer.types.includes('role')) event.preventDefault()
}
