import type { ChangeEvent } from 'react'

export function saveServerLink({ event }: { event: ChangeEvent<HTMLInputElement> }) {
	localStorage.setItem('serverLink', event.target.value)
}
