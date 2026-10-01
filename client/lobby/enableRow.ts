import type { Lobby } from './useLobby.ts'

export function enableRow({
	getSyncState,
	mutateState,
	index,
}: Pick<Lobby, 'getSyncState' | 'mutateState'> & { index: number }) {
	if (getSyncState().finding) return
	mutateState((state) => {
		state.team[index].disabled = false
	})
}
