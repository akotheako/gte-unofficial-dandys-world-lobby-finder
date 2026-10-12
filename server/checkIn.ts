import type { QueryResult } from '@neondatabase/serverless'
import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { badgeCategories } from '../shared/badgeCategories.ts'
import { browseTeamsJoinTableRows } from '../shared/browseTeamsJoinTableRows.ts'
import { robloxServerLinkPattern } from '../shared/robloxServerLinkPattern.ts'
import type {
	CheckInAnswer,
	ChosenSlot,
	MergedTeamSettings,
	PlayerInRow,
	ReservedFor,
	TeamTableRow,
} from '../shared/teamTypes.ts'
import { database } from './database.ts'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

type Team = {
	team_id: string
	invite_code: string
	// Empty for a host who did not verify. Upvotes go by the id, since a username can change.
	roblox_user_id: string
	roblox_username: string
	roblox_badge_names: string[]
	// Verified friends whom the host removed, whom the invite link no longer lets in
	removed_roblox_usernames: string[]
	// Pictures that the host's My Toons and My Trinkets windows mark as missing
	missing_toons: string[]
	missing_trinkets: string[]
	team_table_rows: TeamTableRow[]
	server_link: string
	dandy_run: string
	early_dyle: string
	region: string
	floor_goal: string
	is_searching: boolean
	// Random id of the search that the page started with its last click on Find Players
	search_id: string
	// Slot whose Join button the user clicked in Browse Teams, as the row of each search of the
	// chosen merged search in that slot. The search only merges with the merged search that one of
	// these searches is in, and the user only takes that slot there. Any search that is still
	// searching finds both, even after others left or the merged search merged into another one.
	// Empty for a search of Find a Team.
	chosen_slot: ChosenSlot
	joined_team_id: string | null
	// Slot of the host's merged team that each row of the table was paired with when the search
	// joined the host, which is a row index of the host's table, or -1 for a "(Leave Empty)" row.
	// Empty while the search has not joined a host.
	row_pairing: number[]
	// Status of the search's table as it was when every row of its merged team got a player, which
	// ends the search. The check-ins answer with it from then on, so that a page that only checks in
	// after other players of the team left still sees every player.
	found_status: {
		// Id of the found_teams record, the same on every search of the team
		foundTeamId: string
		teamServerLink: string
		hostRobloxUsername: string
		playersInRows: (PlayerInRow | null)[]
		hostRowIndex: number
		hasJoinedATeam: boolean
		// Absent from a status that an older version of the site saved
		teamSettings?: MergedTeamSettings
		slotRows?: TeamTableRow[]
	} | null
	started_at: Date
}

type VerifiedFriend = {
	page_id: string
	team_id: string
	roblox_user_id: string
	roblox_username: string
	badge_names: string[]
}

// Record of a team that got together, as the found_teams table stores it
export type FoundTeam = {
	serverLink: string
	// Absent from a record that an older version of the site saved
	dandyRun?: string
	earlyDyle?: string
	region: string
	floorGoal: string
	// One table for each search of the merged team, with its players in its rows
	tables: {
		teamId: string
		teamTableRows: TeamTableRow[]
		playersInRows: (PlayerInRow | null)[]
	}[]
	// The team that brought each verified player, and the host who invited them, which is empty
	// for a host
	verifiedPlayers: {
		robloxUserId: string
		robloxUsername: string
		invitedByRobloxUserId: string
		teamId: string
	}[]
}

// Verified friends who opened the team's invite link and whom the host did not remove
function verifiedFriendsOf({
	team,
	verifiedFriends,
}: {
	team: Team
	verifiedFriends: VerifiedFriend[]
}) {
	return verifiedFriends.filter((verifiedFriend) => (
		verifiedFriend.team_id === team.team_id
		&& !team.removed_roblox_usernames.includes(verifiedFriend.roblox_username)
	))
}

// Player whom a team brings, meaning the host, an unverified friend, or a verified friend who
// accepted their invite, with the rows that the team reserved for them
type TeamPlayer = {
	teamId: string
	playerInRow: PlayerInRow
	// Both empty for an unverified player, and the second one also for a host
	robloxUserId: string
	invitedByRobloxUserId: string
	isVerified: boolean
	// The player on the team's "Me" rows
	isHost: boolean
	badgeNames: string[]
	reservedRowIndexes: number[]
}

function playersOf({
	team,
	verifiedFriends,
}: {
	team: Team
	verifiedFriends: VerifiedFriend[]
}): TeamPlayer[] {
	const rows = team.team_table_rows
	const reservations = new Set(rows.flatMap((row) => (
		!row.isLeftEmpty && row.reservedFor ? [row.reservedFor] : []
	)))
	return [...reservations].flatMap((reservedFor) => {
		const player = (() => {
			if (reservedFor === 'me') {
				return {
					playerInRow: { robloxUsername: team.roblox_username },
					robloxUserId: team.roblox_user_id,
					invitedByRobloxUserId: '',
					isVerified: Boolean(team.roblox_username),
					isHost: true,
					badgeNames: team.roblox_badge_names,
				}
			}
			if (reservedFor.startsWith('unverifiedFriend:')) {
				return {
					playerInRow: { unverifiedFriendOf: team.roblox_username },
					robloxUserId: '',
					invitedByRobloxUserId: '',
					isVerified: false,
					isHost: false,
					badgeNames: [],
				}
			}
			const friend = verifiedFriendsOf({
				team,
				verifiedFriends,
			}).find((verifiedFriend) => (
				`verifiedFriend:${verifiedFriend.roblox_username}` === reservedFor
			))
			return friend
				? {
					playerInRow: { robloxUsername: friend.roblox_username },
					robloxUserId: friend.roblox_user_id,
					invitedByRobloxUserId: team.roblox_user_id,
					isVerified: true,
					isHost: false,
					badgeNames: friend.badge_names,
				}
				: null
		})()
		if (!player) return []
		return [{
			teamId: team.team_id,
			...player,
			reservedRowIndexes: rows.flatMap((row, index) => (
				!row.isLeftEmpty && row.reservedFor === reservedFor ? [index] : []
			)),
		}]
	})
}

// A merged team has one slot for each row of its host's table that is not "(Leave Empty)", and
// every search that joined the host paired each of its own rows with one of those slots when it
// joined. A slot holds one player, who has to fit the paired row of every table at once.

// Slot of the merged team that a row of a search's table belongs to, which is the host's row that
// it was paired with, or -1 for a "(Leave Empty)" row
function slotOfRow({
	team,
	host,
	rowIndex,
}: {
	team: Team
	host: Team
	rowIndex: number
}) {
	if (team.team_table_rows[rowIndex].isLeftEmpty) return -1
	return team.team_id === host.team_id ? rowIndex : team.row_pairing[rowIndex] ?? -1
}

// Rows of every table of the merged team that belong to the slot
function rowsInSlot({
	mergedTeam,
	host,
	slot,
}: {
	mergedTeam: Team[]
	host: Team
	slot: number
}) {
	return mergedTeam.flatMap((team) => team.team_table_rows.flatMap((row, rowIndex) => (
		slotOfRow({
			team,
			host,
			rowIndex,
		}) === slot
			? [{
				team,
				row,
				rowIndex,
			}]
			: []
	)))
}

// The row of every search of the merged team in the slot, which is what a Join button of that slot
// in Browse Teams sends
function chosenSlotOf({
	mergedTeam,
	host,
	slot,
}: {
	mergedTeam: Team[]
	host: Team
	slot: number
}): ChosenSlot {
	return rowsInSlot({
		mergedTeam,
		host,
		slot,
	}).map(({
		team,
		rowIndex,
	}) => ({
		teamId: team.team_id,
		rowIndex,
	}))
}

// Slot of the merged team that a Browse Teams join chose, found through the first of its chosen
// searches that is in the merged team, or -1 when none of them is
function chosenSlotIn({
	team,
	mergedTeam,
	host,
}: {
	team: Team
	mergedTeam: Team[]
	host: Team
}) {
	for (const {
		teamId,
		rowIndex,
	} of team.chosen_slot) {
		const chosenTeam = mergedTeam.find((other) => other.team_id === teamId)
		if (chosenTeam && chosenTeam.team_table_rows[rowIndex]) {
			return slotOfRow({
				team: chosenTeam,
				host,
				rowIndex,
			})
		}
	}
	return -1
}

