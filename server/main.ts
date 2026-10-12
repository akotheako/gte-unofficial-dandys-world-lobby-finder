import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { checkIn } from './checkIn.ts'
import { images } from './images.ts'
import { reports } from './reports.ts'
import { roblox } from './roblox.ts'
import { upvotes } from './upvotes.ts'

// Instantiate app:
export const app = new Hono()

// Every crashed request goes into the log with its route, which Vercel shows under Logs
app.onError((error, c) => {
	console.error(`${c.req.method} ${c.req.path} failed:`, error)
	return c.text('Internal Server Error', 500)
})

// Set API routes:
app.route('/api/roblox', roblox)
app.route('/api/check-in', checkIn)
app.route('/api/images', images)
app.route('/api/upvotes', upvotes)
app.route('/api/reports', reports)

// Serve the frontend and start the server, except on Vercel, which serves dist itself and runs
// the app through api/:
if (!process.env.VERCEL) {
	app.use('/*', serveStatic({ root: './dist' }))
	const port = Number(process.env.PORT ?? 3000)
	serve({
		fetch: app.fetch,
		port,
	}, () => {
		console.log(`Server listening on http://localhost:${port}`)
	})
}
