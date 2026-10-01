import type { DragEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function disableRow({
	mutateState,
	event,
	index,
}: Pick<Lobby, 'mutateState'> & {
	event: DragEvent
	index: number
}) {
	if (!event.dataTransfer.types.includes('disable')) return
	mutateState((state) => {
		state.team[index].disabled = true
	})
}
