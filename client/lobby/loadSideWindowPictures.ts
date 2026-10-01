export function loadSideWindowPictures({
	setToonsWindowPictures,
	setTrinketsWindowPictures,
}: {
	setToonsWindowPictures: (toonsWindowPictures: string[]) => void
	setTrinketsWindowPictures: (trinketsWindowPictures: string[]) => void
}) {
	fetch('/api/images/toons')
		.then((res) => res.json())
		.then(setToonsWindowPictures)
	fetch('/api/images/trinkets')
		.then((res) => res.json())
		.then(setTrinketsWindowPictures)
}
