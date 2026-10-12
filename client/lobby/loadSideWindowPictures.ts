export function loadSideWindowPictures({
	setToonsWindowPictures,
	setTrinketsWindowPictures,
}: {
	setToonsWindowPictures: (toonsWindowPictures: string[]) => void
	setTrinketsWindowPictures: (trinketsWindowPictures: string[]) => void
}) {
	// A crashed server leaves the side windows empty until the next reload
	fetch('/api/images/toons').then(async (res) => {
		if (res.ok) setToonsWindowPictures(await res.json())
	})
	fetch('/api/images/trinkets').then(async (res) => {
		if (res.ok) setTrinketsWindowPictures(await res.json())
	})
}
