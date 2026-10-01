import type { DragEvent } from 'react'
import type {
	Column,
	Lobby,
} from './useLobby.ts'

export function dropItem({
	mutateState,
	event,
	index,
	column,
}: Pick<Lobby, 'mutateState'> & {
	event: DragEvent
	index: number
	column: Column
}) {
	const kind = column === 'toon' ? 'toon' : 'trinket'
	const name = event.dataTransfer.getData(kind)
	const from = event.dataTransfer.getData('from')
	if (!name || from === `${index} ${column}`) return
	mutateState((state) => {
		const row = state.team[index]
		// A row cannot hold the same trinket twice, unless it is moving between the two columns
		const otherTrinket = {
			toon: '',
			trinketA: 'trinketB',
			trinketB: 'trinketA',
		}[column] as 'trinketA' | 'trinketB' | ''
		if (
			otherTrinket
			&& row[otherTrinket] === name
			&& from !== `${index} ${otherTrinket}`
		) return
		// An image dragged from another cell moves out of that cell
		if (from) {
			const [fromIndex, fromColumn] = from.split(' ')
			state.team[Number(fromIndex)][fromColumn as Column] = ''
		}
		row[column] = name
	})
}
