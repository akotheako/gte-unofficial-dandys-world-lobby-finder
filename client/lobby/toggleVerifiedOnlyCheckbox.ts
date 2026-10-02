import type { ChangeEvent } from 'react'

export function toggleVerifiedOnlyCheckbox({
	setIsVerifiedPlayerRequired,
	event,
}: {
	setIsVerifiedPlayerRequired: (isVerifiedPlayerRequired: boolean) => void
	event: ChangeEvent<HTMLInputElement>
}) {
	setIsVerifiedPlayerRequired(event.target.checked)
}
