export function closeWindowFromXButton({ id }: { id: string }) {
	(document.getElementById(id) as HTMLDialogElement).requestClose()
}
