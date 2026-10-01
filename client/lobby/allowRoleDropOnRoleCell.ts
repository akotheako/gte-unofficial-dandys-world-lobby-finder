import type { DragEvent } from 'react'

export function allowRoleDropOnRoleCell({
	getIsTableLocked,
	event,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
}) {
	if (getIsTableLocked()) return
	if (event.dataTransfer.types.includes('role')) event.preventDefault()
}