// Whether rows of different tables can share a slot, which one player then has to fit: they ask for
// at most one toon and at most two trinkets between them
function canRowsShareSlot(rows: TeamTableRow[]) {
	const toons = new Set(rows.map((row) => row.toonPicture).filter(Boolean))
	const trinkets = new Set(rows.flatMap((row) => [row.trinketAPicture, row.trinketBPicture])
		.filter(Boolean))
	return toons.size <= 1 && trinkets.size <= 2
}

// What a slot asks for, made of every row that belongs to it: the toon that one of them asks for,
// every trinket, role and badge that they ask for, and "Verified only" when one of them has it.
// Badges only count on a "Verified only" row of a verified host, since only they can see the
// checkbox.
function slotRowOf(slotRows: {
	team: Team
	row: TeamTableRow
}[]): TeamTableRow {
	const rows = slotRows.map(({ row }) => row)
	const trinkets = [...new Set(rows.flatMap((row) => [row.trinketAPicture, row.trinketBPicture])
		.filter(Boolean))]
	const verifiedOnlyRows = slotRows.flatMap(({
		team,
		row,
	}) => (row.isVerifiedPlayerRequired && team.roblox_username ? [row] : []))
	return {
		toonPicture: rows.find((row) => row.toonPicture)?.toonPicture ?? '',
		trinketAPicture: trinkets[0] ?? '',
		trinketBPicture: trinkets[1] ?? '',
		badgeNames: [...new Set(verifiedOnlyRows.flatMap((row) => row.badgeNames))],
		roleNames: [...new Set(rows.flatMap((row) => row.roleNames))],
		isVerifiedPlayerRequired: verifiedOnlyRows.length > 0,
		reservedFor: '',
		isLeftEmpty: false,
	}
}

// Whether a player, whose own table asks for playerRow in the slot, fits the row of another table
// in that slot. An empty Toon or Trinket cell means "(Any)" on both sides, and a host never takes a
// row that asks for a picture that they marked as missing.
function doesPlayerFitRow({
	player,
	playerTeam,
	playerRow,
	row,
	rowTeam,
}: {
	player: TeamPlayer
	playerTeam: Team
	playerRow: TeamTableRow
	row: TeamTableRow
	rowTeam: Team
}) {
	// Only the host's own page knows which pictures they own, so a friend can be any picture
	const playerMissingToons = player.isHost ? playerTeam.missing_toons : []
	const playerMissingTrinkets = player.isHost ? playerTeam.missing_trinkets : []
	const playerTrinkets = [playerRow.trinketAPicture, playerRow.trinketBPicture].filter(Boolean)
	const requiredTrinkets = [row.trinketAPicture, row.trinketBPicture].filter(Boolean)
	const missingTrinkets = requiredTrinkets.filter((trinket) => !playerTrinkets.includes(trinket))
	return (!row.toonPicture
		|| ((row.toonPicture === playerRow.toonPicture || !playerRow.toonPicture)
			&& !playerMissingToons.includes(row.toonPicture)))
		// A player's empty trinket slot can take any trinket that the row asks for
		&& missingTrinkets.length <= 2 - playerTrinkets.length
		&& requiredTrinkets.every((trinket) => !playerMissingTrinkets.includes(trinket))
		&& row.roleNames.every((role) => playerRow.roleNames.includes(role))
		// Badges only count for a verified player, since nobody can confirm the badges of an
		// unverified one. A harder badge of the same category also counts, such as Marathon Runner
		// for Speed Walker. "Verified only" counts only for a team whose host is verified, since
		// only they can see the checkbox.
		&& (!row.isVerifiedPlayerRequired
			|| !rowTeam.roblox_username
			|| (player.isVerified && row.badgeNames.every((wanted) => {
				const category = badgeCategories.find((names) => names.includes(wanted)) ?? [wanted]
				return player.badgeNames.some((owned) => (
					category.indexOf(owned) >= category.indexOf(wanted)
				))
			})))
}

// Puts every player of the merged team into a different slot, indexed by the host's rows, or
// returns null when they cannot all fit. A player only takes a slot whose row in their own table
// is reserved for them, and has to fit the rows of every other table in that slot.
function placePlayersInSlots({
	host,
	mergedTeam,
	players,
}: {
	host: Team
	mergedTeam: Team[]
	players: TeamPlayer[]
}) {
	const slotRowsBySlot = host.team_table_rows.map((_row, slot) => rowsInSlot({
		mergedTeam,
		host,
		slot,
	}))
	const playersInSlots: (TeamPlayer | null)[] = host.team_table_rows.map(() => null)
	const canTakeSlot = ({
		player,
		slot,
	}: {
		player: TeamPlayer
		slot: number
	}) => {
		if (host.team_table_rows[slot].isLeftEmpty || playersInSlots[slot]) return false
		const playerTeam = mergedTeam.find((team) => team.team_id === player.teamId)
		if (!playerTeam) return false
		// A user who clicked Join on a slot in Browse Teams takes only that slot
		const chosenSlot = chosenSlotIn({
			team: playerTeam,
			mergedTeam,
			host,
		})
		if (player.isHost && chosenSlot !== -1 && chosenSlot !== slot) return false
		const ownSlotRow = slotRowsBySlot[slot].find(({ team }) => team === playerTeam)
		return Boolean(ownSlotRow)
			&& player.reservedRowIndexes.includes(ownSlotRow!.rowIndex)
			&& slotRowsBySlot[slot].every((slotRow) => slotRow === ownSlotRow || doesPlayerFitRow({
				player,
				playerTeam,
				playerRow: ownSlotRow!.row,
				row: slotRow.row,
				rowTeam: slotRow.team,
			}))
	}
	const placePlayer = (playerIndex: number): boolean => {
		if (playerIndex === players.length) return true
		for (const slot of host.team_table_rows.keys()) {
			if (!canTakeSlot({
				player: players[playerIndex],
				slot,
			})) continue
			playersInSlots[slot] = players[playerIndex]
			if (placePlayer(playerIndex + 1)) return true
			playersInSlots[slot] = null
		}
		return false
	}
	return placePlayer(0) ? playersInSlots : null
}

// What the slot of each row of one table of the merged team asks for, with the table's own
// "(Leave Empty)" rows as they are
function slotRowsOfTable({
	team,
	host,
	mergedTeam,
}: {
	team: Team
	host: Team
	mergedTeam: Team[]
}) {
	return team.team_table_rows.map((row, rowIndex) => (row.isLeftEmpty ? row : slotRowOf(rowsInSlot({
		mergedTeam,
		host,
		slot: slotOfRow({
			team,
			host,
			rowIndex,
		}),
	}))))
}

// Players of the slots in the rows of one table of the merged team
function playersInRowsOf({
	team,
	host,
	playersInSlots,
}: {
	team: Team
	host: Team
	playersInSlots: (TeamPlayer | null)[]
}) {
	return team.team_table_rows.map((_row, rowIndex) => playersInSlots[slotOfRow({
		team,
		host,
		rowIndex,
	})] ?? null)
}

