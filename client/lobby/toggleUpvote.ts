// Upvotes the player, or takes the upvote back when it was already given
export async function toggleUpvote({
	robloxUserId,
	isUpvoted,
	setIsUpvoted,
}: {
	robloxUserId: string
	isUpvoted: boolean
	setIsUpvoted: (isUpvoted: boolean) => void
}) {
	const res = await fetch('/api/upvotes', {
		method: isUpvoted ? 'DELETE' : 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ robloxUserId }),
	})
	if (res.ok) setIsUpvoted(!isUpvoted)
}
