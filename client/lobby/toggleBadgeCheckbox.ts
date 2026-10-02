import type { ChangeEvent } from 'react'
import { badgeCategories } from '../../shared/badgeCategories.ts'

export function toggleBadgeCheckbox({
	getBadgeNames,
	setBadgeNames,
	event,
	name,
}: {
	getBadgeNames: () => string[]
	setBadgeNames: (badgeNames: string[]) => void
	event: ChangeEvent<HTMLInputElement>
	name: string
}) {
	if (!event.target.checked) {
		setBadgeNames(getBadgeNames().filter((badge) => badge !== name))
		return
	}
	// A row holds one badge per category, so a checked badge unchecks its category's other badges
	const category = badgeCategories.find((names) => names.includes(name)) ?? [name]
	setBadgeNames([
		...getBadgeNames().filter((badge) => !category.includes(badge)),
		name,
	])
}
