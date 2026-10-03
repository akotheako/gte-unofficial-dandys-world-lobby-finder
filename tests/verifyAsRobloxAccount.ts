import type { BrowserContext } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { Hono } from 'hono'
import { setSignedCookie } from 'hono/cookie'

// Read without process.loadEnvFile, which would also put the real DATABASE_URL into process.env
const cookieSecret = parseEnv(readFileSync('.env', 'utf8')).COOKIE_SECRET!

// Makes a browser profile verified as a Roblox account, with the same signed "roblox" cookie that
// the server sets after a real verification, so the tests need no Roblox account. Without
// ownedBadgeNames, the cookie holds no badges, like right after verifying.
export async function verifyAsRobloxAccount({
	context,
	username,
	ownedBadgeNames,
}: {
	context: BrowserContext
	username: string
	ownedBadgeNames?: string[]
}) {
	const allBadgeNames = [
		'Speed Walker',
		'Long Distance Runner',
		'Marathon Runner',
		'Machine Enthusiast',
		'Machine Master',
		'THE Machine',
		'Clocked In',
		'Overtime',
		'Hissy Fit',
		'Just Keep Swimming',
		'Double Digits!',
		'Skilled Toon!',
		'Super Skilled Pro!',
		'Twisteds Fear Me.',
	]
	const cookieSigner = new Hono().get('/', async (c) => {
		await setSignedCookie(c, 'roblox', JSON.stringify({
			id: Math.floor(Math.random() * 1e9),
			username,
			badges: ownedBadgeNames && allBadgeNames.map((name) => ({
				name,
				owned: ownedBadgeNames.includes(name),
			})),
		}), cookieSecret)
		return c.body(null)
	})
	const setCookieHeader = (await cookieSigner.request('/')).headers.get('set-cookie')!
	await context.addCookies([{
		name: 'roblox',
		value: setCookieHeader.slice('roblox='.length).split(';')[0],
		url: 'http://localhost:3100',
	}])
}
