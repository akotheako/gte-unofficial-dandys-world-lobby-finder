import type { ChangeEvent } from 'react'

export function toggleRoleCheckbox({
	getRoleNames,
	setRoleNames,
	event,
	name,
}: {
	getRoleNames: () => string[]
	setRoleNames: (roleNames: string[]) => void
	event: ChangeEvent<HTMLInputElement>
	name: string
}) {
	const otherRoleNames = getRoleNames().filter((role) => role !== name)
	setRoleNames(event.target.checked ? [...otherRoleNames, name] : otherRoleNames)
}
