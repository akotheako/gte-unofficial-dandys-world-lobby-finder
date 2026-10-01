import type { DragEvent } from 'react'
import type {
	Column,
	Lobby,
} from './useLobby.ts'

// Dropped anywhere that is not a matching cell, the image leaves the table
export function dropItemOutside({
	mutateState,
	event,
	index,
	column,
}: Pick<Lobby, 'mutateState'> & {
	event: DragEvent
	index: number
	column: Column
}) {
	if (event.dataTransfer.dropEffect !== 'none') return
	mutateState((state) => {
		state.team[index][column] = ''
	})
}
