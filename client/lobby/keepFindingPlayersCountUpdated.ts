export function keepFindingPlayersCountUpdated({
	setFindingPlayersCount,
}: { setFindingPlayersCount: (findingPlayersCount: number) => void }) {
	const update = () => fetch('/api/teams')
		.then((res) => res.json())
		.then((data: { count: number }) => setFindingPlayersCount(data.count))
		// A failed request keeps the last count until the next tick
		.catch(() => {})
	update()
	const interval = setInterval(update, 15_000)
	return () => clearInterval(interval)
}
