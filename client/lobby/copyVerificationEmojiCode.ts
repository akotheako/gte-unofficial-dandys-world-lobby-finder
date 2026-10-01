export function copyVerificationEmojiCode({
	getVerificationEmojiCode,
	setIsVerificationEmojiCodeCopied,
}: {
	getVerificationEmojiCode: () => string
	setIsVerificationEmojiCodeCopied: (isVerificationEmojiCodeCopied: boolean) => void
}) {
	navigator.clipboard.writeText(getVerificationEmojiCode())
	setIsVerificationEmojiCodeCopied(true)
	setTimeout(() => setIsVerificationEmojiCodeCopied(false), 3000)
}
