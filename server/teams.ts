import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { badgeCategories } from '../shared/badgeCategories.ts'
import { robloxServerLinkPattern } from '../shared/robloxServerLinkPattern.ts'
import { database } from './database.ts'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

type TeamTableRow = {
	toonPicture: string
	trinketAPicture: string
	trinketBPicture: string
	badgeNames: string[]
	roleNames: string[]
	isReserved: boolean
	isLeftEmpty: boolean
	// Player from another search who took this open row, described by their own reserved row
	joinedPlayer: {
		searcherId: string
		robloxUsername: string
		row: TeamTableRow
	} | null
}

type SearchingTeam = {
	searcher_id: string
	roblox_username: string
	team_table_rows: TeamTableRow[]
	server_link: string
	is_dandy_run: boolean
	is_early_dyle: boolean
	region: string
	floor_goal: string
	joined_team_id: string | null
	started_at: Date
}

// Rows that stand for a player who is already in the team: the reserved rows and the joined players
function memberRowsOf(team: SearchingTeam) {
	return team.team_table_rows.flatMap((row) => {
		if (row.joinedPlayer) return [row.joinedPlayer.row]
		return !row.isLeftEmpty && row.isReserved ? [row] : []
	})
}

// Picks a different open row of the team for every member row, or returns null when they cannot
// all fit. An empty Toon or Trinket cell means "(Any)" on both sides.
function findOpenRowsForMembers({
	memberRows,
	team,
}: {
	memberRows: TeamTableRow[]
	team: SearchingTeam
}) {
	const rows = team.team_table_rows
	const openRowIndexes = rows.flatMap((row, index) => (
		!row.isLeftEmpty && !row.isReserved && !row.joinedPlayer ? [index] : []
	))
	const chosenRowIndexes: number[] = []
	const placeMember = (memberIndex: number): boolean => {
		if (memberIndex === memberRows.length) return true
		const member = memberRows[memberIndex]
		const memberTrinkets = [member.trinketAPicture, member.trinketBPicture].filter(Boolean)
		for (const rowIndex of openRowIndexes) {
			const open = rows[rowIndex]
			const missingTrinkets = [open.trinketAPicture, open.trinketBPicture]
				.filter((trinket) => trinket && !memberTrinkets.includes(trinket))
			const fits = !chosenRowIndexes.slice(0, memberIndex).includes(rowIndex)
				&& (!open.toonPicture || !member.toonPicture || open.toonPicture === member.toonPicture)
				// A member's empty trinket slot can take any trinket that the row asks for
				&& missingTrinkets.length <= 2 - memberTrinkets.length
				// A harder badge of the same category also counts, such as Marathon Runner for
				// Speed Walker
				&& open.badgeNames.every((wanted) => {
					const category = badgeCategories.find((names) => names.includes(wanted)) ?? [wanted]
					return member.badgeNames.some((owned) => (
						category.indexOf(owned) >= category.indexOf(wanted)
					))
				})
				&& open.roleNames.every((role) => member.roleNames.includes(role))
			if (!fits) continue
			chosenRowIndexes[memberIndex] = rowIndex
			if (placeMember(memberIndex + 1)) return true
		}
		return false
	}
	return placeMember(0) ? chosenRowIndexes.slice(0, memberRows.length) : null
}

// Each tab that clicks Find Players searches under a random id. Searches that fit each other merge:
// the reserved rows of one search, the joiner, take open rows of the other, the host, and every
// player then gets the host's server link.
export const teams = new Hono()

// The table is created on the first request, so a new database needs no setup step
let tableIsCreated: Promise<unknown> | undefined
teams.use(async (_c, next) => {
	tableIsCreated ??= database.query(`
		CREATE TABLE IF NOT EXISTS searching_teams (
			searcher_id text PRIMARY KEY,
			roblox_username text NOT NULL,
			team_table_rows jsonb NOT NULL,
			server_link text NOT NULL,
			is_dandy_run boolean NOT NULL,
			is_early_dyle boolean NOT NULL,
			region text NOT NULL,
			floor_goal text NOT NULL,
			joined_team_id text,
			started_at timestamptz NOT NULL DEFAULT now(),
			last_heartbeat_at timestamptz NOT NULL DEFAULT now()
		)
	`).catch((error) => {
		tableIsCreated = undefined
		throw error
	})
	await tableIsCreated
	await next()
})

