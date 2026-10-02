import type {
	RobloxAccount,
	RobloxBadge,
} from './useLogic.ts'

export async function logOutOfRoblox({
	setVerifiedRobloxAccount,
	setRobloxBadgeChecklist,
	setRobloxVerificationError,
}: {
	setVerifiedRobloxAccount: (verifiedRobloxAccount: RobloxAccount | null) => void
	setRobloxBadgeChecklist: (robloxBadgeChecklist: RobloxBadge[] | null) => void
	setRobloxVerificationError: (robloxVerificationError: string) => void
}) {
	await fetch('/api/roblox/logout', { method: 'POST' })
	setVerifiedRobloxAccount(null)
	setRobloxBadgeChecklist(null)
	setRobloxVerificationError('')
}
