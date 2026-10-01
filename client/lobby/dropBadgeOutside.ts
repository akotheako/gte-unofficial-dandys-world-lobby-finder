import type { DragEvent } from 'react'
import type { Lobby } from './useLobby.ts'

// Dropped anywhere that is not a Badges cell, the badge leaves the table
export function dropBadgeOutside({
	mutateState,
	event,
	index,
	name,
}: Pick<Lobby, 'mutateState'> & {
	event: DragEvent
	index: number
	name: string
}) {
	if (event.dataTransfer.dropEffect !== 'none') return
	mutateState((state) => {
		const row = state.team[index]
		row.badges = row.badges.filter((badge) => badge !== name)
	})
}
