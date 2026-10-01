import type { SyntheticEvent } from 'react'

// Esc and × land here, and the window shrinks into its icon before closing
export function shrinkWindowIntoIcon({
	id,
	event,
}: {
	id: string
	event: SyntheticEvent<HTMLDialogElement>
}) {
	event.preventDefault()
	const dialog = event.currentTarget
	const from = dialog.getBoundingClientRect()
	const icon = document.getElementById(`${id}-icon`)!
	const to = icon.getBoundingClientRect()
	dialog.animate([
		{
			translate: '0 0',
			scale: '1',
		},
		{
			translate: `${to.x - from.x}px ${to.y - from.y}px`,
			scale: `${to.width / from.width} ${to.height / from.height}`,
		},
	], {
		duration: 150,
		easing: 'ease-in',
	}).onfinish = () => dialog.close()
}
