import type { Lobby } from './useLobby.ts'

export function startHeartbeat({ setState }: Pick<Lobby, 'setState'>) {
	// The id survives reloads, so a reloaded tab still counts as one person
	const id = sessionStorage.getItem('onlineId') ?? crypto.randomUUID()
	sessionStorage.setItem('onlineId', id)
	const beat = () => fetch('/api/online', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id }),
	})
		.then((res) => res.json())
		.then((data: { count: number }) => setState({ onlineCount: data.count }))
	beat()
	const interval = setInterval(beat, 15_000)
	return () => clearInterval(interval)
}
