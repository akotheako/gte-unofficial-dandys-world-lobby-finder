import type { ChangeEvent } from 'react'
import type { PlayerChoice } from '../../shared/teamTypes.ts'

export function choosePlayerInRow({
	setPlayerChoices,
	getPlayerChoices,
	event,
	index,
}: {
	setPlayerChoices: (playerChoices: PlayerChoice[]) => void
	getPlayerChoices: () => PlayerChoice[]
	event: ChangeEvent<HTMLSelectElement>
	index: number
}) {
	const chosen = event.target.value as PlayerChoice
	setPlayerChoices(getPlayerChoices().map((playerChoice, rowIndex) => {
		if (rowIndex === index) return chosen
		// Only one row is the user, so choosing "Me" turns the old "Me" row into "Find player"
		return chosen === 'me' && playerChoice === 'me' ? 'findPlayer' : playerChoice
	}))
}
