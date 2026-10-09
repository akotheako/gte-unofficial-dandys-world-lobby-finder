export function toggleRoleCheckbox({
	getRoleNames,
	setRoleNames,
	isChecked,
	name,
}: {
	getRoleNames: () => string[]
	setRoleNames: (roleNames: string[]) => void
	isChecked: boolean
	name: string
}) {
	const otherRoleNames = getRoleNames().filter((role) => role !== name)
	setRoleNames(isChecked ? [...otherRoleNames, name] : otherRoleNames)
}
