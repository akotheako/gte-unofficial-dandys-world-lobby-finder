export function requestCloseWindow({ id }: { id: string }) {
	(document.getElementById(id) as HTMLDialogElement).requestClose()
}
