import type { ChangeEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function toggleReserved({
	mutateState,
	event,
	index,
}: Pick<Lobby, 'mutateState'> & {
	event: ChangeEvent<HTMLInputElement>
	index: number
}) {
	mutateState((state) => {
		state.team[index].reserved = event.target.checked
	})
}
