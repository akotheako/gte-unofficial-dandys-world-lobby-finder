import type { Lobby } from './useLobby.ts'

// Placeholder number until finding players works for real
export function startFindingCountDrift({
	setState,
	mutateState,
}: Pick<Lobby, 'setState' | 'mutateState'>) {
	setState({ findingCount: 3 + Math.floor(Math.random() * 6) })
	const interval = setInterval(() => mutateState((state) => {
		state.findingCount = Math.max(1, state.findingCount + Math.floor(Math.random() * 3) - 1)
	}), 15_000)
	return () => clearInterval(interval)
}
