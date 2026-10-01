import type { DragEvent } from 'react'

export function dragFromPalette({
	event,
	kind,
	name,
}: {
	event: DragEvent
	kind: 'toon' | 'trinket' | 'badge' | 'disable'
	name: string
}) {
	event.dataTransfer.setData(kind, name)
}
