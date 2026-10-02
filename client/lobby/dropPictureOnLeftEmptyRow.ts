import type { DragEvent } from 'react'
import type { PictureColumn } from './useLogic.ts'

// A toon or trinket dropped on a "(Leave Empty)" row brings the row back, with the toon in its Toon
// cell or the trinket in its Trinket A cell
export function dropPictureOnLeftEmptyRow({
	getRowPicture,
	setIsLeftEmpty,
	setPicture,
	setTableDragLandedInAnotherCell,
	event,
}: {
	getRowPicture: (column: PictureColumn) => string
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
	setPicture: (picture: {
		column: PictureColumn
		name: string
	}) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	event: DragEvent
}) {
	const toon = event.dataTransfer.getData('toon')
	const trinket = event.dataTransfer.getData('trinket')
	if (!toon && !trinket) return
	setIsLeftEmpty(false)
	// A row cannot hold the same trinket twice, so a trinket that the row already holds stays where
	// it is
	if (!toon && getRowPicture('trinketBPicture') === trinket) return
	setPicture({
		column: toon ? 'toonPicture' : 'trinketAPicture',
		name: toon || trinket,
	})
	// A picture dragged from another cell moves out of that cell when its drag ends
	if (event.dataTransfer.getData('from')) setTableDragLandedInAnotherCell(true)
}
