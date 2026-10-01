export function loadVerificationEmojiCode({
	setVerificationEmojiCode,
}: { setVerificationEmojiCode: (verificationEmojiCode: string) => void }) {
	fetch('/api/roblox/code')
		.then((res) => res.json())
		.then((data: { code: string }) => setVerificationEmojiCode(data.code))
}
