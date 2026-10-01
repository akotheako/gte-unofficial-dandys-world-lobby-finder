import { Hono } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'

const cookieSecret = process.env.COOKIE_SECRET
if (!cookieSecret) throw new Error('COOKIE_SECRET is not set, see README.md')

// A user proves that they own a Roblox account by putting a code into its profile description,
// which only the owner can edit.
export const roblox = new Hono()

// Every page load gets a new code, which the check then compares with the profile.
// The code stays in a signed cookie, so nobody can claim an account with a code from its bio.
roblox.get('/code', async (c) => {
	// Roblox's filter hides numbers and odd strings in descriptions, so the code uses emojis.
	// 8 emojis out of 31 give about 850 billion possible codes.
	// Each emoji is one code point, since emojis with a variation selector can change on the way.
	const emojis = [
		'🌈', '✨', '🌸', '🌻', '🍓', '🍒', '🦋', '🐝', '🐞', '🍄', '🌙', '⭐', '💖', '💜', '💙', '💚',
		'💛', '🧡', '🎀', '🍭', '🍬', '🧁', '🍰', '🐰', '🐶', '🦄', '🐣', '🌷', '🌼', '🍀', '🫧',
	]
	const emojiCode = Array.from(
		crypto.getRandomValues(new Uint32Array(8)),
		(n) => emojis[n % emojis.length],
	).join('')
	// The sentence tells anyone who pastes the code that it verifies their account for GTE.
	const code = `This is my verification code for DW Team Finder! ${emojiCode}`
	await setSignedCookie(c, 'roblox_code', code, cookieSecret, {
		httpOnly: true,
		sameSite: 'Lax',
		maxAge: 60 * 30,
	})
	return c.json({ code })
})

roblox.post('/check', async (c) => {
	const code = await getSignedCookie(c, cookieSecret, 'roblox_code')
	if (!code) return c.json({ error: 'The code expired, reload the page' }, 400)
	const { username } = await c.req.json() as { username: string }
	const lookupRes = await fetch('https://users.roblox.com/v1/usernames/users', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			usernames: [username],
			excludeBannedUsers: true,
		}),
	})
	const { data } = await lookupRes.json() as {
		data: {
			id: number
			name: string
		}[]
	}
	if (!data?.length) return c.json({ error: 'No Roblox account has that username' }, 404)
	const profileRes = await fetch(`https://users.roblox.com/v1/users/${data[0].id}`)
	const { description } = await profileRes.json() as { description: string }
	if (!description?.includes(code)) {
		return c.json({ error: 'The code is not in your profile description yet' }, 400)
	}
	deleteCookie(c, 'roblox_code')
	const user = {
		id: data[0].id,
		username: data[0].name,
	}
	await setSignedCookie(c, 'roblox', JSON.stringify(user), cookieSecret, {
		httpOnly: true,
		sameSite: 'Lax',
		maxAge: 60 * 60 * 24 * 30,
	})
	return c.json(user)
})

roblox.get('/me', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	return c.json(cookie ? JSON.parse(cookie) : null)
})

// Parallel requests for one user share one check, because each check makes 15 Roblox requests.
const badgeChecks = new Map<number, Promise<{
	name: string
	owned: boolean
}[] | 'private'>>()

roblox.get('/badges', async (c) => {
	const cookie = await getSignedCookie(c, cookieSecret, 'roblox')
	if (!cookie) return c.json({ error: 'Verify your Roblox account first' }, 401)
	const user = JSON.parse(cookie) as {
		id: number
		username: string
		badges?: {
			name: string
			owned: boolean
		}[]
	}
	// The badges stay in the session cookie, and only the Update Badges button fetches them again
	if (user.badges && c.req.query('refresh') === undefined) return c.json(user.badges)
	let check = badgeChecks.get(user.id)
	if (!check) {
		check = (async () => {
			const inventory = `https://inventory.roblox.com/v1/users/${user.id}`
			const privacyRes = await fetch(`${inventory}/can-view-inventory`)
			if (!privacyRes.ok) throw new Error(`Roblox answered ${privacyRes.status}`)
			const { canView } = await privacyRes.json() as { canView: boolean }
			if (!canView) return 'private'
			// Dandy's World badges, read from the inventory API, because the badge API needs a login.
			// The badges are checked one at a time, because Roblox answers 429 to bursts.
			const badges = []
			for (const [badgeId, name] of [
				[877623959683599, 'Speed Walker'],
				[2621659595090283, 'Long Distance Runner'],
				[3453094775464298, 'Marathon Runner'],
				[3631798460232143, 'Machine Enthusiast'],
				[3650915651794012, 'Machine Master'],
				[722525313992174, 'THE Machine'],
				[3784664997676455, 'Clocked In'],
				[1455062180787768, 'Overtime'],
				[2656794558205839, 'Hissy Fit'],
				[2571896086842758, 'Just Keep Swimming'],
				[1032245889618935, 'Double Digits!'],
				[4450190261193609, 'Skilled Toon!'],
				[2154751145157776, 'Super Skilled Pro!'],
				[489243865301208, 'Twisteds Fear Me.'],
			] as const) {
				const res = await fetch(`${inventory}/items/Badge/${badgeId}`)
				if (!res.ok) throw new Error(`Roblox answered ${res.status}`)
				const { data } = await res.json() as { data: unknown[] }
				badges.push({
					name,
					owned: data.length > 0,
				})
			}
			return badges
		})()
		badgeChecks.set(user.id, check)
		// Both callbacks, because a rejection that nothing handles would crash the server
		check.then(() => badgeChecks.delete(user.id), () => badgeChecks.delete(user.id))
	}
	try {
		const badges = await check
		if (badges === 'private') {
			return c.json({ error: 'Make your Roblox inventory public to show your badges' }, 403)
		}
		await setSignedCookie(c, 'roblox', JSON.stringify({
			...user,
			badges,
		}), cookieSecret, {
			httpOnly: true,
			sameSite: 'Lax',
			maxAge: 60 * 60 * 24 * 30,
		})
		return c.json(badges)
	} catch {
		return c.json({ error: 'Roblox is busy right now, try again in a minute' }, 503)
	}
})

roblox.post('/logout', (c) => {
	deleteCookie(c, 'roblox')
	return c.body(null, 204)
})
