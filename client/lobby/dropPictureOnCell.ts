import type {
	DraggedItem,
	PictureColumn,
} from './useLogic.ts'

export function dropPictureOnCell({
	getDraggedItem,
	getRowPicture,
	setPicture,
	setTableDragLandedInAnotherCell,
	index,
	column,
}: {
	getDraggedItem: () => DraggedItem | null
	getRowPicture: (column: PictureColumn) => string
	setPicture: (picture: string) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	index: number
	column: PictureColumn
}) {
	const draggedItem = getDraggedItem()
	if (draggedItem?.kind !== (column === 'toonPicture' ? 'toon' : 'trinket')) return
	const {
		name,
		fromTableCell,
	} = draggedItem
	if (fromTableCell === `${index} ${column}`) return
	// A row cannot hold the same trinket twice, unless it is moving between the two columns
	const otherTrinketColumn = {
		toonPicture: '',
		trinketAPicture: 'trinketBPicture',
		trinketBPicture: 'trinketAPicture',
	}[column] as 'trinketAPicture' | 'trinketBPicture' | ''
	if (
		otherTrinketColumn
		&& getRowPicture(otherTrinketColumn) === name
		&& fromTableCell !== `${index} ${otherTrinketColumn}`
	) return
	setPicture(name)
	// A picture dragged from another cell moves out of that cell when its drag ends
	if (fromTableCell) setTableDragLandedInAnotherCell(true)
}
