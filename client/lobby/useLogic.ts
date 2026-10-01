import {
	useEffect,
	type ChangeEvent,
	type DragEvent,
	type FormEvent,
	type MouseEvent,
	type SyntheticEvent,
} from 'react'
import { useSyncState } from '../useSyncState.ts'
import { allowBadgeDropOnBadgesCell } from './allowBadgeDropOnBadgesCell.ts'
import { allowLeaveEmptyDropOnRow } from './allowLeaveEmptyDropOnRow.ts'
import { allowPictureDropOnCell } from './allowPictureDropOnCell.ts'
import {
	chooseRegionOrFloorGoalDropdownOption,
} from './chooseRegionOrFloorGoalDropdownOption.ts'
import { closeServerLinkHelpWindow } from './closeServerLinkHelpWindow.ts'
import { closeWindowFromXButton } from './closeWindowFromXButton.ts'
import { copyVerificationEmojiCode } from './copyVerificationEmojiCode.ts'
import { dragBadgeFromTable } from './dragBadgeFromTable.ts'
import { dragFromSideWindow } from './dragFromSideWindow.ts'
import { dragPictureFromTable } from './dragPictureFromTable.ts'
import { dropBadgeOnBadgesCell } from './dropBadgeOnBadgesCell.ts'
import { dropPictureOnCell } from './dropPictureOnCell.ts'
import { endBadgeDragFromTable } from './endBadgeDragFromTable.ts'
import { endPictureDragFromTable } from './endPictureDragFromTable.ts'
import { fakeFindingPlayersCount } from './fakeFindingPlayersCount.ts'
import { growWindowFromIcon } from './growWindowFromIcon.ts'
import { keepOnThisPageCountUpdated } from './keepOnThisPageCountUpdated.ts'
import { leaveRowEmpty } from './leaveRowEmpty.ts'
import { loadRobloxBadgeChecklist } from './loadRobloxBadgeChecklist.ts'
import { loadSideWindowPictures } from './loadSideWindowPictures.ts'
import { loadVerificationEmojiCode } from './loadVerificationEmojiCode.ts'
import { loadVerifiedRobloxAccount } from './loadVerifiedRobloxAccount.ts'
import { logOutOfRoblox } from './logOutOfRoblox.ts'
import { openServerLinkHelpWindow } from './openServerLinkHelpWindow.ts'
import { readSavedTeamTable } from './readSavedTeamTable.ts'
import { saveServerLinkField } from './saveServerLinkField.ts'
import { toggleDandyRunOrEarlyDyleCheckbox } from './toggleDandyRunOrEarlyDyleCheckbox.ts'
import { saveTeamTable } from './saveTeamTable.ts'
import { shrinkWindowIntoIcon } from './shrinkWindowIntoIcon.ts'
import { toggleFindingPlayers } from './toggleFindingPlayers.ts'
import { toggleRowReserved } from './toggleRowReserved.ts'
import { undoLeaveRowEmpty } from './undoLeaveRowEmpty.ts'
import { updateRobloxBadgeChecklist } from './updateRobloxBadgeChecklist.ts'
import { verifyRobloxUsername } from './verifyRobloxUsername.ts'

export type RobloxAccount = {
	id: number
	username: string
}

export type RobloxBadge = {
	name: string
	owned: boolean
}

export type PictureColumn = 'toonPicture' | 'trinketAPicture' | 'trinketBPicture'

export type TeamTableRow = {
	toonPicture: string
	trinketAPicture: string
	trinketBPicture: string
	badgeNames: string[]
	isReserved: boolean
	isLeftEmpty: boolean
}

