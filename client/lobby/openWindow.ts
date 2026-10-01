import type { MouseEvent } from 'react'

export function openWindow({
	id,
	event,
}: {
	id: string
	event: MouseEvent<HTMLButtonElement>
}) {
	const dialog = document.getElementById(id) as HTMLDialogElement
	if (dialog.open) return
	// Only one window is open at a time, so any other window shrinks back into its icon. A window
	// inside another window, like the server link help, belongs to its parent and stays as it is.
	for (const other of document.querySelectorAll<HTMLDialogElement>(
		'dialog.window[open]:not(dialog dialog)',
	)) {
		other.requestClose()
	}
	// show() instead of showModal() leaves out the dark backdrop and keeps the page clickable
	dialog.show()
	// The window grows out of the icon, starting at its position and size
	const from = event.currentTarget.getBoundingClientRect()
	const to = dialog.getBoundingClientRect()
	dialog.animate([
		{
			translate: `${from.x - to.x}px ${from.y - to.y}px`,
			scale: `${from.width / to.width} ${from.height / to.height}`,
		},
		{
			translate: '0 0',
			scale: '1',
		},
	], {
		duration: 200,
		easing: 'ease-out',
	})
}
