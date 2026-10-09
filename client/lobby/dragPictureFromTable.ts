import type {
	DraggedItem,
	PictureColumn,
} from './useLogic.ts'

export function dragPictureFromTable({
	getPicture,
	setDraggedItem,
	index,
	column,
}: {
	getPicture: () => string
	setDraggedItem: (draggedItem: DraggedItem) => void
	index: number
	column: PictureColumn
}) {
	setDraggedItem({
		kind: column === 'toonPicture' ? 'toon' : 'trinket',
		name: getPicture(),
		fromTableCell: `${index} ${column}`,
	})
}
