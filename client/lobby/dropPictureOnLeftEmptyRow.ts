import type {
	DraggedItem,
	PictureColumn,
} from './useLogic.ts'

// A toon or trinket dropped on a "(Leave Empty)" row brings the row back, with the toon in its Toon
// cell or the trinket in its Trinket A cell
export function dropPictureOnLeftEmptyRow({
	getDraggedItem,
	getRowPicture,
	setIsLeftEmpty,
	setPicture,
	setTableDragLandedInAnotherCell,
}: {
	getDraggedItem: () => DraggedItem | null
	getRowPicture: (column: PictureColumn) => string
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
	setPicture: (picture: {
		column: PictureColumn
		name: string
	}) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
}) {
	const draggedItem = getDraggedItem()
	if (draggedItem?.kind !== 'toon' && draggedItem?.kind !== 'trinket') return
	setIsLeftEmpty(false)
	// A row cannot hold the same trinket twice, so a trinket that the row already holds stays where
	// it is
	if (draggedItem.kind === 'trinket' && getRowPicture('trinketBPicture') === draggedItem.name) {
		return
	}
	setPicture({
		column: draggedItem.kind === 'toon' ? 'toonPicture' : 'trinketAPicture',
		name: draggedItem.name,
	})
	// A picture dragged from another cell moves out of that cell when its drag ends
	if (draggedItem.fromTableCell) setTableDragLandedInAnotherCell(true)
}
