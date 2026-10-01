import type { ChangeEvent } from 'react'

export function chooseRegionOrFloorGoalDropdownOption({
	localStorageKey,
	setChosenOption,
	event,
}: {
	localStorageKey: string
	setChosenOption: (chosenOption: string) => void
	event: ChangeEvent<HTMLSelectElement>
}) {
	localStorage.setItem(localStorageKey, event.target.value)
	setChosenOption(event.target.value)
}
