export function loadVerificationEmojiCode({
	setVerificationEmojiCode,
}: { setVerificationEmojiCode: (verificationEmojiCode: string) => void }) {
	fetch('/api/roblox/code')
		.then((res) => res.json())
		// A crashed server sends an error instead of a code, which the field shows
		.then((data: {
			code?: string
			error?: string
		}) => setVerificationEmojiCode(data.code ?? data.error ?? ''))
}
