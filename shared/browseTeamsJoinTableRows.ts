import type { TeamTableRow } from './teamTypes.ts'

// Table that a Browse Teams join searches with: the user's slot reserved for "Me", followed by
// rows without any requirement, as many as the host's table has rows that are not
// "(Leave Empty)", since two searches only merge when they want the same number of players
export function browseTeamsJoinTableRows({
	browseTeamsSlot,
	rowCount,
}: {
	browseTeamsSlot: Pick<
		TeamTableRow,
		'toonPicture' | 'trinketAPicture' | 'trinketBPicture' | 'roleNames'
	>
	rowCount: number
}) {
	return Array.from({ length: rowCount }, (_, index): TeamTableRow => ({
		toonPicture: index === 0 ? browseTeamsSlot.toonPicture : '',
		trinketAPicture: index === 0 ? browseTeamsSlot.trinketAPicture : '',
		trinketBPicture: index === 0 ? browseTeamsSlot.trinketBPicture : '',
		badgeNames: [],
		roleNames: index === 0 ? browseTeamsSlot.roleNames : [],
		isVerifiedPlayerRequired: false,
		reservedFor: index === 0 ? 'me' : '',
		isLeftEmpty: false,
	}))
}
