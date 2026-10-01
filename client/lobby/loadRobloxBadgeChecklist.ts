import type { RobloxBadge } from './useLogic.ts'

export function loadRobloxBadgeChecklist({
	setRobloxBadgeChecklist,
	setRobloxVerificationError,
}: {
	setRobloxBadgeChecklist: (robloxBadgeChecklist: RobloxBadge[]) => void
	setRobloxVerificationError: (robloxVerificationError: string) => void
}) {
	fetch('/api/roblox/badges')
		.then(async (res) => {
			const data = await res.json()
			if (res.ok) setRobloxBadgeChecklist(data)
			else setRobloxVerificationError(data.error)
		})
}
