import type { FormEvent } from 'react'
import type { RobloxAccount } from './useLogic.ts'

export async function verifyRobloxUsername({
	setRobloxVerificationError,
	setVerifiedRobloxAccount,
	event,
}: {
	setRobloxVerificationError: (robloxVerificationError: string) => void
	setVerifiedRobloxAccount: (verifiedRobloxAccount: RobloxAccount) => void
	event: FormEvent<HTMLFormElement>
}) {
	event.preventDefault()
	const username = new FormData(event.currentTarget).get('username') as string
	localStorage.setItem('robloxUsername', username)
	const res = await fetch('/api/roblox/check', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username }),
	})
	const data = await res.json()
	setRobloxVerificationError(res.ok ? '' : data.error)
	if (res.ok) setVerifiedRobloxAccount(data)
}
