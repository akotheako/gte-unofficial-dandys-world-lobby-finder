import { parseArgs } from 'node:util'

// Opens many fake pages that check in like the real page does, and prints how fast the server
// answered them. README.md explains how to run it against the test database.
const { values: options } = parseArgs({
	options: {
		url: {
			type: 'string',
			default: 'http://localhost:3100',
		},
		pages: {
			type: 'string',
			default: '200',
		},
		seconds: {
			type: 'string',
			default: '60',
		},
		// Share of the pages that search for players, which check in every 5 seconds
		searching: {
			type: 'string',
			default: '0.3',
		},
		// A load test fills the database of the site with fake teams, so any address other than
		// localhost has to be a preview deploy with the test database, never the real site
		remote: {
			type: 'boolean',
			default: false,
		},
	},
})
const siteUrl = new URL(options.url)
if (siteUrl.hostname !== 'localhost' && !options.remote) {
	throw new Error(`${siteUrl.origin} is not localhost. Add --remote only for a preview deploy that
uses the test database, never for the real site.`)
}
const pageCount = Number(options.pages)
const testEndsAt = Date.now() + Number(options.seconds) * 1000

const checkInMsList: number[] = []
const failures = new Map<string, number>()
let onThisPageCount = 0

await Promise.all(Array.from({ length: pageCount }, async (_, pageNumber) => {
	const pageId = crypto.randomUUID()
	const isSearching = pageNumber < pageCount * Number(options.searching)
	// A host who plays one row and looks for three players with any toon and trinket
	const team = isSearching
		? {
			teamTableRows: ['me', '', '', ''].map((reservedFor) => ({
				toonPicture: '',
				trinketAPicture: '',
				trinketBPicture: '',
				badgeNames: [],
				roleNames: [],
				isVerifiedPlayerRequired: false,
				reservedFor,
				isLeftEmpty: false,
			})),
			removedRobloxUsernames: [],
			missingToons: [],
			missingTrinkets: [],
			inviteCode: crypto.randomUUID(),
			serverLink: '',
			dandyRun: 'Any',
			earlyDyle: 'Any',
			region: ['Europe', 'Asia', 'North America'][pageNumber % 3],
			floorGoal: '10 to 100+',
			isFindingPlayers: true,
			searchId: crypto.randomUUID(),
			chosenSlot: [],
		}
		: null
	// Real pages open over time instead of all at once
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 15_000))
	while (Date.now() < testEndsAt) {
		const checkInStartedAt = Date.now()
		try {
			const answer = await fetch(new URL('/api/check-in', siteUrl), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pageId,
					team,
					invite: null,
					browse: null,
				}),
			})
			if (answer.ok) {
				checkInMsList.push(Date.now() - checkInStartedAt)
				onThisPageCount = (await answer.json() as { onThisPageCount: number }).onThisPageCount
			} else {
				const failure = `HTTP ${answer.status}`
				failures.set(failure, (failures.get(failure) ?? 0) + 1)
			}
		} catch (error) {
			const failure = (error as Error).message
			failures.set(failure, (failures.get(failure) ?? 0) + 1)
		}
		// The same waits as client/lobby/checkInWithServer.ts
		await new Promise((resolve) => setTimeout(
			resolve,
			isSearching ? 5_000 : Math.min(45_000, Math.max(15_000, onThisPageCount * 100)),
		))
	}
	await fetch(new URL('/api/check-in/leave', siteUrl), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ pageId }),
	}).catch(() => {})
}))

checkInMsList.sort((a, b) => a - b)
const percentile = (share: number) => checkInMsList[Math.floor((checkInMsList.length - 1) * share)]
console.log(`${pageCount} pages for ${options.seconds} seconds against ${siteUrl.origin}
Check-ins answered: ${checkInMsList.length}, ${
	(checkInMsList.length / Number(options.seconds)).toFixed(1)
} per second
Answer time: ${percentile(0.5)}ms median, ${percentile(0.95)}ms for the slowest 5%, ${
	checkInMsList.at(-1)
}ms at most
Failed check-ins: ${failures.size ? [...failures].map(([failure, count]) => `${count}× ${failure}`).join(', ') : 'none'}`)
