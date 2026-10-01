import type { DragEvent } from 'react'
import type { PictureColumn } from './useLobby.ts'

export function allowPictureDropOnCell({
	getIsFindingPlayers,
	event,
	column,
}: {
	getIsFindingPlayers: () => boolean
	event: DragEvent
	column: PictureColumn
}) {
	const kind = column === 'toonPicture' ? 'toon' : 'trinket'
	if (!getIsFindingPlayers() && event.dataTransfer.types.includes(kind)) event.preventDefault()
}
