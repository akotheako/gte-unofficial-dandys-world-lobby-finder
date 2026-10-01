import type {
	Lobby,
	Roblox,
} from './useLobby.ts'

export function loadRobloxSession({ setState }: Pick<Lobby, 'setState'>) {
	fetch('/api/roblox/me')
		.then((res) => res.json())
		.then((roblox: Roblox | null) => setState({ roblox }))
}
