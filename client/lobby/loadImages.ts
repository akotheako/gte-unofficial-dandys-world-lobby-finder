import type { Lobby } from './useLobby.ts'

export function loadImages({ setState }: Pick<Lobby, 'setState'>) {
	fetch('/api/images/toons')
		.then((res) => res.json())
		.then((toons: string[]) => setState({ toons }))
	fetch('/api/images/trinkets')
		.then((res) => res.json())
		.then((trinkets: string[]) => setState({ trinkets }))
}
