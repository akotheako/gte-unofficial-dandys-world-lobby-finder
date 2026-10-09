export function toggleDarkModeCheckbox({
	setIsChecked,
	isChecked,
}: {
	setIsChecked: (isChecked: boolean) => void
	isChecked: boolean
}) {
	localStorage.setItem('darkMode', String(isChecked))
	setIsChecked(isChecked)
}
