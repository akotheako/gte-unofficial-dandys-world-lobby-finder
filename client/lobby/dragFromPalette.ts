import type { DragEvent } from 'react'

export function dragFromPalette({
	event,
	kind,
	name,
}: {
	event: DragEvent
	kind: 'toon' | 'trinket' | 'badge'
	name: string
}) {
	event.dataTransfer.setData(kind, name)
}
