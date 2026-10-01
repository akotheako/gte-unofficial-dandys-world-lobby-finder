import type { DragEvent } from 'react'
import type { PictureColumn } from './useLogic.ts'

export function allowPictureDropOnCell({
	getIsTableLocked,
	event,
	column,
}: {
	getIsTableLocked: () => boolean
	event: DragEvent
	column: PictureColumn
}) {
	const kind = column === 'toonPicture' ? 'toon' : 'trinket'
	if (!getIsTableLocked() && event.dataTransfer.types.includes(kind)) event.preventDefault()
}
