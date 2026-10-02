import type { DragEvent } from 'react'

export function dragFromSideWindow({
	event,
	kind,
	name,
}: {
	event: DragEvent
	kind: 'toon' | 'trinket' | 'leave-empty'
	name: string
}) {
	event.dataTransfer.setData(kind, name)
}
