export function toggleOptionsCheckbox({
	localStorageKey,
	setIsChecked,
	isChecked,
}: {
	localStorageKey: string
	setIsChecked: (isChecked: boolean) => void
	isChecked: boolean
}) {
	localStorage.setItem(localStorageKey, String(isChecked))
	setIsChecked(isChecked)
}
