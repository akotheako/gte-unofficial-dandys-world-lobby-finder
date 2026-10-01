import type { Lobby } from './useLobby.ts'

export function loadCode({ setState }: Pick<Lobby, 'setState'>) {
	fetch('/api/roblox/code')
		.then((res) => res.json())
		.then((data: { code: string }) => setState({ code: data.code }))
}
