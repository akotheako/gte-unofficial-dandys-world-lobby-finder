// Placeholder number until finding players works for real
export function fakeFindingPlayersCount({
	getFindingPlayersCount,
	setFindingPlayersCount,
}: {
	getFindingPlayersCount: () => number
	setFindingPlayersCount: (findingPlayersCount: number) => void
}) {
	setFindingPlayersCount(3 + Math.floor(Math.random() * 6))
	const interval = setInterval(() => setFindingPlayersCount(
		Math.max(1, getFindingPlayersCount() + Math.floor(Math.random() * 3) - 1),
	), 15_000)
	return () => clearInterval(interval)
}