// The "looking for a team" counter counts the searches that did not join a team yet
teams.get('/', async (c) => {
	const { rows } = await database.query<{ count: number }>(`
		SELECT count(*)::int AS count FROM searching_teams
		WHERE joined_team_id IS NULL AND last_heartbeat_at > now() - interval '90 seconds'
	`)
	return c.json({ count: rows[0].count })
})

// Find Players starts a search, or starts it over
teams.put('/:searcherId', async (c) => {
	const body = await c.req.json<{
		teamTableRows: TeamTableRow[]
		serverLink: string
		isDandyRun: boolean
		isEarlyDyle: boolean
		region: string
		floorGoal: string
	}>()
	const serverLink = String(body.serverLink).trim()
	if (serverLink && !robloxServerLinkPattern.test(serverLink)) {
		return c.json({ error: 'The server link is invalid!' }, 400)
	}
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
	// change, so reserved rows keep only those. Open rows keep every badge, since they ask for it.
	const ownedBadgeNames = (robloxAccount?.badges ?? [])
		.filter((badge) => badge.owned)
		.map((badge) => badge.name)
	await database.query(`
		INSERT INTO searching_teams (
			searcher_id,
			roblox_username,
			team_table_rows,
			server_link,
			is_dandy_run,
			is_early_dyle,
			region,
			floor_goal
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (searcher_id) DO UPDATE SET
			roblox_username = excluded.roblox_username,
			team_table_rows = excluded.team_table_rows,
			server_link = excluded.server_link,
			is_dandy_run = excluded.is_dandy_run,
			is_early_dyle = excluded.is_early_dyle,
			region = excluded.region,
			floor_goal = excluded.floor_goal,
			joined_team_id = NULL,
			started_at = now(),
			last_heartbeat_at = now()
	`, [
		c.req.param('searcherId'),
		robloxAccount?.username ?? '',
		// Only the fields that matching reads are stored, since other players' searches read them
		JSON.stringify(body.teamTableRows.slice(0, 8).map((row): TeamTableRow => ({
			toonPicture: String(row.toonPicture),
			trinketAPicture: String(row.trinketAPicture),
			trinketBPicture: String(row.trinketBPicture),
			badgeNames: row.badgeNames
				.map(String)
				.filter((name) => !row.isReserved || ownedBadgeNames.includes(name)),
			roleNames: row.roleNames.map(String),
			isReserved: Boolean(row.isReserved),
			isLeftEmpty: Boolean(row.isLeftEmpty),
			joinedPlayer: null,
		}))),
		serverLink,
		Boolean(body.isDandyRun),
		Boolean(body.isEarlyDyle),
		String(body.region),
		String(body.floorGoal),
	])
	return c.body(null, 204)
})

