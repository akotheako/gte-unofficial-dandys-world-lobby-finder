import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import type { LastFoundTeam } from '../shared/teamTypes.ts'
import type { FoundTeam } from './checkIn.ts'
import { database } from './database.ts'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

// A verified player can upvote every other verified player whom they played with in a found team,
// except between a player and a friend who opened their invite link, once per pair of accounts, and
// can take it back
export const upvotes = new Hono()

// The tables are created on the first request, so a new database needs no setup step
let tablesAreCreated: Promise<unknown> | undefined
upvotes.use(async (_c, next) => {
	tablesAreCreated ??= database.query(`
		CREATE TABLE IF NOT EXISTS upvotes (
			voter_roblox_user_id text NOT NULL,
			receiver_roblox_user_id text NOT NULL,
			upvoted_at timestamptz NOT NULL DEFAULT now(),
			PRIMARY KEY (voter_roblox_user_id, receiver_roblox_user_id)
		);
	`).catch((error) => {
		tablesAreCreated = undefined
		throw error
	})
	await tablesAreCreated
	await next()
})

// A player and a friend who opened their invite link know each other, so they cannot upvote each
// other
function canUpvote({
	foundTeam,
	voterRobloxUserId,
	receiverRobloxUserId,
}: {
	foundTeam: FoundTeam
	voterRobloxUserId: string
	receiverRobloxUserId: string
}) {
	const voter = foundTeam.verifiedPlayers.find((player) => (
		player.robloxUserId === voterRobloxUserId
	))
	const receiver = foundTeam.verifiedPlayers.find((player) => (
		player.robloxUserId === receiverRobloxUserId
	))
	return Boolean(voter && receiver)
		&& voterRobloxUserId !== receiverRobloxUserId
		&& receiver!.invitedByRobloxUserId !== voterRobloxUserId
		&& voter!.invitedByRobloxUserId !== receiverRobloxUserId
}

upvotes.get('/last-team', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	if (!cookie) return c.json(null satisfies LastFoundTeam | null)
	const robloxUserId = String((JSON.parse(cookie) as { id: number }).id)
	const { rows: [lastFound] } = await database.query<{ found_team: FoundTeam }>(`
		SELECT found_team FROM found_teams
		WHERE roblox_user_ids ? $1
		ORDER BY found_at DESC
		LIMIT 1
	`, [robloxUserId])
	if (!lastFound) return c.json(null satisfies LastFoundTeam | null)
	const foundTeam = lastFound.found_team
	const { rows: upvoted } = await database.query<{ receiver_roblox_user_id: string }>(`
		SELECT receiver_roblox_user_id FROM upvotes WHERE voter_roblox_user_id = $1
	`, [robloxUserId])
	// The query found the record by the user's id, so the user is one of its verified players
	const ownTeamId = foundTeam.verifiedPlayers.find((player) => (
		player.robloxUserId === robloxUserId
	))!.teamId
	const ownTable = foundTeam.tables.find((table) => table.teamId === ownTeamId)!
	return c.json({
		teamTableRows: ownTable.teamTableRows,
		playersInRows: ownTable.playersInRows,
		serverLink: foundTeam.serverLink,
		isDandyRun: foundTeam.isDandyRun,
		isEarlyDyle: foundTeam.isEarlyDyle,
		region: foundTeam.region,
		floorGoal: foundTeam.floorGoal,
		verifiedPlayers: foundTeam.verifiedPlayers
			.filter((player) => player.robloxUserId !== robloxUserId)
			.map((player) => ({
				robloxUserId: player.robloxUserId,
				robloxUsername: player.robloxUsername,
				canBeUpvoted: canUpvote({
					foundTeam,
					voterRobloxUserId: robloxUserId,
					receiverRobloxUserId: player.robloxUserId,
				}),
				inviteLinkSide: (() => {
					if (player.invitedByRobloxUserId === robloxUserId) return 'friend whom the user invited'
					const user = foundTeam.verifiedPlayers.find((other) => (
						other.robloxUserId === robloxUserId
					))!
					if (user.invitedByRobloxUserId === player.robloxUserId) return 'friend who invited the user'
					return null
				})(),
				isUpvoted: upvoted.some((upvote) => (
					upvote.receiver_roblox_user_id === player.robloxUserId
				)),
			})),
	} satisfies LastFoundTeam)
})

// Upvotes a player, which only counts once for each pair of accounts
upvotes.post('/', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	if (!cookie) return c.json({ error: 'Verify your Roblox account to upvote players' }, 401)
	const voterRobloxUserId = String((JSON.parse(cookie) as { id: number }).id)
	const { robloxUserId } = await c.req.json<{ robloxUserId: string }>()
	const receiverRobloxUserId = String(robloxUserId)
	const { rows: sharedFoundTeams } = await database.query<{ found_team: FoundTeam }>(`
		SELECT found_team FROM found_teams WHERE roblox_user_ids ? $1 AND roblox_user_ids ? $2
	`, [
		voterRobloxUserId,
		receiverRobloxUserId,
	])
	if (!sharedFoundTeams.some(({ found_team }) => canUpvote({
		foundTeam: found_team,
		voterRobloxUserId,
		receiverRobloxUserId,
	}))) {
		return c.json({ error: 'You can only upvote players from a team that you found' }, 403)
	}
	await database.query(`
		INSERT INTO upvotes (voter_roblox_user_id, receiver_roblox_user_id) VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, [voterRobloxUserId, receiverRobloxUserId])
	return c.body(null, 204)
})

// Takes an upvote back
upvotes.delete('/', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	if (!cookie) return c.json({ error: 'Verify your Roblox account to upvote players' }, 401)
	const voterRobloxUserId = String((JSON.parse(cookie) as { id: number }).id)
	const { robloxUserId } = await c.req.json<{ robloxUserId: string }>()
	await database.query(`
		DELETE FROM upvotes WHERE voter_roblox_user_id = $1 AND receiver_roblox_user_id = $2
	`, [voterRobloxUserId, String(robloxUserId)])
	return c.body(null, 204)
})
