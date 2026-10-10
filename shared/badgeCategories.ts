// Dandy's World badges grouped by category, each category ordered from the easiest badge to the
// hardest, so owning a later badge also proves the earlier ones
export const badgeCategories = [
	['Speed Walker', 'Long Distance Runner', 'Marathon Runner'],
	['Machine Enthusiast', 'Machine Master', 'THE Machine'],
	['Clocked In', 'Overtime'],
	['Hissy Fit'],
	['Quick Reaction Time'],
	['Just Keep Swimming'],
	['Double Digits!', 'Skilled Toon!', 'Super Skilled Pro!', 'Twisteds Fear Me.'],
]

export function isBadgeProvenByLaterCheckedBadge({
	badgeName,
	checkedBadgeNames,
}: {
	badgeName: string
	checkedBadgeNames: string[]
}) {
	return badgeCategories.some((category) => (
		category.includes(badgeName) && category
			.slice(category.indexOf(badgeName) + 1)
			.some((laterBadge) => checkedBadgeNames.includes(laterBadge))
	))
}
