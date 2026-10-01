import type { ChangeEvent } from 'react'

export function saveServerLinkField({ event }: { event: ChangeEvent<HTMLInputElement> }) {
	localStorage.setItem('serverLink', event.target.value)
}
