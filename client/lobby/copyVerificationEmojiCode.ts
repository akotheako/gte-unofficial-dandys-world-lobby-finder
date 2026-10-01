export function copyVerificationEmojiCode({
	getVerificationEmojiCode,
}: { getVerificationEmojiCode: () => string }) {
	navigator.clipboard.writeText(getVerificationEmojiCode())
}