// Merges two merged searches, where a single search counts as a merged search of its own. Pairs
// each slot of the joining merged search with a different slot of the host's merged search, so
// that the rows of every slot can share it and every player of both fits a slot. Returns the new
// row pairing of every search of the joining merged search, or null when no pairing works. The
// slots that a joining slot asks the least new things of come first, and among those the slots
// without a seated player, which leaves later searches the most room. A closed tab keeps its search
// for up to 90 seconds, so the same verified player can search twice, and must not end up twice in
// one team.
function pairMergedSearches({
	host,
	mergedTeam,
	joiningHost,
	joiningMergedTeam,
	players,
}: {
	host: Team
	mergedTeam: Team[]
	joiningHost: Team
	joiningMergedTeam: Team[]
	players: TeamPlayer[]
}) {
	const verifiedUsernames = players.flatMap(({ playerInRow }) => (
		'robloxUsername' in playerInRow && playerInRow.robloxUsername
			? [playerInRow.robloxUsername]
			: []
	))
	if (new Set(verifiedUsernames).size !== verifiedUsernames.length) return null
	const slotsOf = (team: Team) => [...team.team_table_rows.keys()].filter((slot) => (
		!team.team_table_rows[slot].isLeftEmpty
	))
	const slots = slotsOf(host)
	const joiningSlots = slotsOf(joiningHost)
	if (slots.length !== joiningSlots.length) return null
	const slotRowsBySlot = new Map(slots.map((slot) => [slot, rowsInSlot({
		mergedTeam,
		host,
		slot,
	})]))
	const joiningSlotRowsBySlot = new Map(joiningSlots.map((joiningSlot) => [joiningSlot, rowsInSlot({
		mergedTeam: joiningMergedTeam,
		host: joiningHost,
		slot: joiningSlot,
	})]))
	// Slots whose player already sits in them. A free slot can still go to the own player of a
	// later search, who can then play what it asks for, so new requirements go to free slots first.
	const playersInCurrentSlots = placePlayersInSlots({
		host,
		mergedTeam,
		players: players.filter((player) => mergedTeam.some((team) => team.team_id === player.teamId)),
	})
	const seatedSlots = new Set(slots.filter((slot) => playersInCurrentSlots?.[slot]))
	// Slot of the host's merged search that each slot of the joining merged search is paired with
	const pairing = new Map<number, number>()
	const takenSlots = new Set<number>()
	// Number of things that the joining slot asks for and that the slot does not ask for yet
	const newRequirementCountOf = ({
		joiningSlot,
		slot,
	}: {
		joiningSlot: number
		slot: number
	}) => {
		const joiningSlotRow = slotRowOf(joiningSlotRowsBySlot.get(joiningSlot)!)
		const slotRow = slotRowOf(slotRowsBySlot.get(slot)!)
		return Number(Boolean(joiningSlotRow.toonPicture) && !slotRow.toonPicture)
			+ [
				joiningSlotRow.trinketAPicture,
				joiningSlotRow.trinketBPicture,
				...joiningSlotRow.roleNames,
			].filter((name) => (
				name && ![slotRow.trinketAPicture, slotRow.trinketBPicture, ...slotRow.roleNames]
					.includes(name)
			)).length
	}
	// Row pairing of every search of the joining merged search, with its rows in the slots that
	// their joining slots are paired with
	const rowPairingsOf = () => new Map(joiningMergedTeam.map((team) => [
		team.team_id,
		team.team_table_rows.map((_row, rowIndex) => pairing.get(slotOfRow({
			team,
			host: joiningHost,
			rowIndex,
		})) ?? -1),
	]))
	const contentsOf = (slotRows: ReturnType<typeof rowsInSlot>) => JSON.stringify(slotRows
		.map(({
			team,
			row,
		}) => [team.team_id, row]))
	const pairSlot = (joiningSlotNumber: number): Map<string, number[]> | null => {
		if (joiningSlotNumber === joiningSlots.length) {
			const rowPairings = rowPairingsOf()
			return placePlayersInSlots({
				host,
				mergedTeam: [
					...mergedTeam,
					...joiningMergedTeam.map((team) => ({
						...team,
						row_pairing: rowPairings.get(team.team_id)!,
					})),
				],
				players,
			}) ? rowPairings : null
		}
		const joiningSlot = joiningSlots[joiningSlotNumber]
		const joiningSlotRows = joiningSlotRowsBySlot.get(joiningSlot)!
		const previousJoiningSlot = joiningSlots[joiningSlotNumber - 1]
		// Two equal joining slots in a row would only try the same pairings in another order
		const isSameAsPreviousJoiningSlot = previousJoiningSlot !== undefined
			&& contentsOf(joiningSlotRowsBySlot.get(previousJoiningSlot)!) === contentsOf(joiningSlotRows)
		// Two slots with equal rows would give the same result
		const triedSlotContents = new Set<string>()
		const candidateSlots = slots
			.filter((slot) => !takenSlots.has(slot)
				&& !(isSameAsPreviousJoiningSlot && slot < pairing.get(previousJoiningSlot)!)
				&& canRowsShareSlot([...slotRowsBySlot.get(slot)!, ...joiningSlotRows]
					.map(({ row }) => row)))
			.sort((a, b) => {
				const newRequirementCountA = newRequirementCountOf({
					joiningSlot,
					slot: a,
				})
				const newRequirementCountB = newRequirementCountOf({
					joiningSlot,
					slot: b,
				})
				if (newRequirementCountA !== newRequirementCountB) {
					return newRequirementCountA - newRequirementCountB
				}
				// A joining slot that asks for nothing new can go anywhere
				if (!newRequirementCountA) return 0
				return Number(seatedSlots.has(a)) - Number(seatedSlots.has(b))
			})
		for (const slot of candidateSlots) {
			// The slot whose Join button a user of the joining merged search clicked in Browse Teams
			// differs from the others
			const isChosenSlot = joiningMergedTeam.some((team) => chosenSlotIn({
				team,
				mergedTeam,
				host,
			}) === slot)
			const slotContents = JSON.stringify([isChosenSlot, contentsOf(slotRowsBySlot.get(slot)!)])
			if (triedSlotContents.has(slotContents)) continue
			triedSlotContents.add(slotContents)
			pairing.set(joiningSlot, slot)
			takenSlots.add(slot)
			const result = pairSlot(joiningSlotNumber + 1)
			if (result) return result
			takenSlots.delete(slot)
			pairing.delete(joiningSlot)
		}
		return null
	}
	return pairSlot(0)
}

type TeamSettings = Pick<Team, 'dandy_run' | 'early_dyle' | 'region' | 'floor_goal'>

// A floor goal reads "40 to 60", and "100+" counts as floor 101
function floorGoalRangeOf(floorGoal: string) {
	const [fromOption, toOption = fromOption] = floorGoal.split(' to ')
	const floorOf = (option: string) => parseInt(option) + (option.endsWith('+') ? 1 : 0)
	return {
		fromOption,
		toOption,
		from: floorOf(fromOption),
		to: floorOf(toOption),
	}
}

// TEAM SETTINGS of a merged team, which hold the most specific choice of its searches, so that a
// search that joins has to agree with every search of the team and not only with its host. Yes or
// No wins over Any, a region wins over Any, and the floor goal is the floors that every range
// shares. The merges keep the searches in agreement, so no two of them choose differently.
function mergedTeamSettingsOf(mergedTeam: TeamSettings[]): TeamSettings {
	const mostSpecificChoiceOf = (choices: string[]) => (
		choices.find((choice) => choice !== 'Any') ?? 'Any'
	)
	const floorGoalRanges = mergedTeam.map((team) => floorGoalRangeOf(team.floor_goal))
	const highestFrom = floorGoalRanges.reduce((a, b) => (b.from > a.from ? b : a))
	const lowestTo = floorGoalRanges.reduce((a, b) => (b.to < a.to ? b : a))
	return {
		dandy_run: mostSpecificChoiceOf(mergedTeam.map((team) => team.dandy_run)),
		early_dyle: mostSpecificChoiceOf(mergedTeam.map((team) => team.early_dyle)),
		region: mostSpecificChoiceOf(mergedTeam.map((team) => team.region)),
		floor_goal: `${highestFrom.fromOption} to ${lowestTo.toOption}`,
	}
}

// TEAM SETTINGS on which two searches disagree, as the server log names them. Any agrees with
// every choice, and two floor goals agree when their ranges share at least one floor.
function teamSettingsDifferences({
	teamA,
	teamB,
}: {
	teamA: TeamSettings
	teamB: TeamSettings
}) {
	const floorGoalA = floorGoalRangeOf(teamA.floor_goal)
	const floorGoalB = floorGoalRangeOf(teamB.floor_goal)
	return [
		teamA.dandy_run !== 'Any' && teamB.dandy_run !== 'Any'
			&& teamA.dandy_run !== teamB.dandy_run && 'Dandy Run differs',
		teamA.early_dyle !== 'Any' && teamB.early_dyle !== 'Any'
			&& teamA.early_dyle !== teamB.early_dyle && 'Early Dyle differs',
		(floorGoalA.from > floorGoalB.to || floorGoalB.from > floorGoalA.to)
			&& `floor goals ${teamA.floor_goal} and ${teamB.floor_goal} share no floor`,
		teamA.region !== 'Any' && teamB.region !== 'Any' && teamA.region !== teamB.region
			&& 'Region differs',
	].filter((difference) => typeof difference === 'string')
}

