import { createHmac } from 'node:crypto'
import { Hono } from 'hono'
import { getSignedCookie } from 'hono/cookie'
import { reportsReaderRobloxUserId, type Report } from '../shared/reports.ts'
import { database } from './database.ts'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

// Messages from the Contact/Report window, which the owner of the site reads in the Reports window
export const reports = new Hono()

// The tables are created on the first request, so a new database needs no setup step
let tablesAreCreated: Promise<unknown> | undefined
reports.use(async (_c, next) => {
	tablesAreCreated ??= database.query(`
		CREATE TABLE IF NOT EXISTS reports (
			id serial PRIMARY KEY,
			topic text NOT NULL,
			message text NOT NULL,
			roblox_user_id text,
			roblox_username text,
			sent_at timestamptz NOT NULL DEFAULT now()
		);
		ALTER TABLE reports ADD COLUMN IF NOT EXISTS sender_ip_hash text;
	`).catch((error) => {
		tablesAreCreated = undefined
		throw error
	})
	await tablesAreCreated
	await next()
})

reports.post('/', async (c) => {
	const {
		topic,
		message,
	} = await c.req.json<{
		topic: string
		message: string
	}>()
	// Bugs in the game and players are reported on the official Discord server instead
	if (!['Report a bug in the website', 'Other'].includes(topic)) {
		return c.json({ error: 'This form is only for issues about this website' }, 400)
	}
	if (typeof message !== 'string' || !message.trim()) {
		return c.json({ error: 'Write a message first' }, 400)
	}
	if (message.length > 2000) {
		return c.json({ error: 'The message is longer than 2000 characters' }, 400)
	}
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	const robloxAccount = cookie
		? JSON.parse(cookie) as {
			id: number
			username: string
		}
		: null
	// Vercel sets x-forwarded-for itself, so a sender cannot fake it. The IP address is only kept
	// as a hash, which is enough to recognize the same sender again.
	const senderIp = c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? ''
	const senderIpHash = createHmac('sha256', cookieSecret).update(senderIp).digest('hex')
	const { rowCount } = await database.query(`
		INSERT INTO reports (topic, message, roblox_user_id, roblox_username, sender_ip_hash)
		SELECT $1, $2, $3, $4, $5
		WHERE NOT EXISTS (
			SELECT 1 FROM reports
			WHERE sender_ip_hash = $5 AND sent_at > now() - interval '1 minute'
		)
	`, [
		topic,
		message,
		robloxAccount ? String(robloxAccount.id) : null,
		robloxAccount?.username ?? null,
		senderIpHash,
	])
	if (!rowCount) {
		return c.json({ error: 'You can only send one report per minute. Please try again soon.' }, 429)
	}
	return c.body(null, 204)
})

// Lists every report, newest first, for the Reports window of the site's owner
reports.get('/', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	if (!cookie || (JSON.parse(cookie) as { id: number }).id !== reportsReaderRobloxUserId) {
		return c.json({ error: 'Only the owner of the site can read the reports' }, 403)
	}
	const { rows } = await database.query<{
		id: number
		topic: string
		message: string
		roblox_username: string | null
		sent_at: Date
	}>(`
		SELECT id, topic, message, roblox_username, sent_at FROM reports ORDER BY sent_at DESC
	`)
	return c.json(rows.map((row) => ({
		id: row.id,
		topic: row.topic,
		message: row.message,
		robloxUsername: row.roblox_username,
		sentAt: row.sent_at.toISOString(),
	})) satisfies Report[])
})
