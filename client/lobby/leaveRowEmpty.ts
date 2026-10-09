import type { DraggedItem } from './useLogic.ts'

export function leaveRowEmpty({
	getDraggedItem,
	setIsLeftEmpty,
}: {
	getDraggedItem: () => DraggedItem | null
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
}) {
	if (getDraggedItem()?.kind !== 'leave-empty') return
	setIsLeftEmpty(true)
}
