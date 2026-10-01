import type { DragEvent } from 'react'

export function leaveRowEmpty({
	setIsLeftEmpty,
	event,
}: {
	setIsLeftEmpty: (isLeftEmpty: boolean) => void
	event: DragEvent
}) {
	if (!event.dataTransfer.types.includes('leave-empty')) return
	setIsLeftEmpty(true)
}
