import type { DragEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function allowBadgeDrop({
	getSyncState,
	event,
}: Pick<Lobby, 'getSyncState'> & { event: DragEvent }) {
	if (!getSyncState().finding && event.dataTransfer.types.includes('badge')) event.preventDefault()
}
