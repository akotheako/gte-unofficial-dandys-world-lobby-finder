import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { badgeCategories } from '../shared/badgeCategories.ts'
import { robloxServerLinkPattern } from '../shared/robloxServerLinkPattern.ts'
import type {
	CheckInAnswer,
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
	roblox_username: string
	roblox_badge_names: string[]
	// Verified friends whom the host removed, whom the invite link no longer lets in
	removed_roblox_usernames: string[]
	team_table_rows: TeamTableRow[]
	server_link: string
	is_dandy_run: boolean
	is_early_dyle: boolean
	region: string
	floor_goal: string
	is_searching: boolean
	joined_team_id: string | null
	started_at: Date
}

type VerifiedFriend = {
	page_id: string
	team_id: string
	roblox_username: string
	badge_names: string[]
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
	isVerified: boolean
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
					isVerified: Boolean(team.roblox_username),
					badgeNames: team.roblox_badge_names,
				}
			}
			if (reservedFor.startsWith('unverifiedFriend:')) {
				return {
					playerInRow: { unverifiedFriendOf: team.roblox_username },
					isVerified: false,
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
					isVerified: true,
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

// Puts every player into a different row of the team, or returns null when they cannot all fit.
// The team's own players can only take a row reserved for them, and players from other teams can
// take any row that one of their own reserved rows fits, including a reserved row that the
// team's own player does not end up in. An empty Toon or Trinket cell means "(Any)" on both sides.
function placePlayersInRows({
	players,
	team,
	teamsById,
}: {
	players: TeamPlayer[]
	team: Team
	teamsById: Map<string, Team>
}) {
	const rows = team.team_table_rows
	const playersInRows: (TeamPlayer | null)[] = rows.map(() => null)
	const fits = ({
		player,
		rowIndex,
	}: {
		player: TeamPlayer
		rowIndex: number
	}) => {
		const row = rows[rowIndex]
		if (row.isLeftEmpty || playersInRows[rowIndex]) return false
		if (player.teamId === team.team_id) return player.reservedRowIndexes.includes(rowIndex)
		const playerRows = teamsById.get(player.teamId)?.team_table_rows ?? []
		return player.reservedRowIndexes.some((playerRowIndex) => {
			const playerRow = playerRows[playerRowIndex]
			const playerTrinkets = [playerRow.trinketAPicture, playerRow.trinketBPicture].filter(Boolean)
			const missingTrinkets = [row.trinketAPicture, row.trinketBPicture]
				.filter((trinket) => trinket && !playerTrinkets.includes(trinket))
			return (!row.toonPicture || !playerRow.toonPicture || row.toonPicture === playerRow.toonPicture)
				// A player's empty trinket slot can take any trinket that the row asks for
				&& missingTrinkets.length <= 2 - playerTrinkets.length
				&& row.roleNames.every((role) => playerRow.roleNames.includes(role))
				// Badges only count for a verified player, since nobody can confirm the badges of
				// an unverified one. A harder badge of the same category also counts, such as
				// Marathon Runner for Speed Walker.
				&& (!row.isVerifiedPlayerRequired || (player.isVerified && row.badgeNames.every((wanted) => {
					const category = badgeCategories.find((names) => names.includes(wanted)) ?? [wanted]
					return player.badgeNames.some((owned) => (
						category.indexOf(owned) >= category.indexOf(wanted)
					))
				})))
		})
	}
	const placePlayer = (playerIndex: number): boolean => {
		if (playerIndex === players.length) return true
		for (const rowIndex of rows.keys()) {
			if (!fits({
				player: players[playerIndex],
				rowIndex,
			})) continue
			playersInRows[rowIndex] = players[playerIndex]
			if (placePlayer(playerIndex + 1)) return true
			playersInRows[rowIndex] = null
		}
		return false
	}
	return placePlayer(0) ? playersInRows : null
}

// Every open page checks in under its random page id every few seconds. The check-in counts the
// open pages, keeps the page's team on the server once its invite link was copied or while it
// searches, lets a page that opened an invite link join the inviting team, and merges searches
// that fit each other. A merged team is a host and the searches that joined it, and every player
// of it has to fit a row of every table in it, so every search gets what it asked for. Every
// player then gets the host's server link.
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
			is_dandy_run boolean NOT NULL,
			is_early_dyle boolean NOT NULL,
			region text NOT NULL,
			floor_goal text NOT NULL,
			is_searching boolean NOT NULL,
			joined_team_id text,
			started_at timestamptz NOT NULL DEFAULT now()
		);
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS roblox_badge_names jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS removed_roblox_usernames jsonb NOT NULL DEFAULT '[]';
		ALTER TABLE teams DROP COLUMN IF EXISTS verified_friend_ids;
		CREATE TABLE IF NOT EXISTS verified_friends (
			page_id text PRIMARY KEY,
			team_id text NOT NULL,
			roblox_username text NOT NULL,
			badge_names jsonb NOT NULL
		);
		ALTER TABLE verified_friends DROP COLUMN IF EXISTS friend_id;
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
			inviteCode: string
			serverLink: string
			isDandyRun: boolean
			isEarlyDyle: boolean
			region: string
			floorGoal: string
			isFindingPlayers: boolean
		} | null
		// The invite link that the page was opened with
		invite: { inviteCode: string } | null
	}>()
	const pageId = String(body.pageId)
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	const robloxAccount = cookie
		? JSON.parse(cookie) as {
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

	const client = await database.connect()
	try {
		await client.query('BEGIN')
		// Check-ins run one at a time across every server, so two searches never take one row
		await client.query('SELECT pg_advisory_xact_lock(1)')
		// Browsers run the timers of a hidden tab only once a minute, and players switch to Roblox
		// while they wait, so a page only counts as gone after 90 silent seconds
		await client.query(`
			INSERT INTO open_pages (page_id) VALUES ($1)
			ON CONFLICT (page_id) DO UPDATE SET last_seen_at = now()
		`, [pageId])
		await client.query(`
			DELETE FROM open_pages WHERE last_seen_at < now() - interval '90 seconds';
			DELETE FROM teams WHERE team_id NOT IN (SELECT page_id FROM open_pages);
			DELETE FROM verified_friends WHERE page_id NOT IN (SELECT page_id FROM open_pages);
		`)

		const sentTeam = body.team
		const serverLink = String(sentTeam?.serverLink ?? '').trim()
		if (sentTeam?.isFindingPlayers && serverLink && !robloxServerLinkPattern.test(serverLink)) {
			error = 'The server link is invalid!'
		}
		if (!sentTeam || error) {
			await client.query('DELETE FROM teams WHERE team_id = $1', [pageId])
		} else {
			const { rows: [savedTeam] } = await client.query<Team>(`
				SELECT * FROM teams WHERE team_id = $1
			`, [pageId])
			// A running search keeps the team that it joined and its place in the queue, since the
			// table cannot change while it runs
			if (!savedTeam?.is_searching || !sentTeam.isFindingPlayers) {
				await client.query(`
					INSERT INTO teams (
						team_id,
						invite_code,
						roblox_username,
						roblox_badge_names,
						removed_roblox_usernames,
						team_table_rows,
						server_link,
						is_dandy_run,
						is_early_dyle,
						region,
						floor_goal,
						is_searching
					)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
					ON CONFLICT (team_id) DO UPDATE SET
						invite_code = excluded.invite_code,
						roblox_username = excluded.roblox_username,
						roblox_badge_names = excluded.roblox_badge_names,
						removed_roblox_usernames = excluded.removed_roblox_usernames,
						team_table_rows = excluded.team_table_rows,
						server_link = excluded.server_link,
						is_dandy_run = excluded.is_dandy_run,
						is_early_dyle = excluded.is_early_dyle,
						region = excluded.region,
						floor_goal = excluded.floor_goal,
						is_searching = excluded.is_searching,
						joined_team_id = NULL,
						started_at = now()
				`, [
					pageId,
					String(sentTeam.inviteCode),
					robloxAccount?.username ?? '',
					JSON.stringify(ownedBadgeNames),
					JSON.stringify(sentTeam.removedRobloxUsernames.slice(0, 100).map(String)),
					// Only the fields that matching reads are stored, since other players see them
					JSON.stringify(sentTeam.teamTableRows.slice(0, 8).map((row): TeamTableRow => {
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
					})),
					serverLink,
					Boolean(sentTeam.isDandyRun),
					Boolean(sentTeam.isEarlyDyle),
					String(sentTeam.region),
					String(sentTeam.floorGoal),
					Boolean(sentTeam.isFindingPlayers),
				])
			}
		}

		let invitingTeamId: string | null = null
		if (body.invite) {
			const { rows: [invitingTeam] } = await client.query<Team>(`
				SELECT * FROM teams WHERE invite_code = $1
			`, [String(body.invite.inviteCode)])
			const { rows: friendsInTeam } = await client.query<VerifiedFriend>(`
				SELECT * FROM verified_friends WHERE team_id = $1
			`, [invitingTeam?.team_id ?? ''])
			const hasJoined = friendsInTeam.some((friend) => friend.page_id === pageId)
			if (!invitingTeam) {
				error = 'This invite link expired'
			} else if (!robloxAccount) {
				error = 'Verify your Roblox account to join the team that invited you'
			} else if (invitingTeam.team_id === pageId) {
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
				await client.query(`
					INSERT INTO verified_friends (page_id, team_id, roblox_username, badge_names)
					VALUES ($1, $2, $3, $4)
					ON CONFLICT (page_id) DO UPDATE SET
						team_id = excluded.team_id,
						roblox_username = excluded.roblox_username,
						badge_names = excluded.badge_names
				`, [
					pageId,
					invitingTeam.team_id,
					robloxAccount.username,
					JSON.stringify(ownedBadgeNames),
				])
				invitingTeamId = invitingTeam.team_id
			}
		}
		if (!invitingTeamId) {
			await client.query('DELETE FROM verified_friends WHERE page_id = $1', [pageId])
		}

		const { rows: teams } = await client.query<Team>('SELECT * FROM teams ORDER BY started_at')
		const { rows: verifiedFriends } = await client.query<VerifiedFriend>(`
			SELECT * FROM verified_friends
		`)
		const teamsById = new Map(teams.map((team) => [team.team_id, team]))
		const changedTeams = new Set<Team>()

		// Puts searches whose host left or stopped searching back into the search
		for (const team of teams) {
			if (team.joined_team_id && !teamsById.get(team.joined_team_id)?.is_searching) {
				team.joined_team_id = null
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
		if (myTeam?.is_searching && !myTeam.joined_team_id) {
			for (const other of teams) {
				const areSettingsCompatible = other !== myTeam
					&& other.is_searching
					&& !other.joined_team_id
					&& other.is_dandy_run === myTeam.is_dandy_run
					&& other.is_early_dyle === myTeam.is_early_dyle
					&& other.floor_goal === myTeam.floor_goal
					&& (other.region === 'Any' || myTeam.region === 'Any' || other.region === myTeam.region)
					&& Boolean(other.server_link || myTeam.server_link)
					// Both teams want the same number of players, counting every row that is not
					// "(Leave Empty)"
					&& other.team_table_rows.filter((row) => !row.isLeftEmpty).length
						=== myTeam.team_table_rows.filter((row) => !row.isLeftEmpty).length
				if (!areSettingsCompatible) continue
				// The older search hosts when both ways fit, and a search that others already joined
				// can only host
				const merge = [[other, myTeam], [myTeam, other]]
					.filter(([, joiner]) => mergedTeamOf(joiner).length === 1)
					.map(([host, joiner]) => {
						const mergedTeam = [...mergedTeamOf(host), joiner]
						return {
							host,
							joiner,
							mergedTeam,
							players: allPlayersOf(mergedTeam),
						}
					})
					.find(({
						mergedTeam, players,
					}) => {
						// A closed tab keeps its search for up to 90 seconds, so the same verified
						// player can search twice, and must not end up twice in one team
						const verifiedUsernames = players.flatMap(({ playerInRow }) => (
							'robloxUsername' in playerInRow && playerInRow.robloxUsername
								? [playerInRow.robloxUsername]
								: []
						))
						return new Set(verifiedUsernames).size === verifiedUsernames.length
							&& mergedTeam.every((team) => placePlayersInRows({
								players,
								team,
								teamsById,
							}))
					})
				if (!merge) continue
				merge.joiner.joined_team_id = merge.host.team_id
				merge.host.server_link ||= merge.joiner.server_link
				changedTeams.add(merge.host)
				changedTeams.add(merge.joiner)
				break
			}
		}

		for (const team of changedTeams) {
			await client.query(`
				UPDATE teams SET joined_team_id = $2, server_link = $3
				WHERE team_id = $1
			`, [
				team.team_id,
				team.joined_team_id,
				team.server_link,
			])
		}
		const { rows: [counts] } = await client.query<{
			onThisPageCount: number
			findingPlayersCount: number
		}>(`
			SELECT
				(SELECT count(*)::int FROM open_pages) AS "onThisPageCount",
				(SELECT count(*)::int FROM teams WHERE is_searching AND joined_team_id IS NULL)
					AS "findingPlayersCount"
		`)
		await client.query('COMMIT')

		const shownTeam = invitingTeamId ? teamsById.get(invitingTeamId) : myTeam
		const finalHost = shownTeam?.joined_team_id ? teamsById.get(shownTeam.joined_team_id) : shownTeam
		const shownMergedTeam = finalHost ? mergedTeamOf(finalHost) : []
		// The merge checked that every player fits every table of the merged team, so the second
		// try, with only the shown team's own players, is for a team that fell apart meanwhile
		const playersInShownRows = shownTeam && (placePlayersInRows({
			players: allPlayersOf(shownMergedTeam),
			team: shownTeam,
			teamsById,
		}) ?? placePlayersInRows({
			players: playersOf({
				team: shownTeam,
				verifiedFriends,
			}),
			team: shownTeam,
			teamsById,
		}))
		return c.json({
			...counts,
			error,
			invitingTeam: invitingTeamId && shownTeam ? {
				teamTableRows: shownTeam.team_table_rows,
				isDandyRun: shownTeam.is_dandy_run,
				isEarlyDyle: shownTeam.is_early_dyle,
				region: shownTeam.region,
				floorGoal: shownTeam.floor_goal,
				hostRobloxUsername: shownTeam.roblox_username,
			} : null,
			shownTeamStatus: shownTeam && finalHost ? {
				playersInRows: shownTeam.team_table_rows.map((_row, rowIndex) => (
					playersInShownRows?.[rowIndex]?.playerInRow ?? null
				)),
				verifiedFriendRobloxUsernames: verifiedFriendsOf({
					team: shownTeam,
					verifiedFriends,
				}).map((verifiedFriend) => verifiedFriend.roblox_username),
				isSearching: shownTeam.is_searching,
				hasJoinedATeam: Boolean(shownTeam.joined_team_id),
				hostRobloxUsername: finalHost.roblox_username,
				teamServerLink: shownTeam.is_searching && shownMergedTeam.length > 1
					? finalHost.server_link
					: '',
			} : null,
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
	await database.query('DELETE FROM open_pages WHERE page_id = $1', [String(pageId)])
	await database.query('DELETE FROM teams WHERE team_id = $1', [String(pageId)])
	await database.query('DELETE FROM verified_friends WHERE page_id = $1', [String(pageId)])
	return c.body(null, 204)
})
