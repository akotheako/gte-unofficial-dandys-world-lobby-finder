import type { RobloxBadge } from './useLogic.ts'

export async function updateRobloxBadgeChecklist({
	getRobloxBadgeChecklist,
	setRobloxBadgeChecklist,
	setRobloxVerificationError,
}: {
	getRobloxBadgeChecklist: () => RobloxBadge[] | null
	setRobloxBadgeChecklist: (robloxBadgeChecklist: RobloxBadge[] | null) => void
	setRobloxVerificationError: (robloxVerificationError: string) => void
}) {
	const lastKnownBadges = getRobloxBadgeChecklist()
	setRobloxBadgeChecklist(null)
	setRobloxVerificationError('')
	const res = await fetch('/api/roblox/badges?refresh')
	const data = await res.json()
	if (res.ok) {
		setRobloxBadgeChecklist(data)
		return
	}
	// A failed update keeps showing the badges from before, with the error below them
	setRobloxBadgeChecklist(lastKnownBadges)
	setRobloxVerificationError(data.error)
}