// Every open page checks in under its random page id every few seconds. The check-in counts the
// open pages, keeps the page's team on the server once its invite link was copied or while it
// searches, lets a page that opened an invite link join the inviting team, and merges searches
// that fit each other. A merged team is a host and the searches that joined it, and every player
// of it has to fit a row of every table in it, so every search gets what it asked for. Every
// player gets the host's server link once every row has a player, which ends the searches of the
// team.
export const checkIn = new Hono()

// The tables are created on the first request, so a new database needs no setup step
let tablesAreCreated: Promise<unknown> | undefined
checkIn.use(async (_c, next) => {
	tablesAreCreated ??= database.query(`
		CREATE TABLE IF NOT EXISTS open_pages (
			page_id text PRIMARY KEY,
			last_seen_at timestamptz NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS teams (
			team_id text PRIMARY KEY,
			invite_code text NOT NULL UNIQUE,
			roblox_username text NOT NULL,
			team_table_rows jsonb NOT NULL,
			server_link text NOT NULL,
			dandy_run text NOT NULL,
			early_dyle text NOT NULL,
			region text NOT NULL,
			floor_goal text NOT NULL,
			is_searching boolean NOT NULL,
			joined_team_id text,
			started_at timestamptz NOT NULL DEFAULT now()
		);
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS roblox_badge_names jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS removed_roblox_usernames jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS missing_toons jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS missing_trinkets jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams DROP COLUMN IF EXISTS verified_friend_ids;
		CREATE TABLE IF NOT EXISTS verified_friends (
			page_id text PRIMARY KEY,
			team_id text NOT NULL,
			roblox_username text NOT NULL,
			badge_names jsonb NOT NULL
		);
		ALTER TABLE verified_friends DROP COLUMN IF EXISTS friend_id;
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS roblox_user_id text NOT NULL DEFAULT '';
		ALTER TABLE verified_friends ADD COLUMN IF NOT EXISTS roblox_user_id text NOT NULL DEFAULT '';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS search_id text NOT NULL DEFAULT '';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS found_status jsonb;
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS dandy_run text NOT NULL DEFAULT 'Any';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS early_dyle text NOT NULL DEFAULT 'Any';
		ALTER TABLE teams DROP COLUMN IF EXISTS is_dandy_run;
		ALTER TABLE teams DROP COLUMN IF EXISTS is_early_dyle;
		ALTER TABLE teams DROP COLUMN IF EXISTS chosen_host_team_id;
		ALTER TABLE teams DROP COLUMN IF EXISTS chosen_host_row_index;
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS chosen_slot jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS row_pairing jsonb NOT NULL DEFAULT '[]';
		-- Record of every team that got together, which Upvote Players shows
		CREATE TABLE IF NOT EXISTS found_teams (
			found_team_id text PRIMARY KEY,
			found_at timestamptz NOT NULL DEFAULT now(),
			roblox_user_ids jsonb NOT NULL,
			found_team jsonb NOT NULL
		);
		ALTER TABLE found_teams DROP COLUMN IF EXISTS page_ids;
		-- Same table as in upvotes.ts, since matching counts the upvotes of every searching player
		-- before anyone may have upvoted
		CREATE TABLE IF NOT EXISTS upvotes (
			voter_roblox_user_id text NOT NULL,
			receiver_roblox_user_id text NOT NULL,
			upvoted_at timestamptz NOT NULL DEFAULT now(),
			PRIMARY KEY (voter_roblox_user_id, receiver_roblox_user_id)
		);
		CREATE INDEX IF NOT EXISTS upvotes_receiver ON upvotes (receiver_roblox_user_id);
		DROP TABLE IF EXISTS invited_friends;
		DROP TABLE IF EXISTS searching_teams;
	`).catch((error) => {
		tablesAreCreated = undefined
		throw error
	})
	await tablesAreCreated
	await next()
})

