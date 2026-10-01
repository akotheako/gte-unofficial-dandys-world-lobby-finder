import type { Row } from './useLobby.ts'

export function readSavedTeam(): Row[] {
	return (
		JSON.parse(localStorage.getItem('team') ?? 'null') ?? Array.from({ length: 8 }, () => ({}))
	).map((row: Partial<Row>) => ({
		trinketA: '',
		trinketB: '',
		badges: [],
		reserved: false,
		disabled: row.toon === '(Leave Empty)',
		...row,
		toon: row.toon === '(Any)' || row.toon === '(Leave Empty)' ? '' : row.toon ?? '',
	}))
}
