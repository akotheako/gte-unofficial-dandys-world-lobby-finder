import type { FormEvent } from 'react'
import type { Lobby } from './useLobby.ts'

export async function checkUsername({
	setState,
	event,
}: Pick<Lobby, 'setState'> & { event: FormEvent<HTMLFormElement> }) {
	event.preventDefault()
	const username = new FormData(event.currentTarget).get('username') as string
	localStorage.setItem('robloxUsername', username)
	const res = await fetch('/api/roblox/check', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username }),
	})
	const data = await res.json()
	setState({ error: res.ok ? '' : data.error })
	if (res.ok) setState({ roblox: data })
}
