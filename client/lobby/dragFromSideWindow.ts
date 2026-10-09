import type { DraggedItem } from './useLogic.ts'

export function dragFromSideWindow({
	setDraggedItem,
	kind,
	name,
}: {
	setDraggedItem: (draggedItem: DraggedItem) => void
	kind: DraggedItem['kind']
	name: string
}) {
	setDraggedItem({
		kind,
		name,
		fromTableCell: '',
	})
}
