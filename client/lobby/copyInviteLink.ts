// Every verified friend joins with the same link. Once it was copied, the server keeps the team
// for as long as the tab is open, so that friends can open the link at any time.
export function copyInviteLink({
	inviteCode,
	setIsInviteLinkCopied,
	setIsCopiedTextShown,
}: {
	inviteCode: string
	setIsInviteLinkCopied: (isInviteLinkCopied: boolean) => void
	setIsCopiedTextShown: (isCopiedTextShown: boolean) => void
}) {
	navigator.clipboard.writeText(`${location.origin}/?invite=${inviteCode}`)
	sessionStorage.setItem('isInviteLinkCopied', 'true')
	setIsInviteLinkCopied(true)
	setIsCopiedTextShown(true)
	setTimeout(() => setIsCopiedTextShown(false), 3000)
}
