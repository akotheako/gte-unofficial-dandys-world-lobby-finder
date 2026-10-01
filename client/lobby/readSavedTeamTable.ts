import type { TeamTableRow } from '../../shared/teamTypes.ts'

export function readSavedTeamTable(): TeamTableRow[] {
	const savedRows: (Partial<TeamTableRow> & {
		// Tables saved by older versions of the page use these field names
		toon?: string
		trinketA?: string
		trinketB?: string
		badges?: string[]
		isReserved?: boolean
		reserved?: boolean
		disabled?: boolean
	})[] = JSON.parse(localStorage.getItem('team') ?? 'null') ?? Array.from({ length: 8 }, () => ({}))
	// Older tables had a Reserved checkbox, whose first checked row becomes "Me" and the others
	// "Unverified friend"
	const firstReservedIndex = savedRows.findIndex((row) => row.isReserved ?? row.reserved)
	return savedRows.map((row, index) => {
		const toonPicture = row.toonPicture ?? row.toon ?? ''
		return {
			toonPicture: toonPicture === '(Any)' || toonPicture === '(Leave Empty)' ? '' : toonPicture,
			trinketAPicture: row.trinketAPicture ?? row.trinketA ?? '',
			trinketBPicture: row.trinketBPicture ?? row.trinketB ?? '',
			badgeNames: row.badgeNames ?? row.badges ?? [],
			roleNames: row.roleNames ?? ['Extractor'],
			playerChoice: row.playerChoice ?? (() => {
				if (index === firstReservedIndex) return 'me'
				return row.isReserved ?? row.reserved ? 'unverifiedFriend' : 'findPlayer'
			})(),
			isLeftEmpty: row.isLeftEmpty ?? row.disabled ?? toonPicture === '(Leave Empty)',
		}
	})
}
