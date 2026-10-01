import type { RobloxAccount } from './useLobby.ts'

export function loadVerifiedRobloxAccount({
	setVerifiedRobloxAccount,
}: { setVerifiedRobloxAccount: (verifiedRobloxAccount: RobloxAccount | null) => void }) {
	fetch('/api/roblox/me')
		.then((res) => res.json())
		.then(setVerifiedRobloxAccount)
}
