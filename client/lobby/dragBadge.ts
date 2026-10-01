import type { DragEvent } from 'react'

export function dragBadge({
	event,
	index,
	name,
}: {
	event: DragEvent
	index: number
	name: string
}) {
	event.dataTransfer.setData('badge', name)
	event.dataTransfer.setData('from', `${index} badges`)
}