// The searching page calls this every few seconds to stay in the search, to get merged with
// another search, and to learn who joined
teams.post('/:searcherId', async (c) => {
	const searcherId = c.req.param('searcherId')
	const client = await database.connect()
	try {
		await client.query('BEGIN')
		// Heartbeats run one at a time across every server, so two searches never take one row
		await client.query('SELECT pg_advisory_xact_lock(1)')
		// Browsers run the timers of a hidden tab only once a minute, and players switch to Roblox
		// while they wait, so a search only ends after 90 silent seconds
		await client.query(`
			DELETE FROM searching_teams WHERE last_heartbeat_at < now() - interval '90 seconds'
		`)
		const { rowCount } = await client.query(`
			UPDATE searching_teams SET last_heartbeat_at = now() WHERE searcher_id = $1
		`, [searcherId])
		if (!rowCount) {
			await client.query('COMMIT')
			return c.json({ error: 'The search stopped, click Find Players to search again' }, 404)
		}
		const { rows: searchingTeams } = await client.query<SearchingTeam>(`
			SELECT * FROM searching_teams ORDER BY started_at
		`)
		const teamsById = new Map(searchingTeams.map((team) => [team.searcher_id, team]))
		const changedTeams = new Set<SearchingTeam>()

		// Frees the rows of joined players who left, and puts players whose host left back into
		// the search
		for (const team of searchingTeams) {
			for (const row of team.team_table_rows) {
				const joiner = row.joinedPlayer && teamsById.get(row.joinedPlayer.searcherId)
				if (row.joinedPlayer && joiner?.joined_team_id !== team.searcher_id) {
					row.joinedPlayer = null
					changedTeams.add(team)
				}
			}
		}
		for (const team of searchingTeams) {
			const host = team.joined_team_id ? teamsById.get(team.joined_team_id) : undefined
			const isStillInHostTeam = host?.team_table_rows.some((row) => (
				row.joinedPlayer?.searcherId === team.searcher_id
			))
			if (team.joined_team_id && !isStillInHostTeam) {
				team.joined_team_id = null
				changedTeams.add(team)
			}
		}

		const me = teamsById.get(searcherId)!
		if (!me.joined_team_id) {
			for (const other of searchingTeams) {
				const areSettingsCompatible = other !== me
					&& !other.joined_team_id
					&& other.is_dandy_run === me.is_dandy_run
					&& other.is_early_dyle === me.is_early_dyle
					&& other.floor_goal === me.floor_goal
					&& (other.region === 'Any' || me.region === 'Any' || other.region === me.region)
					&& Boolean(other.server_link || me.server_link)
				if (!areSettingsCompatible) continue
				// The older search hosts when both ways fit, and a team that others already joined
				// can only host
				const hostAndJoinerPairs = [[other, me], [me, other]]
					.filter(([, joiner]) => !joiner.team_table_rows.some((row) => row.joinedPlayer))
				const merge = hostAndJoinerPairs
					.map(([host, joiner]) => ({
						host,
						joiner,
						rowIndexes: findOpenRowsForMembers({
							memberRows: memberRowsOf(joiner),
							team: host,
						}),
					}))
					// The host's players also have to fit the rows that the joiner asked for
					.find(({
						host, joiner, rowIndexes,
					}) => rowIndexes && findOpenRowsForMembers({
						memberRows: memberRowsOf(host),
						team: joiner,
					}))
				if (!merge) continue
				memberRowsOf(merge.joiner).forEach((row, index) => {
					merge.host.team_table_rows[merge.rowIndexes![index]].joinedPlayer = {
						searcherId: merge.joiner.searcher_id,
						robloxUsername: merge.joiner.roblox_username,
						row,
					}
				})
				merge.joiner.joined_team_id = merge.host.searcher_id
				merge.host.server_link ||= merge.joiner.server_link
				changedTeams.add(merge.host)
				changedTeams.add(merge.joiner)
				break
			}
		}

		for (const team of changedTeams) {
			await client.query(`
				UPDATE searching_teams
				SET team_table_rows = $2, joined_team_id = $3, server_link = $4
				WHERE searcher_id = $1
			`, [
				team.searcher_id,
				JSON.stringify(team.team_table_rows),
				team.joined_team_id,
				team.server_link,
			])
		}
		await client.query('COMMIT')
		const host = me.joined_team_id ? teamsById.get(me.joined_team_id)! : me
		return c.json({
			joinedPlayerUsernames: me.team_table_rows.map((row) => (
				row.joinedPlayer ? row.joinedPlayer.robloxUsername : null
			)),
			hasJoinedATeam: Boolean(me.joined_team_id),
			hostRobloxUsername: host.roblox_username,
			teamServerLink: host.server_link,
		})
	} catch (error) {
		await client.query('ROLLBACK')
		throw error
	} finally {
		client.release()
	}
})

// Cancel, or closing the tab, ends the search
teams.delete('/:searcherId', async (c) => {
	await database.query('DELETE FROM searching_teams WHERE searcher_id = $1', [
		c.req.param('searcherId'),
	])
	return c.body(null, 204)
})
