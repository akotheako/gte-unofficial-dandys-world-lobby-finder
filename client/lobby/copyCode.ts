import type { Lobby } from './useLobby.ts'

export function copyCode({ getSyncState }: Pick<Lobby, 'getSyncState'>) {
	navigator.clipboard.writeText(getSyncState().code)
}
