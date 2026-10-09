import type { CardBoxInPickWindow } from './useLogic.ts'

export function tapFindATeamCardBox({
	getIsTableLocked,
	setCardBoxInPickWindow,
	cardBox,
}: {
	getIsTableLocked: () => boolean
	setCardBoxInPickWindow: (cardBoxInPickWindow: CardBoxInPickWindow) => void
	cardBox: CardBoxInPickWindow
}) {
	if (getIsTableLocked()) return
	setCardBoxInPickWindow(cardBox)
}
