import type { Lobby } from './useLobby.ts'

export async function refreshBadges({ setState }: Pick<Lobby, 'setState'>) {
	setState({
		badges: null,
		error: '',
	})
	const res = await fetch('/api/roblox/badges?refresh')
	const data = await res.json()
	if (res.ok) setState({ badges: data })
	else setState({ error: data.error })
}
