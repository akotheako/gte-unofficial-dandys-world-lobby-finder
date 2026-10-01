export function copyInviteLink({
	inviteCode,
	setCopiedInviteLinkRowIndex,
	index,
}: {
	inviteCode: string
	setCopiedInviteLinkRowIndex: (copiedInviteLinkRowIndex: number | null) => void
	index: number
}) {
	navigator.clipboard.writeText(`${location.origin}/?invite=${inviteCode}&row=${index}`)
	setCopiedInviteLinkRowIndex(index)
	setTimeout(() => setCopiedInviteLinkRowIndex(null), 3000)
}
