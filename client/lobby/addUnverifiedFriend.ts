// The new friend gets the number after the highest one in the Reserved window
export function addUnverifiedFriend({
	getUnverifiedFriendNumbers,
	setUnverifiedFriendNumbers,
}: {
	getUnverifiedFriendNumbers: () => number[]
	setUnverifiedFriendNumbers: (unverifiedFriendNumbers: number[]) => void
}) {
	const unverifiedFriendNumbers = getUnverifiedFriendNumbers()
	const newUnverifiedFriendNumbers = [
		...unverifiedFriendNumbers,
		Math.max(0, ...unverifiedFriendNumbers) + 1,
	]
	localStorage.setItem('unverifiedFriendNumbers', JSON.stringify(newUnverifiedFriendNumbers))
	setUnverifiedFriendNumbers(newUnverifiedFriendNumbers)
}
