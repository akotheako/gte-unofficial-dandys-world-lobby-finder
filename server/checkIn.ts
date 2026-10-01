import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { badgeCategories } from '../shared/badgeCategories.ts'
import { robloxServerLinkPattern } from '../shared/robloxServerLinkPattern.ts'
import type { CheckInAnswer, PlayerInRow, TeamTableRow } from '../shared/teamTypes.ts'
import { database } from './database.ts'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

type StoredTeamTableRow = TeamTableRow & {
	// Player from another search who took this "Find player" row, with the row that describes them
	joinedPlayer: {
		teamId: string
		playerInRow: PlayerInRow
		row: TeamTableRow
	} | null
}

type Team = {
	team_id: string
	invite_code: string
	roblox_username: string
	team_table_rows: StoredTeamTableRow[]
	server_link: string
	is_dandy_run: boolean
	is_early_dyle: boolean
	region: string
	floor_goal: string
	is_searching: boolean
	joined_team_id: string | null
	started_at: Date
}

type InvitedFriend = {
	page_id: string
	team_id: string
	row_index: number
	roblox_username: string
	badge_names: string[]
}

// The player in a row of a team, with the row that describes them, or null for an open row
function playerInRowOf({
	team,
	rowIndex,
	invitedFriends,
}: {
	team: Team
	rowIndex: number
	invitedFriends: InvitedFriend[]
}): {
	row: TeamTableRow
	playerInRow: PlayerInRow
} | null {
	const row = team.team_table_rows[rowIndex]
	if (row.joinedPlayer) return row.joinedPlayer
	if (row.isLeftEmpty) return null
	if (row.playerChoice === 'me') {
		return {
			row,
			playerInRow: { robloxUsername: team.roblox_username },
		}
	}
	if (row.playerChoice === 'unverifiedFriend') {
		return {
			row,
			playerInRow: { unverifiedFriendOf: team.roblox_username },
		}
	}
	const friend = invitedFriends.find((invitedFriend) => (
		invitedFriend.team_id === team.team_id && invitedFriend.row_index === rowIndex
	))
	if (row.playerChoice === 'invitedFriend' && friend) {
		return {
			row: {
				...row,
				badgeNames: friend.badge_names,
			},
			playerInRow: { robloxUsername: friend.roblox_username },
		}
	}
	return null
}

// Players who are already in the team
function membersOf({
	team,
	invitedFriends,
}: {
	team: Team
	invitedFriends: InvitedFriend[]
}) {
	return team.team_table_rows.flatMap((_row, rowIndex) => {
		const member = playerInRowOf({
			team,
			rowIndex,
			invitedFriends,
		})
		return member ? [member] : []
	})
}

