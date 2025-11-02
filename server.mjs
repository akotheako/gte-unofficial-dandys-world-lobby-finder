import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const app = new Hono()

// API routes
app.get('/api/hello', c => c.json({ ok: true, now: new Date().toISOString() }))

// static assets from SvelteKit build
app.use('/assets/*', serveStatic({ root: './build' }))
app.use('/favicon.ico', serveStatic({ root: './build' }))
app.use('/manifest.json', serveStatic({ root: './build' }))

// SPA fallback to index.html
const indexPath = join(__dirname, 'build', 'index.html')
app.get('*', c => {
	if (!existsSync(indexPath)) return c.text('Missing build/index.html. Run: npm run build', 503)
	return c.html(readFileSync(indexPath, 'utf8'))
})

serve({ fetch: app.fetch, port: 3000 })
