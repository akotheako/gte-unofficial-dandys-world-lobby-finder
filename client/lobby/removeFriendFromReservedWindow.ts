import type { ReservedFor } from '../../shared/teamTypes.ts'

// The friend's chips leave the Player column too, so their rows are left for players to find. A
// removed verified friend stays on a list that the invite link no longer lets in.
export function removeFriendFromReservedWindow({
	getUnverifiedFriendNumbers,
	setUnverifiedFriendNumbers,
	getRemovedVerifiedFriendUsernames,
	setRemovedVerifiedFriendUsernames,
	clearReservationFromTable,
	reservedFor,
}: {
	getUnverifiedFriendNumbers: () => number[]
	setUnverifiedFriendNumbers: (unverifiedFriendNumbers: number[]) => void
	getRemovedVerifiedFriendUsernames: () => string[]
	setRemovedVerifiedFriendUsernames: (removedVerifiedFriendUsernames: string[]) => void
	clearReservationFromTable: (reservedFor: ReservedFor) => void
	reservedFor: ReservedFor
}) {
	if (reservedFor.startsWith('verifiedFriend:')) {
		const removedVerifiedFriendUsernames = [
			...getRemovedVerifiedFriendUsernames(),
			reservedFor.slice('verifiedFriend:'.length),
		]
		sessionStorage.setItem(
			'removedVerifiedFriendUsernames',
			JSON.stringify(removedVerifiedFriendUsernames),
		)
		setRemovedVerifiedFriendUsernames(removedVerifiedFriendUsernames)
	} else {
		const unverifiedFriendNumbers = getUnverifiedFriendNumbers()
			.filter((number) => reservedFor !== `unverifiedFriend:${number}`)
		localStorage.setItem('unverifiedFriendNumbers', JSON.stringify(unverifiedFriendNumbers))
		setUnverifiedFriendNumbers(unverifiedFriendNumbers)
	}
	clearReservationFromTable(reservedFor)
}