export function useLogic() {
	const {
		asyncState: state,
		getSyncState,
		setState,
		mutateState,
	} = useSyncState((): {
		verifiedRobloxAccount: RobloxAccount | null
		verificationEmojiCode: string
		robloxVerificationError: string
		robloxBadgeChecklist: RobloxBadge[] | null
		usernameFieldStartValue: string
		teamTableRows: TeamTableRow[]
		toonsWindowPictures: string[]
		trinketsWindowPictures: string[]
		serverLinkFieldStartValue: string
		isDandyRunCheckboxChecked: boolean
		isEarlyDyleCheckboxChecked: boolean
		chosenRegionDropdownOption: string
		chosenFloorGoalDropdownOption: string
		findPlayersError: string
		isFindingPlayers: boolean
		onThisPageCount: number
		findingPlayersCount: number
		tableDragLandedInAnotherCell: boolean
	} => ({
		verifiedRobloxAccount: null,
		verificationEmojiCode: '',
		robloxVerificationError: '',
		robloxBadgeChecklist: null,
		usernameFieldStartValue: localStorage.getItem('robloxUsername') ?? '',
		teamTableRows: readSavedTeamTable(),
		toonsWindowPictures: [],
		trinketsWindowPictures: [],
		serverLinkFieldStartValue: localStorage.getItem('serverLink') ?? '',
		isDandyRunCheckboxChecked: localStorage.getItem('dandyRun') === 'true',
		isEarlyDyleCheckboxChecked: localStorage.getItem('earlyDyle') === 'true',
		chosenRegionDropdownOption: localStorage.getItem('region') ?? 'Any',
		chosenFloorGoalDropdownOption: localStorage.getItem('floorGoal') ?? '50',
		findPlayersError: '',
		isFindingPlayers: false,
		onThisPageCount: 0,
		findingPlayersCount: 0,
		tableDragLandedInAnotherCell: false,
	}))

	// Fills the Toons and Trinkets side windows with pictures
	useEffect(() => loadSideWindowPictures({
		setToonsWindowPictures: (toonsWindowPictures) => setState({ toonsWindowPictures }),
		setTrinketsWindowPictures: (trinketsWindowPictures) => setState({ trinketsWindowPictures }),
	}), [setState])

	// Keeps the "on this page" counter at the bottom of the screen up to date
	useEffect(() => keepOnThisPageCountUpdated({
		setOnThisPageCount: (onThisPageCount) => setState({ onThisPageCount }),
	}), [setState])

	// Keeps the "finding players" counter at the bottom of the screen up to date
	useEffect(() => fakeFindingPlayersCount({
		getFindingPlayersCount: () => getSyncState().findingPlayersCount,
		setFindingPlayersCount: (findingPlayersCount) => setState({ findingPlayersCount }),
	}), [getSyncState, setState])

	// Decides whether Roblox Verification opens on "Verified as <name>" or on the instructions
	useEffect(() => loadVerifiedRobloxAccount({
		setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
	}), [setState])
	const isRobloxVerified = Boolean(state.verifiedRobloxAccount)

	// Fills the badge checklist once verified, or the emoji code next to Copy otherwise
	useEffect(() => {
		if (isRobloxVerified) {
			loadRobloxBadgeChecklist({
				setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({
					robloxBadgeChecklist,
				}),
				setRobloxVerificationError: (robloxVerificationError) => setState({
					robloxVerificationError,
				}),
			})
		} else {
			loadVerificationEmojiCode({
				setVerificationEmojiCode: (verificationEmojiCode) => setState({
					verificationEmojiCode,
				}),
			})
		}
	}, [isRobloxVerified, setState])

	// Remembers the Find a Team table across reloads

	// mutateState keeps the rows array's identity while editing its rows, so this runs on every render
	useEffect(() => saveTeamTable({ teamTableRows: state.teamTableRows }))

	return {

		// Roblox Verification icon, first in the row at the top of the screen, and its window
		robloxVerificationWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => growWindowFromIcon({
				id: 'account',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => shrinkWindowIntoIcon({
				id: 'account',
				event,
			}),
			onCloseClick: () => closeWindowFromXButton({ id: 'account' }),
		},
		isRobloxVerified,


		// Verified view of Roblox Verification: "Verified as <name>" and the badge checklist,

		// with Update Badges at the bottom left and Log out at the bottom right
		verifiedRobloxUsername: state.verifiedRobloxAccount?.username ?? '',
		showBadgeChecklist: Boolean(state.robloxBadgeChecklist),
		badgeChecklist: (state.robloxBadgeChecklist ?? []).map((badge) => ({
			name: badge.name,
			mark: badge.owned ? '✅' : '⬜',
		})),
		badgeChecklistLoadingText: state.robloxVerificationError || 'Loading badges...',
		updateRobloxBadgeChecklist: () => updateRobloxBadgeChecklist({
			setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({ robloxBadgeChecklist }),
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
		}),
		logOutOfRoblox: () => logOutOfRoblox({
			setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
			setRobloxBadgeChecklist: (robloxBadgeChecklist) => setState({ robloxBadgeChecklist }),
		}),


		// Unverified view of Roblox Verification: the emoji code with Copy, then the username

		// field with Check and any error below it
		verificationEmojiCode: state.verificationEmojiCode,
		copyVerificationEmojiCode: () => copyVerificationEmojiCode({
			getVerificationEmojiCode: () => getSyncState().verificationEmojiCode,
		}),
		usernameFieldStartValue: state.usernameFieldStartValue,
		verifyRobloxUsername: (event: FormEvent<HTMLFormElement>) => verifyRobloxUsername({
			setRobloxVerificationError: (robloxVerificationError) => setState({
				robloxVerificationError,
			}),
			setVerifiedRobloxAccount: (verifiedRobloxAccount) => setState({ verifiedRobloxAccount }),
			event,
		}),
		robloxVerificationError: state.robloxVerificationError,


		// Find a Team icon, second in the row at the top of the screen, and its window
		findATeamWindow: {
			onIconClick: (event: MouseEvent<HTMLButtonElement>) => growWindowFromIcon({
				id: 'team',
				event,
			}),
			onCancel: (event: SyntheticEvent<HTMLDialogElement>) => shrinkWindowIntoIcon({
				id: 'team',
				event,
			}),
			onCloseClick: () => closeWindowFromXButton({ id: 'team' }),
		},

		// Greys out the Toons, Trinkets and Badges side windows while searching
		sideWindowClass: state.isFindingPlayers ? 'window team-locked' : 'window',

		// "(Leave Empty)" tile, first in the Toons side window to the lower left
		dragLeaveEmptyTile: (event: DragEvent) => dragFromSideWindow({
			event,
			kind: 'leave-empty',
			name: '(Leave Empty)',
		}),

		// Toon pictures in the Toons side window to the lower left
		toonsWindowTiles: state.toonsWindowPictures.map((name) => ({
			name,
			src: `/toons/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: (event: DragEvent) => dragFromSideWindow({
				event,
				kind: 'toon',
				name,
			}),
		})),

		// Trinket pictures in the Trinkets side window to the upper right
		trinketsWindowTiles: state.trinketsWindowPictures.map((name) => ({
			name,
			src: `/trinkets/${name}`,
			title: name.replace('.png', ''),
			dragFromSideWindow: (event: DragEvent) => dragFromSideWindow({
				event,
				kind: 'trinket',
				name,
			}),
		})),

		// Badge names in the Badges side window below Trinkets, shown only once verified
		badgesWindowTiles: (state.robloxBadgeChecklist ?? [])
			.filter((badge) => badge.owned)
			.map((badge) => ({
				name: badge.name,
				dragFromSideWindow: (event: DragEvent) => dragFromSideWindow({
					event,
					kind: 'badge',
					name: badge.name,
				}),
			})),

		// Rows of the white table in the middle of Find a Team
		teamTableRows: state.teamTableRows.map((row, index) => ({
			key: index,

			// Dropping "(Leave Empty)" anywhere on the row
			allowLeaveEmptyDropOnRow: (event: DragEvent) => allowLeaveEmptyDropOnRow({
				getIsFindingPlayers: () => getSyncState().isFindingPlayers,
				event,
			}),
			leaveRowEmpty: (event: DragEvent) => leaveRowEmpty({
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
				event,
			}),

			// Grey "(Leave Empty)" cell that spans the whole row and clears when clicked
			isLeftEmpty: row.isLeftEmpty,
			leaveEmptyCellColSpan: isRobloxVerified ? 5 : 4,
			leaveEmptyCellClass: state.isFindingPlayers
				? 'team-disabled'
				: 'team-disabled team-clickable',
			undoLeaveRowEmpty: () => undoLeaveRowEmpty({
				getIsFindingPlayers: () => getSyncState().isFindingPlayers,
				setIsLeftEmpty: (isLeftEmpty) => mutateState((state) => {
					state.teamTableRows[index].isLeftEmpty = isLeftEmpty
				}),
			}),

			// Toon, Trinket A and Trinket B cells, the first three columns of the row
			pictureCells: (['toonPicture', 'trinketAPicture', 'trinketBPicture'] as const)
				.map((column) => ({
					column,
					allowPictureDropOnCell: (event: DragEvent) => allowPictureDropOnCell({
						getIsFindingPlayers: () => getSyncState().isFindingPlayers,
						event,
						column,
					}),
					dropPictureOnCell: (event: DragEvent) => dropPictureOnCell({
						getRowPicture: (rowColumn) => getSyncState().teamTableRows[index][rowColumn],
						setPicture: (picture) => mutateState((state) => {
							state.teamTableRows[index][column] = picture
						}),
						setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
							tableDragLandedInAnotherCell,
						}),
						event,
						index,
						column,
					}),

					// Grey "(Any)" text in an empty Toon cell
					anyToonText: column === 'toonPicture' && !row[column] ? '(Any)' : '',

					// Picture inside the cell, which drags to another cell or out of the table to
					// clear it
					picture: row[column] ? {
						src: `/${column === 'toonPicture' ? 'toons' : 'trinkets'}/${row[column]}`,
						title: row[column].replace('.png', ''),
						draggable: !state.isFindingPlayers,
						dragPictureFromTable: (event: DragEvent) => dragPictureFromTable({
							getPicture: () => getSyncState().teamTableRows[index][column],
							event,
							index,
							column,
						}),
						endPictureDragFromTable: (event: DragEvent) => endPictureDragFromTable({
							getTableDragLandedInAnotherCell: () => (
								getSyncState().tableDragLandedInAnotherCell
							),
							setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => (
								setState({ tableDragLandedInAnotherCell })
							),
							setPicture: (picture) => mutateState((state) => {
								state.teamTableRows[index][column] = picture
							}),
							event,
						}),
					} : null,
				})),

			// Badges cell, the fourth column, shown only once verified
			allowBadgeDropOnBadgesCell: (event: DragEvent) => allowBadgeDropOnBadgesCell({
				getIsFindingPlayers: () => getSyncState().isFindingPlayers,
				event,
			}),
			dropBadgeOnBadgesCell: (event: DragEvent) => dropBadgeOnBadgesCell({
				getBadgeNames: () => getSyncState().teamTableRows[index].badgeNames,
				setBadgeNames: (badgeNames) => mutateState((state) => {
					state.teamTableRows[index].badgeNames = badgeNames
				}),
				setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
					tableDragLandedInAnotherCell,
				}),
				event,
				index,
			}),

			// Badge names stacked in that cell, which drag to another row or out of the table
			badges: row.badgeNames.map((name) => ({
				name,
				draggable: !state.isFindingPlayers,
				dragBadgeFromTable: (event: DragEvent) => dragBadgeFromTable({
					event,
					index,
					name,
				}),
				endBadgeDragFromTable: (event: DragEvent) => endBadgeDragFromTable({
					getTableDragLandedInAnotherCell: () => getSyncState().tableDragLandedInAnotherCell,
					setTableDragLandedInAnotherCell: (tableDragLandedInAnotherCell) => setState({
						tableDragLandedInAnotherCell,
					}),
					getBadgeNames: () => getSyncState().teamTableRows[index].badgeNames,
					setBadgeNames: (badgeNames) => mutateState((state) => {
						state.teamTableRows[index].badgeNames = badgeNames
					}),
					event,
					name,
				}),
			})),

			// Last column: the Reserved checkbox, or while searching either "Finding player..."

			// or the grey reserved label
			showFindingPlayerText: state.isFindingPlayers && !row.isReserved && !row.isLeftEmpty,
			showReservedPlayerName: state.isFindingPlayers && row.isReserved,
			reservedPlayerName: state.verifiedRobloxAccount
				? `(@${state.verifiedRobloxAccount.username} or their friends)`
				: '(Reserved)',
			showReservedCheckbox: !state.isFindingPlayers,
			isReserved: row.isReserved,
			toggleRowReserved: (event: ChangeEvent<HTMLInputElement>) => toggleRowReserved({
				setIsReserved: (isReserved) => mutateState((state) => {
					state.teamTableRows[index].isReserved = isReserved
				}),
				event,
			}),
		})),

		// Header of the last table column
		lastColumnHeading: state.isFindingPlayers ? 'Player' : 'Reserved',


		// "Server link:" field below the table
		serverLinkFieldStartValue: state.serverLinkFieldStartValue,
		isServerLinkFieldLocked: state.isFindingPlayers,
		saveServerLinkField: (event: ChangeEvent<HTMLInputElement>) => saveServerLinkField({
			event,
		}),

		// "How do I get a server link?" link below the field, and the × of the screenshot window

		// that it opens
		openServerLinkHelpWindow,
		closeServerLinkHelpWindow,

		// Dandy Run and Early Dyle checkboxes in the left column of TEAM SETTINGS
		areDandyRunAndEarlyDyleCheckboxesLocked: state.isFindingPlayers,
		isDandyRunCheckboxChecked: state.isDandyRunCheckboxChecked,
		toggleDandyRunCheckbox: (event: ChangeEvent<HTMLInputElement>) => (
			toggleDandyRunOrEarlyDyleCheckbox({
				localStorageKey: 'dandyRun',
				setIsChecked: (isDandyRunCheckboxChecked) => setState({ isDandyRunCheckboxChecked }),
				event,
			})
		),
		isEarlyDyleCheckboxChecked: state.isEarlyDyleCheckboxChecked,
		toggleEarlyDyleCheckbox: (event: ChangeEvent<HTMLInputElement>) => (
			toggleDandyRunOrEarlyDyleCheckbox({
				localStorageKey: 'earlyDyle',
				setIsChecked: (isEarlyDyleCheckboxChecked) => setState({ isEarlyDyleCheckboxChecked }),
				event,
			})
		),

		// Region and Floor goal dropdowns in the right column of TEAM SETTINGS
		areRegionAndFloorGoalDropdownsLocked: state.isFindingPlayers,
		regionDropdownOptions: [
			'Any',
			'Africa',
			'Asia',
			'Europe',
			'North America',
			'South America',
			'Oceania',
		],
		chosenRegionDropdownOption: state.chosenRegionDropdownOption,
		chooseRegionDropdownOption: (event: ChangeEvent<HTMLSelectElement>) => (
			chooseRegionOrFloorGoalDropdownOption({
				localStorageKey: 'region',
				setChosenOption: (chosenRegionDropdownOption) => setState({
					chosenRegionDropdownOption,
				}),
				event,
			})
		),
		floorGoalDropdownOptions: [
			'10',
			'20',
			'25',
			'30',
			'40',
			'50',
			'60',
			'70',
			'80',
			'90',
			'100',
			'100+',
		],
		chosenFloorGoalDropdownOption: state.chosenFloorGoalDropdownOption,
		chooseFloorGoalDropdownOption: (event: ChangeEvent<HTMLSelectElement>) => (
			chooseRegionOrFloorGoalDropdownOption({
				localStorageKey: 'floorGoal',
				setChosenOption: (chosenFloorGoalDropdownOption) => setState({
					chosenFloorGoalDropdownOption,
				}),
				event,
			})
		),

		// Find Players button at the bottom right of Find a Team, with its spinner and the red

		// error line below it
		toggleFindingPlayers: (event: FormEvent<HTMLFormElement>) => toggleFindingPlayers({
			getTeamTableRows: () => getSyncState().teamTableRows,
			getIsFindingPlayers: () => getSyncState().isFindingPlayers,
			setIsFindingPlayers: (isFindingPlayers) => setState({ isFindingPlayers }),
			setFindPlayersError: (findPlayersError) => setState({ findPlayersError }),
			event,
		}),
		findPlayersButtonText: state.isFindingPlayers
			? 'Finding Players (Click to Cancel)'
			: 'Find Players',
		showFindingPlayersSpinner: state.isFindingPlayers,
		findPlayersError: state.findPlayersError,


		// Two counters at the bottom middle of the screen
		onThisPageCount: state.onThisPageCount,
		findingPlayersCount: state.findingPlayersCount,
	}
}
