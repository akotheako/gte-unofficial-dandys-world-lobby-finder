// "Show all" button of the My Toons or My Trinkets window, which marks every tile as owned again
export function showAllOwnedPictures({
	localStorageKey,
	setMissingPictures,
}: {
	localStorageKey: 'missingToons' | 'missingTrinkets'
	setMissingPictures: (missingPictures: string[]) => void
}) {
	localStorage.removeItem(localStorageKey)
	setMissingPictures([])
}
