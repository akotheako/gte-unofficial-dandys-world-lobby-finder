import type { DragEvent } from 'react'
import type {
	Column,
	Lobby,
} from './useLobby.ts'

export function allowItemDrop({
	getSyncState,
	event,
	column,
}: Pick<Lobby, 'getSyncState'> & {
	event: DragEvent
	column: Column
}) {
	const kind = column === 'toon' ? 'toon' : 'trinket'
	if (!getSyncState().finding && event.dataTransfer.types.includes(kind)) event.preventDefault()
}
