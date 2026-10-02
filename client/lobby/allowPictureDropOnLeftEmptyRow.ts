import type { DragEvent } from 'react'

export function allowPictureDropOnLeftEmptyRow({
	getIsTableLocked,
	event,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
}) {
	const types = event.dataTransfer.types
	if (!getIsTableLocked() && (types.includes('toon') || types.includes('trinket'))) {
		event.preventDefault()
	}
}
