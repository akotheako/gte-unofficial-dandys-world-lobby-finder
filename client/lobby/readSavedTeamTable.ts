import type { TeamTableRow } from './useLobby.ts'

export function readSavedTeamTable(): TeamTableRow[] {
	return (
		JSON.parse(localStorage.getItem('team') ?? 'null') ?? Array.from({ length: 8 }, () => ({}))
	).map((row: Partial<TeamTableRow> & {
		// Tables saved by older versions of the page use these field names
		toon?: string
		trinketA?: string
		trinketB?: string
		badges?: string[]
		reserved?: boolean
		disabled?: boolean
	}) => {
		const toonPicture = row.toonPicture ?? row.toon ?? ''
		return {
			toonPicture: toonPicture === '(Any)' || toonPicture === '(Leave Empty)' ? '' : toonPicture,
			trinketAPicture: row.trinketAPicture ?? row.trinketA ?? '',
			trinketBPicture: row.trinketBPicture ?? row.trinketB ?? '',
			badgeNames: row.badgeNames ?? row.badges ?? [],
			isReserved: row.isReserved ?? row.reserved ?? false,
			isLeftEmpty: row.isLeftEmpty ?? row.disabled ?? toonPicture === '(Leave Empty)',
		}
	})
}
