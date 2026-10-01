import type { DragEvent } from 'react'
import type {
	Column,
	Lobby,
} from './useLobby.ts'

export function dragItem({
	getSyncState,
	event,
	index,
	column,
}: Pick<Lobby, 'getSyncState'> & {
	event: DragEvent
	index: number
	column: Column
}) {
	const kind = column === 'toon' ? 'toon' : 'trinket'
	event.dataTransfer.setData(kind, getSyncState().team[index][column])
	event.dataTransfer.setData('from', `${index} ${column}`)
}
