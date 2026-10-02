import type { ReservedFor, TeamTableRow } from '../../shared/teamTypes.ts'

export function readSavedTeamTable({ unverifiedFriendNumbers }: {
	unverifiedFriendNumbers: number[]
}): TeamTableRow[] {
	const savedRows: (Partial<TeamTableRow> & {
		// Tables saved by older versions of the page use these field names
		toon?: string
		trinketA?: string
		trinketB?: string
		badges?: string[]
		playerChoice?: string
		isReserved?: boolean
		reserved?: boolean
		disabled?: boolean
	})[] = JSON.parse(localStorage.getItem('team') ?? 'null') ?? Array.from({ length: 8 }, () => ({}))
	// Older tables had a Reserved checkbox, whose first checked row becomes "Me"
	const firstReservedIndex = savedRows.findIndex((row) => row.isReserved ?? row.reserved)
	return savedRows.map((row, index) => {
		const toonPicture = row.toonPicture ?? row.toon ?? ''
		const reservedFor = row.reservedFor
			?? (row.playerChoice === 'me' || index === firstReservedIndex ? 'me' : '')
		// A chip whose friend was removed from the Reserved window, or a verified friend's chip
		// from an earlier visit, whose invite link no longer works, leaves the row for a player
		// to find. A reloaded tab keeps its invite link, and with it its verified friends.
		const isFriendStillThere = reservedFor === ''
			|| reservedFor === 'me'
			|| unverifiedFriendNumbers.some((number) => reservedFor === `unverifiedFriend:${number}`)
			|| (reservedFor.startsWith('verifiedFriend:')
				&& sessionStorage.getItem('isInviteLinkCopied') === 'true')
		return {
			toonPicture: toonPicture === '(Any)' || toonPicture === '(Leave Empty)' ? '' : toonPicture,
			trinketAPicture: row.trinketAPicture ?? row.trinketA ?? '',
			trinketBPicture: row.trinketBPicture ?? row.trinketB ?? '',
			badgeNames: row.badgeNames ?? row.badges ?? [],
			roleNames: row.roleNames ?? ['Extractor'],
			isVerifiedPlayerRequired: row.isVerifiedPlayerRequired
				?? row.playerChoice === 'findVerifiedPlayer',
			reservedFor: isFriendStillThere ? reservedFor as ReservedFor : '',
			isLeftEmpty: row.isLeftEmpty ?? row.disabled ?? toonPicture === '(Leave Empty)',
		}
	})
}
