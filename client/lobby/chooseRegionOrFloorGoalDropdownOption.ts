export function chooseRegionOrFloorGoalDropdownOption({
	localStorageKey,
	setChosenOption,
	chosenOption,
}: {
	localStorageKey: string
	setChosenOption: (chosenOption: string) => void
	chosenOption: string
}) {
	localStorage.setItem(localStorageKey, chosenOption)
	setChosenOption(chosenOption)
}
