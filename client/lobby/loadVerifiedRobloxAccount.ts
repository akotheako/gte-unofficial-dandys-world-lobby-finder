import type { RobloxAccount } from './useLogic.ts'

export function loadVerifiedRobloxAccount({
	setVerifiedRobloxAccount,
}: { setVerifiedRobloxAccount: (verifiedRobloxAccount: RobloxAccount | null) => void }) {
	fetch('/api/roblox/me')
		// A crashed server leaves the page unverified until the next reload
		.then((res) => (res.ok ? res.json() : null))
		.then(setVerifiedRobloxAccount)
}
