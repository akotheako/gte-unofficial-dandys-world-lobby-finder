import type { ReservedFor } from '../../shared/teamTypes.ts'
import type {
	CardBoxInPickWindow,
	PictureColumn,
} from './useLogic.ts'

// A tile of the Toons or Trinkets pick window fills the card box that opened it, where "(Any)"
// empties the box and "(Leave Empty)" leaves the whole card empty. A name of the Reserved Slots
// pick window fills the Player box, where "(Find a player)" empties it. Every pick closes the
// window.
export function pickInPickWindow({
	getCardBoxInPickWindow,
	getRowPicture,
	setPicture,
	setIsLeftEmpty,
	setReservedFor,
	setCardBoxInPickWindow,
	pick,
}: {
	getCardBoxInPickWindow: () => CardBoxInPickWindow | null
	getRowPicture: (cell: {
		index: number
		column: PictureColumn
	}) => string
	setPicture: (cell: {
		index: number
		column: PictureColumn
		picture: string
	}) => void
	setIsLeftEmpty: (index: number) => void
	setReservedFor: (cell: {
		index: number
		reservedFor: ReservedFor
	}) => void
	setCardBoxInPickWindow: (cardBoxInPickWindow: CardBoxInPickWindow | null) => void
	pick: {
		kind: 'picture' | 'leave-empty' | 'reserved-for'
		name: string
	}
}) {
	const cardBox = getCardBoxInPickWindow()
	if (!cardBox) return
	const {
		index,
		column,
	} = cardBox
	if (pick.kind === 'leave-empty') {
		setIsLeftEmpty(index)
	} else if (pick.kind === 'reserved-for') {
		setReservedFor({
			index,
			reservedFor: pick.name as ReservedFor,
		})
	} else if (column !== 'reservedFor') {
		// A row cannot hold the same trinket twice, so a trinket that the other Trinket box holds
		// moves into this one
		const otherTrinketColumn = {
			toonPicture: null,
			trinketAPicture: 'trinketBPicture',
			trinketBPicture: 'trinketAPicture',
		}[column] as PictureColumn | null
		if (otherTrinketColumn && pick.name && getRowPicture({
			index,
			column: otherTrinketColumn,
		}) === pick.name) {
			setPicture({
				index,
				column: otherTrinketColumn,
				picture: '',
			})
		}
		setPicture({
			index,
			column,
			picture: pick.name,
		})
	}
	setCardBoxInPickWindow(null)
}
