import type { Row } from './useLobby.ts'

export function saveTeam({ team }: { team: Row[] }) {
	localStorage.setItem('team', JSON.stringify(team))
}
