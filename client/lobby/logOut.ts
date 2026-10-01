import type { Lobby } from './useLobby.ts'

export async function logOut({ setState }: Pick<Lobby, 'setState'>) {
	await fetch('/api/roblox/logout', { method: 'POST' })
	setState({
		roblox: null,
		badges: null,
	})
}
