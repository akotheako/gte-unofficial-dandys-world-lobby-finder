import type { Lobby } from './useLobby.ts'

export function loadBadges({ setState }: Pick<Lobby, 'setState'>) {
	fetch('/api/roblox/badges')
		.then(async (res) => {
			const data = await res.json()
			if (res.ok) setState({ badges: data })
			else setState({ error: data.error })
		})
}
