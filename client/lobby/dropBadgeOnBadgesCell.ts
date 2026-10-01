import type { DragEvent } from 'react'

export function dropBadgeOnBadgesCell({
	getBadgeNames,
	setBadgeNames,
	setTableDragLandedInAnotherCell,
	event,
	index,
}: {
	getBadgeNames: () => string[]
	setBadgeNames: (badgeNames: string[]) => void
	setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell: boolean) => void
	event: DragEvent
	index: number
}) {
	const name = event.dataTransfer.getData('badge')
	const from = event.dataTransfer.getData('from')
	if (!name || from === `${index} badges`) return
	// A row holds one badge per category, so a new badge replaces its category's old one
	const category = [
		['Speed Walker', 'Long Distance Runner', 'Marathon Runner'],
		['Machine Enthusiast', 'Machine Master', 'THE Machine'],
		['Clocked In', 'Overtime'],
		['Hissy Fit'],
		['Just Keep Swimming'],
		['Double Digits!', 'Skilled Toon!', 'Super Skilled Pro!', 'Twisteds Fear Me.'],
	].find((names) => names.includes(name)) ?? [name]
	setBadgeNames([
		...getBadgeNames().filter((badge) => !category.includes(badge)),
		name,
	])
	// A badge dragged from another row moves out of that row when its drag ends
	if (from) setTableDragLandedInAnotherCell(true)
}
