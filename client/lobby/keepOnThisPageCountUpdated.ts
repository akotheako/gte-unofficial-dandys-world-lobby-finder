export function keepOnThisPageCountUpdated({
	setOnThisPageCount,
}: { setOnThisPageCount: (onThisPageCount: number) => void }) {
	// The id survives reloads, so a reloaded tab still counts as one person
	const id = sessionStorage.getItem('onlineId') ?? crypto.randomUUID()
	sessionStorage.setItem('onlineId', id)
	const beat = () => fetch('/api/online', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ id }),
	})
		.then((res) => res.json())
		.then((data: { count: number }) => setOnThisPageCount(data.count))
	beat()
	const interval = setInterval(beat, 15_000)
	return () => clearInterval(interval)
}
