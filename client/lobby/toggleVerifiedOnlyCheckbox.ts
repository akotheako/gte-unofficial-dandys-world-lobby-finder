export function toggleVerifiedOnlyCheckbox({
	setIsVerifiedPlayerRequired,
	isChecked,
}: {
	setIsVerifiedPlayerRequired: (isVerifiedPlayerRequired: boolean) => void
	isChecked: boolean
}) {
	setIsVerifiedPlayerRequired(isChecked)
}
