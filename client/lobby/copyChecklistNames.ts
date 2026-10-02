// Remembers the checked names of the Badges or Roles window, so that Paste can check the same names
// in another row
export function copyChecklistNames({
	checkedNames,
	setCopiedNames,
	setConfirmedButton,
}: {
	checkedNames: string[]
	setCopiedNames: (copiedNames: string[]) => void
	setConfirmedButton: (confirmedButton: 'Copy' | null) => void
}) {
	setCopiedNames([...checkedNames])
	setConfirmedButton('Copy')
	setTimeout(() => setConfirmedButton(null), 3000)
}
