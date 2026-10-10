export function toggleBadgeCheckbox({
	getBadgeNames,
	setBadgeNames,
	isChecked,
	name,
}: {
	getBadgeNames: () => string[]
	setBadgeNames: (badgeNames: string[]) => void
	isChecked: boolean
	name: string
}) {
	setBadgeNames(isChecked
		? [
			...getBadgeNames(),
			name,
		]
		: getBadgeNames().filter((badge) => badge !== name))
}
