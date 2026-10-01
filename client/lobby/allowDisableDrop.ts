import type { DragEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function allowDisableDrop({
	getSyncState,
	event,
}: Pick<Lobby, 'getSyncState'> & { event: DragEvent }) {
	if (!getSyncState().finding && event.dataTransfer.types.includes('disable')) {
		event.preventDefault()
	}
}
