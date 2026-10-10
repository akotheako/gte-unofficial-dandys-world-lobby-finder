// "Show all" button of the My Toons or My Trinkets window, which stays pressed in until it is
// clicked again. While pressed, the side window and the pick window show every picture, missing
// ones too.
export function showAllOwnedPictures({
	localStorageKey,
	getIsShowingAll,
	setIsShowingAll,
}: {
	localStorageKey: 'showAllToons' | 'showAllTrinkets'
	getIsShowingAll: () => boolean
	setIsShowingAll: (isShowingAll: boolean) => void
}) {
	const isShowingAll = !getIsShowingAll()
	localStorage.setItem(localStorageKey, String(isShowingAll))
	setIsShowingAll(isShowingAll)
}
