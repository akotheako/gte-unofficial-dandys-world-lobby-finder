import type { RobloxBadge } from './useLobby.ts'

export async function updateRobloxBadgeChecklist({
	setRobloxBadgeChecklist,
	setRobloxVerificationError,
}: {
	setRobloxBadgeChecklist: (robloxBadgeChecklist: RobloxBadge[] | null) => void
	setRobloxVerificationError: (robloxVerificationError: string) => void
}) {
	setRobloxBadgeChecklist(null)
	setRobloxVerificationError('')
	const res = await fetch('/api/roblox/badges?refresh')
	const data = await res.json()
	if (res.ok) setRobloxBadgeChecklist(data)
	else setRobloxVerificationError(data.error)
}
