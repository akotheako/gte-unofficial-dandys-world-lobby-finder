import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { images } from './images.ts'
import { roblox } from './roblox.ts'

// Instantiate app:
export const app = new Hono()

// Set API routes:
app.route('/api/roblox', roblox)
app.route('/api/images', images)

// Set frontend route:
app.use('/*', serveStatic({ root: './dist' }))

// Start server, except on Vercel, which serves dist itself and runs the app through api/:
if (!process.env.VERCEL) {
	const port = Number(process.env.PORT ?? 3000)
	serve({
		fetch: app.fetch,
		port,
	}, () => {
		console.log(`Server listening on http://localhost:${port}`)
	})
}
