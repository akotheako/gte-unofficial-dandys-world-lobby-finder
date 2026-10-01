import type {
	RobloxAccount,
	RobloxBadge,
} from './useLogic.ts'

export async function logOutOfRoblox({
	setVerifiedRobloxAccount,
	setRobloxBadgeChecklist,
}: {
	setVerifiedRobloxAccount: (verifiedRobloxAccount: RobloxAccount | null) => void
	setRobloxBadgeChecklist: (robloxBadgeChecklist: RobloxBadge[] | null) => void
}) {
	await fetch('/api/roblox/logout', { method: 'POST' })
	setVerifiedRobloxAccount(null)
	setRobloxBadgeChecklist(null)
}
