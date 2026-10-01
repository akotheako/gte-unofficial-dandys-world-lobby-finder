import type { DragEvent } from 'react'
import type { PictureColumn } from './useLobby.ts'

export function dropPictureOnCell({
	getRowPicture,
	setPicture,
	setTableDragLandedInAnotherCell,
	event,
	index,
	column,
}: {
	getRowPicture: (column: PictureColumn) => string
	setPicture: (picture: string) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	event: DragEvent
	index: number
	column: PictureColumn
}) {
	const kind = column === 'toonPicture' ? 'toon' : 'trinket'
	const name = event.dataTransfer.getData(kind)
	const from = event.dataTransfer.getData('from')
	if (!name || from === `${index} ${column}`) return
	// A row cannot hold the same trinket twice, unless it is moving between the two columns
	const otherTrinketColumn = {
		toonPicture: '',
		trinketAPicture: 'trinketBPicture',
		trinketBPicture: 'trinketAPicture',
	}[column] as 'trinketAPicture' | 'trinketBPicture' | ''
	if (
		otherTrinketColumn
		&& getRowPicture(otherTrinketColumn) === name
		&& from !== `${index} ${otherTrinketColumn}`
	) return
	setPicture(name)
	// A picture dragged from another cell moves out of that cell when its drag ends
	if (from) setTableDragLandedInAnotherCell(true)
}
