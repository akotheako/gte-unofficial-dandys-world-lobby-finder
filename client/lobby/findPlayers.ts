import type { FormEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export function findPlayers({
	getSyncState,
	setState,
	event,
}: Pick<Lobby, 'getSyncState' | 'setState'> & { event: FormEvent<HTMLFormElement> }) {
	event.preventDefault()
	const {
		team,
		finding,
	} = getSyncState()
	if (finding) {
		setState({ finding: false })
		return
	}
	const serverLink = new FormData(event.currentTarget).get('serverLink') as string
	console.log({
		team,
		serverLink,
	})
	if (!team.some((row) => row.toon !== '(Leave Empty)' && !row.reserved)) {
		setState({
			teamError: 'At least 1 non-empty & non-reserved row is needed to start finding players!',
		})
	} else if (!team.some((row) => row.toon !== '(Leave Empty)' && row.reserved)) {
		setState({
			teamError: 'At least 1 non-empty reserved row (You!) is needed to start finding players!',
		})
	} else if (!serverLink.trim()) {
		setState({ teamError: 'A server link is needed!' })
	} else if (!/^https:\/\/www\.roblox\.com\/share\?code=[0-9a-f]{32}&type=Server$/i
		.test(serverLink.trim())) {
		setState({ teamError: 'The server link is invalid!' })
	} else {
		setState({
			teamError: '',
			finding: true,
		})
	}
}
