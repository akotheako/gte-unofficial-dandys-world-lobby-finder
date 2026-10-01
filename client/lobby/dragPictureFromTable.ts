import type { DragEvent } from 'react'
import type { PictureColumn } from './useLobby.ts'

export function dragPictureFromTable({
	getPicture,
	event,
	index,
	column,
}: {
	getPicture: () => string
	event: DragEvent
	index: number
	column: PictureColumn
}) {
	const kind = column === 'toonPicture' ? 'toon' : 'trinket'
	event.dataTransfer.setData(kind, getPicture())
	event.dataTransfer.setData('from', `${index} ${column}`)
}
