import type { QueryResult } from '@neondatabase/serverless'
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
	// Empty for a host who did not verify. Upvotes go by the id, since a username can change.
	roblox_user_id: string
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
	roblox_user_id: string
	roblox_username: string
	badge_names: string[]
}

// Record of a team that got together, as the found_teams table stores it
export type FoundTeam = {
	serverLink: string
	isDandyRun: boolean
	isEarlyDyle: boolean
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
				// Marathon Runner for Speed Walker. "Verified only" counts only for a team whose host
				// is verified, since only they can see the checkbox.
				&& (!row.isVerifiedPlayerRequired
					|| !team.roblox_username
					|| (player.isVerified && row.badgeNames.every((wanted) => {
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
		ALTER TABLE teams ADD COLUMN IF NOT EXISTS roblox_user_id text NOT NULL DEFAULT '';
		ALTER TABLE verified_friends ADD COLUMN IF NOT EXISTS roblox_user_id text NOT NULL DEFAULT '';
		-- Record of every team that got together, which Upvote Players shows
		CREATE TABLE IF NOT EXISTS found_teams (
			found_team_id text PRIMARY KEY,
			found_at timestamptz NOT NULL DEFAULT now(),
			roblox_user_ids jsonb NOT NULL,
			found_team jsonb NOT NULL
		);
		ALTER TABLE found_teams DROP COLUMN IF EXISTS page_ids;
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
			SELECT now() AS "transactionTime", count(*)::int AS "onThisPageCount" FROM open_pages;
			SELECT * FROM teams ORDER BY started_at;
			SELECT * FROM verified_friends;
		`) as unknown as QueryResult[]
		const [{ rows: [{
			transactionTime,
			onThisPageCount,
		}] }, { rows: teams }, { rows: verifiedFriends }] = readResults.slice(-3) as [
			QueryResult<{
				transactionTime: Date
				onThisPageCount: number
			}>,
			QueryResult<Team>,
			QueryResult<VerifiedFriend>,
		]

		const sentTeam = body.team
		const serverLink = String(sentTeam?.serverLink ?? '').trim()
		if (sentTeam?.isFindingPlayers && serverLink && !robloxServerLinkPattern.test(serverLink)) {
			error = 'The server link is invalid!'
		}
		const savedTeamIndex = teams.findIndex((team) => team.team_id === pageId)
		if (!sentTeam || error) {
			if (savedTeamIndex !== -1) teams.splice(savedTeamIndex, 1)
			writes.push(`DELETE FROM teams WHERE team_id = ${sqlLiteral(pageId)}`)
		// A running search keeps the team that it joined and its place in the queue, since the
		// table cannot change while it runs
		} else if (!teams[savedTeamIndex]?.is_searching || !sentTeam.isFindingPlayers) {
			const team: Team = {
				team_id: pageId,
				invite_code: String(sentTeam.inviteCode),
				roblox_user_id: robloxAccount ? String(robloxAccount.id) : '',
				roblox_username: robloxAccount?.username ?? '',
				roblox_badge_names: ownedBadgeNames,
				removed_roblox_usernames: sentTeam.removedRobloxUsernames.slice(0, 100).map(String),
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
				is_dandy_run: Boolean(sentTeam.isDandyRun),
				is_early_dyle: Boolean(sentTeam.isEarlyDyle),
				region: String(sentTeam.region),
				floor_goal: String(sentTeam.floorGoal),
				is_searching: Boolean(sentTeam.isFindingPlayers),
				joined_team_id: null,
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
					team_table_rows,
					server_link,
					is_dandy_run,
					is_early_dyle,
					region,
					floor_goal,
					is_searching
				)
				VALUES (
					${sqlLiteral(team.team_id)},
					${sqlLiteral(team.invite_code)},
					${sqlLiteral(team.roblox_user_id)},
					${sqlLiteral(team.roblox_username)},
					${sqlLiteral(team.roblox_badge_names)},
					${sqlLiteral(team.removed_roblox_usernames)},
					${sqlLiteral(team.team_table_rows)},
					${sqlLiteral(team.server_link)},
					${team.is_dandy_run},
					${team.is_early_dyle},
					${sqlLiteral(team.region)},
					${sqlLiteral(team.floor_goal)},
					${team.is_searching}
				)
				ON CONFLICT (team_id) DO UPDATE SET
					invite_code = excluded.invite_code,
					roblox_user_id = excluded.roblox_user_id,
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
				// The host is the search whose server link everyone uses, so it needs a link. The
				// older search hosts when both ways fit, and a search that others already joined can
				// only host.
				const [olderTeam, newerTeam] = other.started_at <= myTeam.started_at
					? [other, myTeam]
					: [myTeam, other]
				const merge = [[olderTeam, newerTeam], [newerTeam, olderTeam]]
					.filter(([host, joiner]) => host.server_link && mergedTeamOf(joiner).length === 1)
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
				changedTeams.add(merge.host)
				changedTeams.add(merge.joiner)

				// Every merge into the same search of the host updates one record
				const mergedTeam = mergedTeamOf(merge.host)
				const players = allPlayersOf(mergedTeam)
				const verifiedPlayers = players.flatMap((player) => (
					player.robloxUserId && 'robloxUsername' in player.playerInRow ? [{
						robloxUserId: player.robloxUserId,
						robloxUsername: player.playerInRow.robloxUsername,
						invitedByRobloxUserId: player.invitedByRobloxUserId,
						teamId: player.teamId,
					}] : []
				))
				const foundTeam: FoundTeam = {
					serverLink: merge.host.server_link,
					isDandyRun: merge.host.is_dandy_run,
					isEarlyDyle: merge.host.is_early_dyle,
					region: merge.host.region,
					floorGoal: merge.host.floor_goal,
					tables: mergedTeam.map((team) => ({
						teamId: team.team_id,
						teamTableRows: team.team_table_rows,
						playersInRows: (placePlayersInRows({
							players,
							team,
							teamsById,
						}) ?? []).map((player) => player?.playerInRow ?? null),
					})),
					verifiedPlayers,
				}
				writes.push(`
					INSERT INTO found_teams (found_team_id, roblox_user_ids, found_team)
					VALUES (
						${sqlLiteral(`${merge.host.team_id} ${merge.host.started_at.toISOString()}`)},
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
					server_link = ${sqlLiteral(team.server_link)}
				WHERE team_id = ${sqlLiteral(team.team_id)}
			`)
		}
		await client.query([...writes, 'COMMIT'].join(';\n'))
		const counts = {
			onThisPageCount,
			findingPlayersCount: teams.filter((team) => (
				team.is_searching && !team.joined_team_id
			)).length,
		}

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
			isVerificationNeededToJoin,
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
				hostRowIndex: playersInShownRows?.findIndex((player) => (
					player?.isHost && player.teamId === shownTeam.team_id
				)) ?? -1,
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