// Picks a different "Find player" row of the team for every member, or returns null when they
// cannot all fit. An empty Toon or Trinket cell means "(Any)" on both sides.
function findOpenRowsForMembers({
	memberRows,
	team,
}: {
	memberRows: TeamTableRow[]
	team: Team
}) {
	const rows = team.team_table_rows
	const openRowIndexes = rows.flatMap((row, index) => (
		!row.isLeftEmpty && row.playerChoice === 'findPlayer' && !row.joinedPlayer ? [index] : []
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

// Every open page checks in under its random page id every few seconds. The check-in counts the
// open pages, keeps the page's team on the server while it has an "Invite friend" row or searches,
// lets a page that opened an invite link join the inviting team, and merges searches that fit each
// other: the members of one search, the joiner, take "Find player" rows of the other, the host,
// and every player then gets the host's server link.
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
		CREATE TABLE IF NOT EXISTS invited_friends (
			page_id text PRIMARY KEY,
			team_id text NOT NULL,
			row_index int NOT NULL,
			roblox_username text NOT NULL,
			badge_names jsonb NOT NULL
		);
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
		// The page's own table, sent while it has an "Invite friend" row or searches
		team: {
			teamTableRows: TeamTableRow[]
			inviteCode: string
			serverLink: string
			isDandyRun: boolean
			isEarlyDyle: boolean
			region: string
			floorGoal: string
			isFindingPlayers: boolean
		} | null
		// The invite link that the page was opened with
		invite: {
			inviteCode: string
			rowIndex: number
		} | null
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
			DELETE FROM invited_friends WHERE page_id NOT IN (SELECT page_id FROM open_pages);
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
			// A running search keeps its rows, which hold the players who joined it, since the
			// table cannot change while it runs
			if (!savedTeam?.is_searching || !sentTeam.isFindingPlayers) {
				await client.query(`
					INSERT INTO teams (
						team_id,
						invite_code,
						roblox_username,
						team_table_rows,
						server_link,
						is_dandy_run,
						is_early_dyle,
						region,
						floor_goal,
						is_searching
					)
					VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
					ON CONFLICT (team_id) DO UPDATE SET
						invite_code = excluded.invite_code,
						roblox_username = excluded.roblox_username,
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
					// Only the fields that matching reads are stored, since other players see them
					JSON.stringify(sentTeam.teamTableRows.slice(0, 8).map((row): StoredTeamTableRow => {
						const playerChoice = (['me', 'unverifiedFriend', 'invitedFriend'] as const)
							.find((choice) => choice === row.playerChoice) ?? 'findPlayer'
						const badgeNames = row.badgeNames.map(String)
						return {
							toonPicture: String(row.toonPicture),
							trinketAPicture: String(row.trinketAPicture),
							trinketBPicture: String(row.trinketBPicture),
							// A "Find player" row asks for its badges. The user's own row keeps only
							// badges that Roblox confirmed, an invited friend brings their own badges
							// when they join, and nobody can confirm an unverified friend's badges.
							badgeNames: {
								findPlayer: badgeNames,
								me: badgeNames.filter((name) => ownedBadgeNames.includes(name)),
								unverifiedFriend: [],
								invitedFriend: [],
							}[playerChoice],
							roleNames: row.roleNames.map(String),
							playerChoice,
							isLeftEmpty: Boolean(row.isLeftEmpty),
							joinedPlayer: null,
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
			const rowIndex = Number(body.invite.rowIndex)
			const row = invitingTeam?.team_table_rows[rowIndex]
			const { rows: [friendInRow] } = await client.query<InvitedFriend>(`
				SELECT * FROM invited_friends WHERE team_id = $1 AND row_index = $2
			`, [invitingTeam?.team_id ?? '', rowIndex])
			const hasJoined = friendInRow?.page_id === pageId
			if (!row || row.isLeftEmpty || row.playerChoice !== 'invitedFriend') {
				error = hasJoined ? 'The host took you out of the team' : 'This invite link expired'
			} else if (!robloxAccount) {
				error = 'Verify your Roblox account to join the team that invited you'
			} else if (invitingTeam.team_id === pageId) {
				error = 'This invite link is for a friend, send it to them'
			} else if (friendInRow && !hasJoined) {
				error = 'Someone else already joined with this invite link'
			} else if (!hasJoined && invitingTeam.is_searching) {
				error = 'The team already started finding players'
			} else {
				await client.query(`
					INSERT INTO invited_friends (page_id, team_id, row_index, roblox_username, badge_names)
					VALUES ($1, $2, $3, $4, $5)
					ON CONFLICT (page_id) DO UPDATE SET
						team_id = excluded.team_id,
						row_index = excluded.row_index,
						roblox_username = excluded.roblox_username,
						badge_names = excluded.badge_names
				`, [
					pageId,
					invitingTeam.team_id,
					rowIndex,
					robloxAccount.username,
					JSON.stringify(ownedBadgeNames),
				])
				invitingTeamId = invitingTeam.team_id
			}
		}
		if (!invitingTeamId) {
			await client.query('DELETE FROM invited_friends WHERE page_id = $1', [pageId])
		}

		const { rows: teams } = await client.query<Team>('SELECT * FROM teams ORDER BY started_at')
		const { rows: invitedFriends } = await client.query<InvitedFriend>(`
			SELECT * FROM invited_friends
		`)
		const teamsById = new Map(teams.map((team) => [team.team_id, team]))
		const changedTeams = new Set<Team>()

		// Frees the rows of joined players who left, and puts players whose host left back into
		// the search
		for (const team of teams) {
			for (const row of team.team_table_rows) {
				const joiner = row.joinedPlayer && teamsById.get(row.joinedPlayer.teamId)
				if (row.joinedPlayer && joiner?.joined_team_id !== team.team_id) {
					row.joinedPlayer = null
					changedTeams.add(team)
				}
			}
		}
		for (const team of teams) {
			const host = team.joined_team_id ? teamsById.get(team.joined_team_id) : undefined
			const isStillInHostTeam = host?.is_searching && host.team_table_rows.some((row) => (
				row.joinedPlayer?.teamId === team.team_id
			))
			if (team.joined_team_id && !isStillInHostTeam) {
				team.joined_team_id = null
				changedTeams.add(team)
			}
		}

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
				if (!areSettingsCompatible) continue
				// The older search hosts when both ways fit, and a team that others already joined
				// can only host
				const merge = [[other, myTeam], [myTeam, other]]
					.filter(([, joiner]) => !joiner.team_table_rows.some((row) => row.joinedPlayer))
					.map(([host, joiner]) => {
						const joiningMembers = membersOf({
							team: joiner,
							invitedFriends,
						})
						return {
							host,
							joiner,
							joiningMembers,
							rowIndexes: findOpenRowsForMembers({
								memberRows: joiningMembers.map((member) => member.row),
								team: host,
							}),
						}
					})
					// The host's players also have to fit the rows that the joiner asked for
					.find(({
						host, joiner, rowIndexes,
					}) => rowIndexes && findOpenRowsForMembers({
						memberRows: membersOf({
							team: host,
							invitedFriends,
						}).map((member) => member.row),
						team: joiner,
					}))
				if (!merge) continue
				merge.joiningMembers.forEach((member, index) => {
					merge.host.team_table_rows[merge.rowIndexes![index]].joinedPlayer = {
						teamId: merge.joiner.team_id,
						...member,
					}
				})
				merge.joiner.joined_team_id = merge.host.team_id
				merge.host.server_link ||= merge.joiner.server_link
				changedTeams.add(merge.host)
				changedTeams.add(merge.joiner)
				break
			}
		}

		for (const team of changedTeams) {
			await client.query(`
				UPDATE teams SET team_table_rows = $2, joined_team_id = $3, server_link = $4
				WHERE team_id = $1
			`, [
				team.team_id,
				JSON.stringify(team.team_table_rows),
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
		const isTeamFound = Boolean(shownTeam?.is_searching && (
			shownTeam.joined_team_id || shownTeam.team_table_rows.some((row) => row.joinedPlayer)
		))
		return c.json({
			...counts,
			error,
			invitingTeam: invitingTeamId && shownTeam ? {
				// Each taken row shows the player in it, such as the friend with the badges that they
				// brought, and each open row shows what it asks for
				teamTableRows: shownTeam.team_table_rows.map((row, rowIndex) => playerInRowOf({
					team: shownTeam,
					rowIndex,
					invitedFriends,
				})?.row ?? row),
				isDandyRun: shownTeam.is_dandy_run,
				isEarlyDyle: shownTeam.is_early_dyle,
				region: shownTeam.region,
				floorGoal: shownTeam.floor_goal,
				hostRobloxUsername: shownTeam.roblox_username,
			} : null,
			shownTeamStatus: shownTeam && finalHost ? {
				playersInRows: shownTeam.team_table_rows.map((_row, rowIndex) => playerInRowOf({
					team: shownTeam,
					rowIndex,
					invitedFriends,
				})?.playerInRow ?? null),
				isSearching: shownTeam.is_searching,
				hasJoinedATeam: Boolean(shownTeam.joined_team_id),
				hostRobloxUsername: finalHost.roblox_username,
				teamServerLink: isTeamFound ? finalHost.server_link : '',
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
	await database.query('DELETE FROM invited_friends WHERE page_id = $1', [String(pageId)])
	return c.body(null, 204)
})
