// Checks exactly the names that Copy remembered in the same window, and unchecks the rest
export function pasteChecklistNames({
	copiedNames,
	setCheckedNames,
	setConfirmedButton,
}: {
	copiedNames: string[]
	setCheckedNames: (checkedNames: string[]) => void
	setConfirmedButton: (confirmedButton: 'Paste' | null) => void
}) {
	setCheckedNames([...copiedNames])
	setConfirmedButton('Paste')
	setTimeout(() => setConfirmedButton(null), 3000)
}
