import type { ChangeEvent } from 'react'

export function saveServerLinkField({
	setServerLink,
	event,
}: {
	setServerLink: (serverLink: string) => void
	event: ChangeEvent<HTMLInputElement>
}) {
	localStorage.setItem('serverLink', event.target.value)
	setServerLink(event.target.value)
}
