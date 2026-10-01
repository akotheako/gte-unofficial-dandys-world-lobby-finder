import type { DragEvent } from 'react'

export function dragRoleFromTable({
	event,
	index,
	name,
}: {
	event: DragEvent
	index: number
	name: string
}) {
	event.dataTransfer.setData(name === 'Solar Support' ? 'solar-support' : 'role', name)
	event.dataTransfer.setData('from', `${index} roles`)
}
