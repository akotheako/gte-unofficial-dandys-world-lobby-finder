import type { ChangeEvent } from 'react'

export function toggleDandyRunOrEarlyDyleCheckbox({
	localStorageKey,
	setIsChecked,
	event,
}: {
	localStorageKey: string
	setIsChecked: (isChecked: boolean) => void
	event: ChangeEvent<HTMLInputElement>
}) {
	localStorage.setItem(localStorageKey, String(event.target.checked))
	setIsChecked(event.target.checked)
}
