import { Hono } from 'hono'
import { database } from './database.ts'

export const online = new Hono()

// The table is created on the first request, so a new database needs no setup step
let tableIsCreated: Promise<unknown> | undefined
online.use(async (_c, next) => {
	tableIsCreated ??= database.query(`
		CREATE TABLE IF NOT EXISTS open_pages (
			page_id text PRIMARY KEY,
			last_seen_at timestamptz NOT NULL DEFAULT now()
		)
	`).catch((error) => {
		tableIsCreated = undefined
		throw error
	})
	await tableIsCreated
	await next()
})

// Each open page sends its random id every 15 seconds. Browsers run the timers of a hidden tab only
// once a minute, so an id counts as gone after 90 silent seconds.
online.post('/', async (c) => {
	const { id } = await c.req.json<{ id: string }>()
	await database.query(`
		INSERT INTO open_pages (page_id) VALUES ($1)
		ON CONFLICT (page_id) DO UPDATE SET last_seen_at = now()
	`, [String(id)])
	await database.query(`DELETE FROM open_pages WHERE last_seen_at < now() - interval '90 seconds'`)
	const { rows } = await database.query<{ count: number }>(`
		SELECT count(*)::int AS count FROM open_pages
	`)
	return c.json({ count: rows[0].count })
})
