import type { DragEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function dropBadge({
	mutateState,
	event,
	index,
}: Pick<Lobby, 'mutateState'> & {
	event: DragEvent
	index: number
}) {
	const name = event.dataTransfer.getData('badge')
	const from = event.dataTransfer.getData('from')
	if (from === `${index} badges`) return
	// A row holds one badge per category, so a new badge replaces its category's old one
	const category = [
		['Speed Walker', 'Long Distance Runner', 'Marathon Runner'],
		['Machine Enthusiast', 'Machine Master', 'THE Machine'],
		['Clocked In', 'Overtime'],
		['Hissy Fit'],
		['Just Keep Swimming'],
		['Double Digits!', 'Skilled Toon!', 'Super Skilled Pro!', 'Twisteds Fear Me.'],
	].find((names) => names.includes(name)) ?? [name]
	mutateState((state) => {
		if (from) {
			const fromRow = state.team[Number(from.split(' ')[0])]
			fromRow.badges = fromRow.badges.filter((badge) => badge !== name)
		}
		const row = state.team[index]
		row.badges = [
			...row.badges.filter((badge) => !category.includes(badge)),
			name,
		]
	})
}
