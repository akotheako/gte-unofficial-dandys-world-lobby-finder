// A click on a tile of the My Toons or My Trinkets window marks it as missing, or as owned again
export function toggleOwnedPictureTile({
	localStorageKey,
	getMissingPictures,
	setMissingPictures,
	name,
}: {
	localStorageKey: 'missingToons' | 'missingTrinkets'
	getMissingPictures: () => string[]
	setMissingPictures: (missingPictures: string[]) => void
	name: string
}) {
	const missingPictures = getMissingPictures().includes(name)
		? getMissingPictures().filter((missingName) => missingName !== name)
		: [...getMissingPictures(), name]
	localStorage.setItem(localStorageKey, JSON.stringify(missingPictures))
	setMissingPictures(missingPictures)
}