checkIn.post('/', async (c) => {
	const body = await c.req.json<{
		pageId: string
		// The page's own table, sent once its invite link was copied or while it searches
		team: {
			teamTableRows: TeamTableRow[]
			removedRobloxUsernames: string[]
			// Absent from a page that still runs an older version of the site
			missingToons?: string[]
			missingTrinkets?: string[]
			inviteCode: string
			serverLink: string
			// Absent from a page that still runs an older version of the site
			dandyRun?: string
			earlyDyle?: string
			region: string
			floorGoal: string
			isFindingPlayers: boolean
			searchId: string
			// Absent from a page that still runs an older version of the site
			chosenSlot?: ChosenSlot
		} | null
		// The invite link that the page was opened with
		invite: { inviteCode: string } | null
		// The user's slot and TEAM SETTINGS while Browse Teams is open, which pick the teams that it
		// lists. Absent from a page that still runs an older version of the site.
		browse?: {
			toonPicture: string
			trinketAPicture: string
			trinketBPicture: string
			roleNames: string[]
			missingToons: string[]
			missingTrinkets: string[]
			dandyRun: string
			earlyDyle: string
			region: string
			floorGoal: string
			playersFrom: number
			playersTo: number
			browsedTeamCount: number
		} | null
	}>()
	const pageId = String(body.pageId)
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	const robloxAccount = cookie
		? JSON.parse(cookie) as {
			id: number
			username: string
			badges?: {
				name: string
				owned: boolean
			}[]
		}
		: null
	// The signed cookie holds the badges that the server read from Roblox, which the user cannot
	// change, so only those count as the user's own
	const ownedBadgeNames = (robloxAccount?.badges ?? [])
		.filter((badge) => badge.owned)
		.map((badge) => badge.name)
	let error = ''
	let isVerificationNeededToJoin = false

	const client = await database.connect()
	// Every round trip to the database waits for the one before, so a check-in makes only two: one
	// that reads everything, and one that writes every change. A query with several statements
	// cannot take separate parameters, so the values go into its text through escapeLiteral.
	const sqlLiteral = (value: unknown) => client.escapeLiteral(
		typeof value === 'string' ? value : JSON.stringify(value),
	)
	const writes: string[] = []
	const checkInStartedAt = Date.now()
	try {
		// Check-ins run one at a time across every server, so two searches never take one row.
		// Browsers run the timers of a hidden tab only once a minute, and players switch to Roblox
		// while they wait, so a page only counts as gone after 90 silent seconds.
		const readResults = await client.query(`
			BEGIN;
			SELECT pg_advisory_xact_lock(1);
			INSERT INTO open_pages (page_id) VALUES (${sqlLiteral(pageId)})
			ON CONFLICT (page_id) DO UPDATE SET last_seen_at = now();
			DELETE FROM open_pages WHERE last_seen_at < now() - interval '90 seconds';
			DELETE FROM teams WHERE team_id NOT IN (SELECT page_id FROM open_pages);
			DELETE FROM verified_friends WHERE page_id NOT IN (SELECT page_id FROM open_pages);
			SELECT
				now() AS "transactionTime",
				count(*)::int AS "onThisPageCount",
				(extract(epoch FROM clock_timestamp() - now()) * 1000)::int AS "lockWaitMs"
			FROM open_pages;
			SELECT * FROM teams ORDER BY started_at;
			SELECT * FROM verified_friends;
			SELECT receiver_roblox_user_id AS "robloxUserId", count(*)::int AS "upvoteCount"
			FROM upvotes
			WHERE receiver_roblox_user_id IN (
				SELECT roblox_user_id FROM teams
				UNION SELECT roblox_user_id FROM verified_friends
				UNION SELECT ${sqlLiteral(robloxAccount ? String(robloxAccount.id) : '')}
			)
			GROUP BY receiver_roblox_user_id;
		`) as unknown as QueryResult[]
		const [
			{ rows: [{
				transactionTime,
				onThisPageCount,
				lockWaitMs,
			}] },
			{ rows: teams },
			{ rows: verifiedFriends },
			{ rows: upvoteCounts },
		] = readResults.slice(-4) as [
			QueryResult<{
				transactionTime: Date
				onThisPageCount: number
				lockWaitMs: number
			}>,
			QueryResult<Team>,
			QueryResult<VerifiedFriend>,
			QueryResult<{
				robloxUserId: string
				upvoteCount: number
			}>,
		]

		const sentTeam = body.team
		const serverLink = String(sentTeam?.serverLink ?? '').trim()
		if (sentTeam?.isFindingPlayers && serverLink && !robloxServerLinkPattern.test(serverLink)) {
			error = 'The server link is invalid!'
		}
		const savedTeamIndex = teams.findIndex((team) => team.team_id === pageId)
		const savedTeam = teams[savedTeamIndex]
		const searchId = String(sentTeam?.searchId ?? '')
		if (!sentTeam || error) {
			if (savedTeamIndex !== -1) teams.splice(savedTeamIndex, 1)
			writes.push(`DELETE FROM teams WHERE team_id = ${sqlLiteral(pageId)}`)
		// A running search keeps the team that it joined, its place in the queue and whether it was
		// found, since the table cannot change while it runs. A page that closes "Team found!" and
		// clicks Find Players again before its next check-in sends a new search id.
		} else if (
			savedTeam?.search_id !== searchId
			|| !savedTeam.is_searching
			|| !sentTeam.isFindingPlayers
		) {
			const team: Team = {
				team_id: pageId,
				invite_code: String(sentTeam.inviteCode),
				roblox_user_id: robloxAccount ? String(robloxAccount.id) : '',
				roblox_username: robloxAccount?.username ?? '',
				roblox_badge_names: ownedBadgeNames,
				removed_roblox_usernames: sentTeam.removedRobloxUsernames.slice(0, 100).map(String),
				missing_toons: (sentTeam.missingToons ?? []).slice(0, 200).map(String),
				missing_trinkets: (sentTeam.missingTrinkets ?? []).slice(0, 200).map(String),
				// Only the fields that matching reads are stored, since other players see them
				team_table_rows: sentTeam.teamTableRows.slice(0, 8).map((row): TeamTableRow => {
					const reservedFor = String(row.reservedFor)
					const isKnownReservation = reservedFor === 'me'
						|| /^unverifiedFriend:\d+$/.test(reservedFor)
						|| reservedFor.startsWith('verifiedFriend:')
					return {
						toonPicture: String(row.toonPicture),
						trinketAPicture: String(row.trinketAPicture),
						trinketBPicture: String(row.trinketBPicture),
						badgeNames: row.badgeNames.map(String),
						roleNames: row.roleNames.map(String),
						isVerifiedPlayerRequired: Boolean(row.isVerifiedPlayerRequired),
						reservedFor: isKnownReservation ? reservedFor as ReservedFor : '',
						isLeftEmpty: Boolean(row.isLeftEmpty),
					}
				}),
				server_link: serverLink,
				dandy_run: String(sentTeam.dandyRun ?? 'Any'),
				early_dyle: String(sentTeam.earlyDyle ?? 'Any'),
				region: String(sentTeam.region),
				floor_goal: String(sentTeam.floorGoal),
				is_searching: Boolean(sentTeam.isFindingPlayers),
				search_id: searchId,
				// A merged search has at most one search for each of its 8 slots
				chosen_slot: (sentTeam.chosenSlot ?? []).slice(0, 8).flatMap((chosenRow) => (
					Number.isInteger(chosenRow.rowIndex) ? [{
						teamId: String(chosenRow.teamId),
						rowIndex: Number(chosenRow.rowIndex),
					}] : []
				)),
				joined_team_id: null,
				row_pairing: [],
				found_status: null,
				// now() is the time at which the transaction started, in both round trips
				started_at: transactionTime,
			}
			// The list stays ordered by started_at, and this team is the newest
			if (savedTeamIndex !== -1) teams.splice(savedTeamIndex, 1)
			teams.push(team)
			writes.push(`
				INSERT INTO teams (
					team_id,
					invite_code,
					roblox_user_id,
					roblox_username,
					roblox_badge_names,
					removed_roblox_usernames,
					missing_toons,
					missing_trinkets,
					team_table_rows,
					server_link,
					dandy_run,
					early_dyle,
					region,
					floor_goal,
					is_searching,
					search_id,
					chosen_slot
				)
				VALUES (
					${sqlLiteral(team.team_id)},
					${sqlLiteral(team.invite_code)},
					${sqlLiteral(team.roblox_user_id)},
					${sqlLiteral(team.roblox_username)},
					${sqlLiteral(team.roblox_badge_names)},
					${sqlLiteral(team.removed_roblox_usernames)},
					${sqlLiteral(team.missing_toons)},
					${sqlLiteral(team.missing_trinkets)},
					${sqlLiteral(team.team_table_rows)},
					${sqlLiteral(team.server_link)},
					${sqlLiteral(team.dandy_run)},
					${sqlLiteral(team.early_dyle)},
					${sqlLiteral(team.region)},
					${sqlLiteral(team.floor_goal)},
					${team.is_searching},
					${sqlLiteral(team.search_id)},
					${sqlLiteral(team.chosen_slot)}
				)
				ON CONFLICT (team_id) DO UPDATE SET
					invite_code = excluded.invite_code,
					roblox_user_id = excluded.roblox_user_id,
					roblox_username = excluded.roblox_username,
					roblox_badge_names = excluded.roblox_badge_names,
					removed_roblox_usernames = excluded.removed_roblox_usernames,
					missing_toons = excluded.missing_toons,
					missing_trinkets = excluded.missing_trinkets,
					team_table_rows = excluded.team_table_rows,
					server_link = excluded.server_link,
					dandy_run = excluded.dandy_run,
					early_dyle = excluded.early_dyle,
					region = excluded.region,
					floor_goal = excluded.floor_goal,
					is_searching = excluded.is_searching,
					search_id = excluded.search_id,
					chosen_slot = excluded.chosen_slot,
					joined_team_id = NULL,
					row_pairing = '[]',
					found_status = NULL,
					started_at = now()
			`)
		}

		let invitingTeamId: string | null = null
		if (body.invite) {
			const inviteCode = String(body.invite.inviteCode)
			const invitingTeam = teams.find((team) => team.invite_code === inviteCode)
			const friendsInTeam = verifiedFriends.filter((friend) => (
				friend.team_id === invitingTeam?.team_id
			))
			const hasJoined = friendsInTeam.some((friend) => friend.page_id === pageId)
			if (!invitingTeam) {
				error = 'This invite link expired'
			} else if (!robloxAccount) {
				isVerificationNeededToJoin = true
			} else if (
				invitingTeam.team_id === pageId
				// The host's account in another tab
				|| invitingTeam.roblox_username === robloxAccount.username
			) {
				error = 'This invite link is for your friends, send it to them'
			} else if (invitingTeam.removed_roblox_usernames.includes(robloxAccount.username)) {
				error = 'The host took you out of the team'
			} else if (friendsInTeam.some((friend) => (
				friend.page_id !== pageId && friend.roblox_username === robloxAccount.username
			))) {
				error = 'You already joined this team in another tab'
			} else if (!hasJoined && invitingTeam.is_searching) {
				error = 'The team already started finding players'
			} else {
				const friend: VerifiedFriend = {
					page_id: pageId,
					team_id: invitingTeam.team_id,
					roblox_user_id: String(robloxAccount.id),
					roblox_username: robloxAccount.username,
					badge_names: ownedBadgeNames,
				}
				const savedFriendIndex = verifiedFriends.findIndex((other) => other.page_id === pageId)
				if (savedFriendIndex !== -1) verifiedFriends.splice(savedFriendIndex, 1)
				verifiedFriends.push(friend)
				writes.push(`
					INSERT INTO verified_friends (
						page_id,
						team_id,
						roblox_user_id,
						roblox_username,
						badge_names
					)
					VALUES (
						${sqlLiteral(friend.page_id)},
						${sqlLiteral(friend.team_id)},
						${sqlLiteral(friend.roblox_user_id)},
						${sqlLiteral(friend.roblox_username)},
						${sqlLiteral(friend.badge_names)}
					)
					ON CONFLICT (page_id) DO UPDATE SET
						team_id = excluded.team_id,
						roblox_user_id = excluded.roblox_user_id,
						roblox_username = excluded.roblox_username,
						badge_names = excluded.badge_names
				`)
				invitingTeamId = invitingTeam.team_id
			}
		}
		if (!invitingTeamId) {
			const savedFriendIndex = verifiedFriends.findIndex((friend) => friend.page_id === pageId)
			if (savedFriendIndex !== -1) verifiedFriends.splice(savedFriendIndex, 1)
			writes.push(`DELETE FROM verified_friends WHERE page_id = ${sqlLiteral(pageId)}`)
		}

		const teamsById = new Map(teams.map((team) => [team.team_id, team]))
		const changedTeams = new Set<Team>()

		// A found search leaves its merged search once the host started a new search, and stays
		// found
		for (const team of teams) {
			if (!team.joined_team_id || !team.found_status) continue
			const host = teamsById.get(team.joined_team_id)
			if (host?.found_status?.foundTeamId === team.found_status.foundTeamId) continue
			team.joined_team_id = null
			team.row_pairing = []
			changedTeams.add(team)
		}
		// When the host of a merged search, whose rows number its slots, leaves or stops searching,
		// only its own wishes leave with it. The oldest search that is left becomes the host, and
		// every search keeps its slots under the new host's numbering.
		const formerHostIds = new Set(teams.flatMap((team) => (
			team.joined_team_id && !teamsById.get(team.joined_team_id)?.is_searching
				? [team.joined_team_id]
				: []
		)))
		for (const formerHostId of formerHostIds) {
			// The teams are ordered by the time at which their search started
			const remainingTeams = teams.filter((team) => team.joined_team_id === formerHostId)
			const newHost = remainingTeams[0]
			// The new host's row in each slot of the former host's numbering
			const newHostRowIndexOfSlot = new Map(newHost.row_pairing.map((slot, rowIndex) => [
				slot,
				rowIndex,
			]))
			for (const team of remainingTeams) {
				team.joined_team_id = team === newHost ? null : newHost.team_id
				team.row_pairing = team === newHost ? [] : team.row_pairing.map((slot) => (
					slot === -1 ? -1 : newHostRowIndexOfSlot.get(slot) ?? -1
				))
				changedTeams.add(team)
			}
		}
		// The host and every search that joined it
		const mergedTeamOf = (host: Team) => teams.filter((team) => (
			team === host || (team.is_searching && team.joined_team_id === host.team_id)
		))
		const allPlayersOf = (mergedTeam: Team[]) => mergedTeam.flatMap((team) => playersOf({
			team,
			verifiedFriends,
		}))

		const myTeam = teamsById.get(pageId)
		// Host of the merged search that a Browse Teams join chose, found through the first of its
		// chosen searches that still searches, which is in that merged search even after the merged
		// search merged into another one
		const chosenHostOf = (team: Team) => {
			for (const { teamId } of team.chosen_slot) {
				const chosenTeam = teamsById.get(teamId)
				if (!chosenTeam?.is_searching || chosenTeam.found_status) continue
				return chosenTeam.joined_team_id ? teamsById.get(chosenTeam.joined_team_id) : chosenTeam
			}
			return undefined
		}
		// Host of the merged search that the page's own search is in, which is the search itself
		// while it has not merged
		const myHost = myTeam?.joined_team_id ? teamsById.get(myTeam.joined_team_id) : myTeam
		if (
			myTeam?.is_searching
			&& !myTeam.found_status
			&& myHost?.is_searching
			&& !myHost.found_status
		) {
			const chosenHost = chosenHostOf(myTeam)
			// A Browse Teams join that already merged stays in its merged search
			if (myTeam.chosen_slot.length && !myTeam.joined_team_id && !chosenHost) {
				error = 'This team stopped searching or filled up'
			}
			// The chosen slot follows the searches that are in the chosen merged search now, so that
			// it is found again after every search that the user saw left
			if (chosenHost) {
				const chosenMergedTeam = mergedTeamOf(chosenHost).filter((team) => team !== myTeam)
				const slot = chosenSlotIn({
					team: myTeam,
					mergedTeam: chosenMergedTeam,
					host: chosenHost,
				})
				const chosenSlot = slot === -1 ? myTeam.chosen_slot : chosenSlotOf({
					mergedTeam: chosenMergedTeam,
					host: chosenHost,
					slot,
				})
				if (JSON.stringify(chosenSlot) !== JSON.stringify(myTeam.chosen_slot)) {
					myTeam.chosen_slot = chosenSlot
					changedTeams.add(myTeam)
				}
			}
			// Search as the server log names it, such as "@name (1a2b3c4d)", with the start of its
			// page id, since a host who did not verify has no name
			const logNameOf = (team: Team) => (
				`${team.roblox_username ? `@${team.roblox_username}` : 'unverified host'} (${
					team.team_id.slice(0, 8)
				})`
			)
			// Upvote level of a search together with the searches that joined it, which is
			// log2(average upvotes + 1), so that 0 against 10 upvotes is a wide gap and 490 against
			// 500 a narrow one. An unverified player counts as 0 upvotes.
			const upvoteLevelOf = (host: Team) => {
				const players = allPlayersOf(mergedTeamOf(host))
				const upvoteSum = players.reduce((sum, player) => sum + (upvoteCounts.find((upvoteCount) => (
					upvoteCount.robloxUserId === player.robloxUserId
				))?.upvoteCount ?? 0), 0)
				return Math.log2(upvoteSum / Math.max(players.length, 1) + 1)
			}
			const myUpvoteLevel = upvoteLevelOf(myHost)
			const upvoteGaps = new Map(teams.map((team) => [
				team,
				Math.abs(upvoteLevelOf(team) - myUpvoteLevel),
			]))
			// The closest upvote level is tried first, and the oldest search among equal ones
			const otherTeamsByUpvoteGap = [...teams].sort((a, b) => upvoteGaps.get(a)! - upvoteGaps.get(b)!)
			// Only the host of each other merged search counts, since its merged search merges as a
			// whole
			for (const other of otherTeamsByUpvoteGap) {
				if (
					other === myHost
					|| !other.is_searching
					|| other.joined_team_id
					|| other.found_status
				) continue
				// A Browse Teams join only merges with the merged search that the user chose
				if (myHost.chosen_slot.length && other !== chosenHostOf(myHost)) continue
				if (other.chosen_slot.length && chosenHostOf(other) !== myHost) continue
				const isBrowseTeamsJoin = Boolean(myHost.chosen_slot.length || other.chosen_slot.length)
				const differences = [
					...teamSettingsDifferences({
						teamA: mergedTeamSettingsOf(mergedTeamOf(myHost)),
						teamB: mergedTeamSettingsOf(mergedTeamOf(other)),
					}),
					// Both merged searches want the same number of players, counting every row that is
					// not "(Leave Empty)"
					other.team_table_rows.filter((row) => !row.isLeftEmpty).length
						!== myHost.team_table_rows.filter((row) => !row.isLeftEmpty).length
						&& 'number of rows differs',
					// The allowed upvote gap widens by one level for every 6 seconds that the older of
					// the two searches has waited, and any gap fits after 60 seconds, so that two lone
					// searches always match. A user who chose the team in Browse Teams accepts any gap.
					// A host is the oldest search of its merged search.
					!isBrowseTeamsJoin && (() => {
						const waitedSeconds = (transactionTime.getTime() - Math.min(
							other.started_at.getTime(),
							myHost.started_at.getTime(),
						)) / 1000
						return waitedSeconds < 60 && upvoteGaps.get(other)! > waitedSeconds / 6
					})() && 'upvotes differ too much for the time waited',
				].filter(Boolean)
				if (differences.length) {
					console.log(`No merge of ${logNameOf(myHost)} with ${logNameOf(other)}: ${
						differences.join(', ')
					}`)
					if (myHost.chosen_slot.length) error = 'This team has no slot for you anymore'
					continue
				}
				// The older host stays the host, so that a host is always the oldest search of its
				// merged search
				const [host, joiningHost] = other.started_at <= myHost.started_at
					? [other, myHost]
					: [myHost, other]
				const joiningMergedTeam = mergedTeamOf(joiningHost)
				const rowPairings = pairMergedSearches({
					host,
					mergedTeam: mergedTeamOf(host),
					joiningHost,
					joiningMergedTeam,
					players: allPlayersOf([...mergedTeamOf(host), ...joiningMergedTeam]),
				})
				// A merged search whose slots all have a player is only complete with a server link
				// from one of its searches
				const isFullWithoutServerLink = rowPairings
					&& ![...mergedTeamOf(host), ...joiningMergedTeam].some((team) => team.server_link)
					&& allPlayersOf([...mergedTeamOf(host), ...joiningMergedTeam]).length
						=== host.team_table_rows.filter((row) => !row.isLeftEmpty).length
				if (!rowPairings || isFullWithoutServerLink) {
					console.log(`No merge of ${logNameOf(myHost)} with ${logNameOf(other)}: ${
						isFullWithoutServerLink
							? 'every slot would have a player, but no search has a server link'
							: 'no pairing of the rows lets every player fit, or a verified player is in both'
					}`)
					if (myHost.chosen_slot.length) error = 'This team has no slot for you anymore'
					continue
				}
				console.log(`Merged ${logNameOf(joiningHost)} into ${logNameOf(host)}`)
				for (const team of joiningMergedTeam) {
					team.joined_team_id = host.team_id
					team.row_pairing = rowPairings.get(team.team_id)!
					changedTeams.add(team)
				}
				changedTeams.add(host)

				const mergedTeam = mergedTeamOf(host)
				// The search whose server everyone joins, which is the oldest one with a server link
				const serverLinkTeam = mergedTeam.find((team) => team.server_link)
				const players = allPlayersOf(mergedTeam)
				const playersInSlots = placePlayersInSlots({
					host: host,
					mergedTeam,
					players,
				}) ?? []
				const verifiedPlayers = players.flatMap((player) => (
					player.robloxUserId && 'robloxUsername' in player.playerInRow ? [{
						robloxUserId: player.robloxUserId,
						robloxUsername: player.playerInRow.robloxUsername,
						invitedByRobloxUserId: player.invitedByRobloxUserId,
						teamId: player.teamId,
					}] : []
				))
				const mergedTeamSettings = mergedTeamSettingsOf(mergedTeam)
				const foundTeam: FoundTeam = {
					serverLink: serverLinkTeam?.server_link ?? '',
					dandyRun: mergedTeamSettings.dandy_run,
					earlyDyle: mergedTeamSettings.early_dyle,
					region: mergedTeamSettings.region,
					floorGoal: mergedTeamSettings.floor_goal,
					tables: mergedTeam.map((team) => ({
						teamId: team.team_id,
						teamTableRows: team.team_table_rows,
						playersInRows: playersInRowsOf({
							team,
							host: host,
							playersInSlots,
						}).map((player) => player?.playerInRow ?? null),
					})),
					verifiedPlayers,
				}
				// The team is found, and its search ends, once every slot has a player
				const isEverySlotTaken = host.team_table_rows.every((row, slot) => (
					row.isLeftEmpty || playersInSlots[slot]
				))
				if (!isEverySlotTaken) break
				const foundTeamId = `${host.team_id} ${host.started_at.toISOString()}`
				for (const team of mergedTeam) {
					const playersInRows = playersInRowsOf({
						team,
						host: host,
						playersInSlots,
					})
					team.found_status = {
						foundTeamId,
						teamServerLink: serverLinkTeam!.server_link,
						hostRobloxUsername: serverLinkTeam!.roblox_username,
						playersInRows: playersInRows.map((player) => player?.playerInRow ?? null),
						hostRowIndex: playersInRows.findIndex((player) => (
							player?.isHost && player.teamId === team.team_id
						)),
						// Everyone except the search whose server the team joins
						hasJoinedATeam: team !== serverLinkTeam,
						teamSettings: {
							dandyRun: mergedTeamSettings.dandy_run,
							earlyDyle: mergedTeamSettings.early_dyle,
							region: mergedTeamSettings.region,
							floorGoal: mergedTeamSettings.floor_goal,
						},
						slotRows: slotRowsOfTable({
							team,
							host: host,
							mergedTeam,
						}),
					}
					changedTeams.add(team)
				}
				writes.push(`
					INSERT INTO found_teams (found_team_id, roblox_user_ids, found_team)
					VALUES (
						${sqlLiteral(foundTeamId)},
						${sqlLiteral(verifiedPlayers.map((player) => player.robloxUserId))},
						${sqlLiteral(foundTeam)}
					)
					ON CONFLICT (found_team_id) DO UPDATE SET
						roblox_user_ids = excluded.roblox_user_ids,
						found_team = excluded.found_team
				`)
				break
			}
		}

		for (const team of changedTeams) {
			writes.push(`
				UPDATE teams SET
					joined_team_id = ${team.joined_team_id ? sqlLiteral(team.joined_team_id) : 'NULL'},
					row_pairing = ${sqlLiteral(team.row_pairing)},
					chosen_slot = ${sqlLiteral(team.chosen_slot)},
					found_status = ${team.found_status ? sqlLiteral(team.found_status) : 'NULL'},
					server_link = ${sqlLiteral(team.server_link)}
				WHERE team_id = ${sqlLiteral(team.team_id)}
			`)
		}
		await client.query([...writes, 'COMMIT'].join(';\n'))
		// Every check-in waits for the ones before it, so a long wait means that the site has more
		// check-ins than the lock lets through, and a long hold means that each one got slower. The
		// wait also counts the removal of gone pages, which takes a few milliseconds.
		const checkInMs = Date.now() - checkInStartedAt
		if (checkInMs > 1000) {
			console.log(`Slow check-in: ${checkInMs}ms in all, ${lockWaitMs}ms waiting for the lock, ${
				checkInMs - lockWaitMs
			}ms holding it, ${onThisPageCount} open pages, ${teams.length} teams`)
		}
		const counts = {
			onThisPageCount,
			findingPlayersCount: teams.filter((team) => (
				team.is_searching && !team.joined_team_id && !team.found_status
			)).length,
		}

		// Browse Teams lists the host that the user's join there chose, then every other search that
		// another one could join, that agrees with the user's TEAM SETTINGS, and that still has a slot
		// that the user fits once every player of its merged team has a row. Each listed team comes
		// with the free rows of its table whose Join button the user can click.
		const browse = body.browse
		// Player in each slot of the host's merged team, indexed by the host's rows
		const playersInHostRowsOf = (host: Team) => (placePlayersInSlots({
			host,
			mergedTeam: mergedTeamOf(host),
			players: allPlayersOf(mergedTeamOf(host)),
		}) ?? []).map((player) => player?.playerInRow ?? null)
		const browsedTeams: {
			host: Team
			playersInRows: (PlayerInRow | null)[]
			joinableRowIndexes: number[]
		}[] = []
		let hasMoreBrowsedTeams = false
		if (browse) {
			// TEAM SETTINGS of Browse Teams, which a join there sends as its own
			const browseTeamSettings: TeamSettings = {
				dandy_run: String(browse.dandyRun),
				early_dyle: String(browse.earlyDyle),
				region: String(browse.region),
				floor_goal: String(browse.floorGoal),
			}
			const browsedTeamCount = Math.min(Number(browse.browsedTeamCount) || 0, 200)
			const chosenHost = myTeam ? chosenHostOf(myTeam) : undefined
			// Free rows of the host's table that the user's slot fits once every player of its merged
			// team has a row, leaving out the user's own running join
			const joinableRowIndexesOf = ({
				host,
				playersInRows,
			}: {
				host: Team
				playersInRows: (PlayerInRow | null)[]
			}) => host.team_table_rows.flatMap((row, rowIndex) => {
				if (row.isLeftEmpty || playersInRows[rowIndex]) return []
				const userTeam: Team = {
					team_id: pageId,
					invite_code: '',
					roblox_user_id: robloxAccount ? String(robloxAccount.id) : '',
					roblox_username: robloxAccount?.username ?? '',
					roblox_badge_names: ownedBadgeNames,
					removed_roblox_usernames: [],
					missing_toons: browse.missingToons.slice(0, 200).map(String),
					missing_trinkets: browse.missingTrinkets.slice(0, 200).map(String),
					team_table_rows: browseTeamsJoinTableRows({
						browseTeamsSlot: {
							toonPicture: String(browse.toonPicture),
							trinketAPicture: String(browse.trinketAPicture),
							trinketBPicture: String(browse.trinketBPicture),
							roleNames: browse.roleNames.map(String),
						},
						rowCount: host.team_table_rows.filter((row) => !row.isLeftEmpty).length,
					}),
					server_link: '',
					...browseTeamSettings,
					is_searching: true,
					search_id: '',
					chosen_slot: chosenSlotOf({
						mergedTeam: mergedTeamOf(host).filter((team) => team.team_id !== pageId),
						host,
						slot: rowIndex,
					}),
					joined_team_id: host.team_id,
					row_pairing: [],
					found_status: null,
					started_at: transactionTime,
				}
				const mergedTeam = mergedTeamOf(host).filter((team) => team.team_id !== pageId)
				const players = allPlayersOf([...mergedTeam, userTeam])
				// A join that would give every slot a player needs a server link from the team
				const isFullWithoutServerLink = !mergedTeam.some((team) => team.server_link)
					&& players.length === host.team_table_rows.filter((row) => !row.isLeftEmpty).length
				return !isFullWithoutServerLink && pairMergedSearches({
					host,
					mergedTeam,
					joiningHost: userTeam,
					joiningMergedTeam: [userTeam],
					players,
				}) ? [rowIndex] : []
			})
			if (chosenHost?.is_searching) {
				const playersInRows = playersInHostRowsOf(chosenHost)
				browsedTeams.push({
					host: chosenHost,
					playersInRows,
					joinableRowIndexes: joinableRowIndexesOf({
						host: chosenHost,
						playersInRows,
					}),
				})
			}
			for (const host of teams) {
				if (
					host === chosenHost
					|| !host.is_searching
					|| host.joined_team_id
					|| host.found_status
					|| host.chosen_slot.length
					// The page's own merged search
					|| mergedTeamOf(host).some((team) => team.team_id === pageId)
					// The Players range of Browse Teams counts the slots of the host's table
					|| host.team_table_rows.filter((row) => !row.isLeftEmpty).length
						< (Number(browse.playersFrom) || 2)
					|| host.team_table_rows.filter((row) => !row.isLeftEmpty).length
						> (Number(browse.playersTo) || 8)
					|| teamSettingsDifferences({
						teamA: mergedTeamSettingsOf(mergedTeamOf(host)),
						teamB: browseTeamSettings,
					}).length
				) continue
				const playersInRows = playersInHostRowsOf(host)
				const joinableRowIndexes = joinableRowIndexesOf({
					host,
					playersInRows,
				})
				if (!joinableRowIndexes.length) continue
				if (browsedTeams.length - (chosenHost?.is_searching ? 1 : 0) === browsedTeamCount) {
					hasMoreBrowsedTeams = true
					break
				}
				browsedTeams.push({
					host,
					playersInRows,
					joinableRowIndexes,
				})
			}
		}

		const shownTeam = invitingTeamId ? teamsById.get(invitingTeamId) : myTeam
		const finalHost = shownTeam?.joined_team_id ? teamsById.get(shownTeam.joined_team_id) : shownTeam
		const shownMergedTeam = finalHost ? mergedTeamOf(finalHost) : []
		// The merge checked that every player of the merged team fits a slot, so the second try,
		// with only the shown team's own players in its own rows, is for a team that fell apart
		// meanwhile
		const playersInShownRows = shownTeam && finalHost && (() => {
			const playersInSlots = placePlayersInSlots({
				host: finalHost,
				mergedTeam: shownMergedTeam,
				players: allPlayersOf(shownMergedTeam),
			})
			if (playersInSlots) {
				return playersInRowsOf({
					team: shownTeam,
					host: finalHost,
					playersInSlots,
				})
			}
			return placePlayersInSlots({
				host: shownTeam,
				mergedTeam: [shownTeam],
				players: playersOf({
					team: shownTeam,
					verifiedFriends,
				}),
			})
		})()
		const shownMergedTeamSettings = finalHost ? mergedTeamSettingsOf(shownMergedTeam) : null
		return c.json({
			...counts,
			error,
			isVerificationNeededToJoin,
			invitingTeam: invitingTeamId && shownTeam ? {
				teamTableRows: shownTeam.team_table_rows,
				dandyRun: shownTeam.dandy_run,
				earlyDyle: shownTeam.early_dyle,
				region: shownTeam.region,
				floorGoal: shownTeam.floor_goal,
				hostRobloxUsername: shownTeam.roblox_username,
			} : null,
			shownTeamStatus: shownTeam && finalHost ? {
				verifiedFriendRobloxUsernames: verifiedFriendsOf({
					team: shownTeam,
					verifiedFriends,
				}).map((verifiedFriend) => verifiedFriend.roblox_username),
				...shownTeam.found_status ? {
					playersInRows: shownTeam.found_status.playersInRows,
					hostRowIndex: shownTeam.found_status.hostRowIndex,
					browseTeamsPlayerRowIndexes: [],
					isSearching: false,
					hasJoinedATeam: shownTeam.found_status.hasJoinedATeam,
					hostRobloxUsername: shownTeam.found_status.hostRobloxUsername,
					teamServerLink: shownTeam.found_status.teamServerLink,
					teamSettings: shownTeam.found_status.teamSettings ?? {
						dandyRun: shownTeam.dandy_run,
						earlyDyle: shownTeam.early_dyle,
						region: shownTeam.region,
						floorGoal: shownTeam.floor_goal,
					},
					slotRows: shownTeam.found_status.slotRows ?? shownTeam.team_table_rows,
				} : {
					playersInRows: shownTeam.team_table_rows.map((_row, rowIndex) => (
						playersInShownRows?.[rowIndex]?.playerInRow ?? null
					)),
					hostRowIndex: playersInShownRows?.findIndex((player) => (
						player?.isHost && player.teamId === shownTeam.team_id
					)) ?? -1,
					browseTeamsPlayerRowIndexes: (playersInShownRows ?? []).flatMap((player, rowIndex) => (
						player && teamsById.get(player.teamId)?.chosen_slot.length ? [rowIndex] : []
					)),
					isSearching: shownTeam.is_searching,
					hasJoinedATeam: Boolean(shownTeam.joined_team_id),
					hostRobloxUsername: finalHost.roblox_username,
					teamServerLink: '',
					teamSettings: {
						dandyRun: shownMergedTeamSettings!.dandy_run,
						earlyDyle: shownMergedTeamSettings!.early_dyle,
						region: shownMergedTeamSettings!.region,
						floorGoal: shownMergedTeamSettings!.floor_goal,
					},
					slotRows: slotRowsOfTable({
						team: shownTeam,
						host: finalHost,
						mergedTeam: shownMergedTeam,
					}),
				},
			} : null,
			browsedTeams: browsedTeams.map(({
				host,
				playersInRows,
				joinableRowIndexes,
			}) => ({
				hostTeamId: host.team_id,
				hostRobloxUsername: host.roblox_username,
				...(() => {
					const mergedTeamSettings = mergedTeamSettingsOf(mergedTeamOf(host))
					return {
						dandyRun: mergedTeamSettings.dandy_run,
						earlyDyle: mergedTeamSettings.early_dyle,
						region: mergedTeamSettings.region,
						floorGoal: mergedTeamSettings.floor_goal,
					}
				})(),
				teamTableRows: slotRowsOfTable({
					team: host,
					host,
					mergedTeam: mergedTeamOf(host),
				}),
				playersInRows,
				joinableRowIndexes,
				...(() => {
					const otherSearches = mergedTeamOf(host).filter((team) => team.team_id !== pageId)
					return {
						searchIds: otherSearches.map((team) => team.team_id),
						chosenSlotsByRow: host.team_table_rows.map((row, slot) => (
							row.isLeftEmpty ? [] : chosenSlotOf({
								mergedTeam: otherSearches,
								host,
								slot,
							})
						)),
						joinedRowIndex: myTeam?.chosen_slot.length && host === chosenHostOf(myTeam)
							? chosenSlotIn({
								team: myTeam,
								mergedTeam: otherSearches,
								host,
							})
							: -1,
					}
				})(),
			})),
			hasMoreBrowsedTeams,
		} satisfies CheckInAnswer)
	} catch (error) {
		await client.query('ROLLBACK')
		throw error
	} finally {
		client.release()
	}
})

// Closing or reloading the tab ends its search, its team and its invite right away
checkIn.post('/leave', async (c) => {
	const { pageId } = await c.req.json<{ pageId: string }>()
	const client = await database.connect()
	try {
		const pageIdLiteral = client.escapeLiteral(String(pageId))
		// Several statements in one query run as one transaction, which holds the check-ins' lock
		// to its end, since deletes that run beside a check-in deadlock with it
		await client.query(`
			SELECT pg_advisory_xact_lock(1);
			DELETE FROM open_pages WHERE page_id = ${pageIdLiteral};
			DELETE FROM teams WHERE team_id = ${pageIdLiteral};
			DELETE FROM verified_friends WHERE page_id = ${pageIdLiteral};
		`)
	} finally {
		client.release()
	}
	return c.body(null, 204)
})
