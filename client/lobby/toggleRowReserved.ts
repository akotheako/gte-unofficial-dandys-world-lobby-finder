import type { ChangeEvent } from 'react'

export function toggleRowReserved({
	setIsReserved,
	event,
}: {
	setIsReserved: (isReserved: boolean) => void
	event: ChangeEvent<HTMLInputElement>
}) {
	setIsReserved(event.target.checked)
}
