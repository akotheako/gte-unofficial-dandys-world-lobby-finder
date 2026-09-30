import { Hono } from 'hono'

export const online = new Hono()

// Each open page sends its random id every 15 seconds, and an id that is silent for 40 seconds
// counts as gone
const lastSeen = new Map<string, number>()

online.post('/', async (c) => {
	const { id } = await c.req.json<{ id: string }>()
	const now = Date.now()
	lastSeen.set(id, now)
	for (const [other, time] of lastSeen) {
		if (now - time > 40_000) lastSeen.delete(other)
	}
	return c.json({ count: lastSeen.size })
})
