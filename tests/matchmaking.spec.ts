import {
	expect,
	test,
	type Browser,
	type Page,
} from '@playwright/test'
import type { TeamTableRow } from '../shared/teamTypes.ts'
import { allowClipboard } from './allowClipboard.ts'
import { connectToTestDatabase } from './testDatabase.ts'
import { verifyAsRobloxAccount } from './verifyAsRobloxAccount.ts'

const serverLinkA = 'https://www.roblox.com/share?code=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&type=Server'
const serverLinkB = 'https://www.roblox.com/share?code=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb&type=Server'

// A search left over from another test would merge with the searches of this one
test.beforeEach(async ({ request }) => {
	// Any check-in route creates the tables of a new database
	await request.post('/api/check-in/leave', { data: { pageId: 'creates-the-tables' } })
	const testDatabase = connectToTestDatabase()
	// The check-ins' lock, since deletes beside a check-in deadlock with it
	await testDatabase.query(`
		BEGIN;
		SELECT pg_advisory_xact_lock(1);
		DELETE FROM teams;
		DELETE FROM verified_friends;
		DELETE FROM open_pages;
		COMMIT;
	`)
	await testDatabase.end()
})

// Opens Find a Team in a new browser profile with a table of the given rows, where every row that
// is not given is "(Leave Empty)", runs prepareBeforeSearch, and clicks Find Players
async function startSearch({
	browser,
	username,
	ownedBadgeNames,
	rows,
	serverLink,
	region,
	floorGoal,
	isDandyRun,
	prepareBeforeSearch,
}: {
	browser: Browser
	username?: string
	ownedBadgeNames?: string[]
	rows: Partial<TeamTableRow>[]
	serverLink?: string
	region?: string
	floorGoal?: string
	isDandyRun?: boolean
	prepareBeforeSearch?: (page: Page) => Promise<void>
}) {
	const context = await browser.newContext()
	await allowClipboard(context)
	if (username) {
		await verifyAsRobloxAccount({
			context,
			username,
			ownedBadgeNames: ownedBadgeNames ?? [],
		})
	}
	const teamTable: TeamTableRow[] = Array.from({ length: 8 }, (_, index) => ({
		toonPicture: '',
		trinketAPicture: '',
		trinketBPicture: '',
		badgeNames: [],
		roleNames: ['Extractor'],
		isVerifiedPlayerRequired: false,
		reservedFor: '',
		isLeftEmpty: index >= rows.length,
		...rows[index],
	}))
	await context.addInitScript((savedValues) => {
		if (sessionStorage.getItem('isSeeded')) return
		sessionStorage.setItem('isSeeded', 'true')
		for (const [key, value] of Object.entries(savedValues)) localStorage.setItem(key, value)
	}, {
		team: JSON.stringify(teamTable),
		serverLink: serverLink ?? '',
		region: region ?? 'Any',
		floorGoal: floorGoal ?? '50',
		dandyRun: String(isDandyRun ?? false),
	})
	const page = await context.newPage()
	await page.goto('/')
	await page.locator('#team-icon').click()
	await prepareBeforeSearch?.(page)
	await page.locator('#team-find button').click()
	// In slow motion, the search can merge before the check, and then the button reads Leave Team
	await expect(page.locator('#team-find button'))
		.toHaveText(/^(Finding Players \(Click to Cancel\)|Leave Team)$/)
	return page
}

const meAndOneOpenRow: Partial<TeamTableRow>[] = [
	{ reservedFor: 'me' },
	{},
]

test('two fitting searches merge, and the older one hosts with its link', async ({ browser }) => {
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	const joinerPage = await startSearch({
		browser,
		username: 'JoinerPlayer',
		rows: meAndOneOpenRow,
	})
	await expect(hostPage.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
	await expect(hostPage.locator('#team-found'))
		.toContainText('Players joined your team! Everyone meets in this server:')
	await expect(hostPage.locator('#team-found a')).toHaveText(serverLinkA)
	await expect(joinerPage.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
	await expect(joinerPage.locator('#team-found'))
		.toContainText('The host is @HostPlayer. Everyone, join their server!')
	await expect(joinerPage.locator('#team-found a')).toHaveText(serverLinkA)
	await expect(joinerPage.locator('#team-find button')).toHaveText('Leave Team')
	await expect(hostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@JoinerPlayer)')
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('(@HostPlayer)')
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('a host without a link gets the joiner\'s link', async ({ browser }) => {
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndOneOpenRow,
	})
	const joinerPage = await startSearch({
		browser,
		username: 'JoinerPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkB,
	})
	await expect(hostPage.locator('#team-found a')).toHaveText(serverLinkB, { timeout: 20_000 })
	await expect(joinerPage.locator('#team-found a')).toHaveText(serverLinkB, { timeout: 20_000 })
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('a search without a link shows the hint, and two such searches never merge', async ({
	browser,
}) => {
	const firstPage = await startSearch({
		browser,
		username: 'FirstPlayer',
		rows: meAndOneOpenRow,
	})
	await expect(firstPage.locator('#team-server-link-hint')).not.toHaveClass('team-invisible')
	const secondPage = await startSearch({
		browser,
		username: 'SecondPlayer',
		rows: meAndOneOpenRow,
	})
	await firstPage.waitForTimeout(12_000)
	await expect(firstPage.locator('#team-found')).not.toHaveAttribute('open')
	await expect(secondPage.locator('#team-found')).not.toHaveAttribute('open')
	await firstPage.context().close()
	await secondPage.context().close()
})

for (const {
	difference,
	first,
	second,
} of [
		{
			difference: 'Floor goal',
			first: { floorGoal: '50' },
			second: { floorGoal: '60' },
		},
		{
			difference: 'Region',
			first: { region: 'Asia' },
			second: { region: 'Europe' },
		},
		{
			difference: 'Dandy Run',
			first: { isDandyRun: true },
			second: { isDandyRun: false },
		},
		{
			difference: 'number of rows',
			first: { rows: meAndOneOpenRow },
			second: {
				rows: [
					...meAndOneOpenRow,
					{},
				],
			},
		},
		{
			difference: 'toon',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ toonPicture: 'bobette.png' },
				],
			},
			second: {
				rows: [
					{
						reservedFor: 'me',
						toonPicture: 'vee.png',
					},
					{},
				],
			},
		},
		{
			difference: 'role',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ roleNames: ['Distracts Pebble'] },
				],
			},
			second: { rows: meAndOneOpenRow },
		},
	] as {
		difference: string
		first: Partial<Parameters<typeof startSearch>[0]>
		second: Partial<Parameters<typeof startSearch>[0]>
	}[]) {
	test(`searches with a different ${difference} do not merge`, async ({ browser }) => {
		const firstPage = await startSearch({
			browser,
			username: 'FirstPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkA,
			...first,
		})
		const secondPage = await startSearch({
			browser,
			username: 'SecondPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkB,
			...second,
		})
		await firstPage.waitForTimeout(12_000)
		await expect(firstPage.locator('#team-found')).not.toHaveAttribute('open')
		await expect(secondPage.locator('#team-found')).not.toHaveAttribute('open')
		await firstPage.context().close()
		await secondPage.context().close()
	})
}

for (const {
	match,
	first,
	second,
} of [
		{
			match: 'a Region of Any matches every region',
			first: { region: 'Any' },
			second: { region: 'Europe' },
		},
		{
			match: 'a matching toon fits',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ toonPicture: 'bobette.png' },
				],
			},
			second: {
				rows: [
					{
						reservedFor: 'me',
						toonPicture: 'bobette.png',
					},
					{},
				],
			},
		},
		{
			match: 'a harder badge of the same category fits a "Verified only" row',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{
						isVerifiedPlayerRequired: true,
						badgeNames: ['Speed Walker'],
					},
				],
			},
			second: { ownedBadgeNames: ['Marathon Runner'] },
		},
	] as {
		match: string
		first: Partial<Parameters<typeof startSearch>[0]>
		second: Partial<Parameters<typeof startSearch>[0]>
	}[]) {
	test(`${match}`, async ({ browser }) => {
		const firstPage = await startSearch({
			browser,
			username: 'FirstPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkA,
			...first,
		})
		const secondPage = await startSearch({
			browser,
			username: 'SecondPlayer',
			rows: meAndOneOpenRow,
			...second,
		})
		await expect(firstPage.locator('#team-found')).toHaveAttribute('open', '', {
			timeout: 20_000,
		})
		await expect(secondPage.locator('#team-found')).toHaveAttribute('open', '', {
			timeout: 20_000,
		})
		await firstPage.context().close()
		await secondPage.context().close()
	})
}

for (const {
	rejectedPlayer,
	second,
} of [
		{
			rejectedPlayer: 'an easier badge of the same category',
			second: {
				username: 'SecondPlayer',
				ownedBadgeNames: ['Speed Walker'],
			},
		},
		{
			rejectedPlayer: 'an unverified player',
			second: { username: undefined },
		},
	] as {
		rejectedPlayer: string
		second: Partial<Parameters<typeof startSearch>[0]>
	}[]) {
	test(`a "Verified only" row rejects ${rejectedPlayer}`, async ({ browser }) => {
		const firstPage = await startSearch({
			browser,
			username: 'FirstPlayer',
			rows: [
				{ reservedFor: 'me' },
				{
					isVerifiedPlayerRequired: true,
					badgeNames: ['Long Distance Runner'],
				},
			],
			serverLink: serverLinkA,
		})
		const secondPage = await startSearch({
			browser,
			rows: meAndOneOpenRow,
			...second,
		})
		await firstPage.waitForTimeout(12_000)
		await expect(firstPage.locator('#team-found')).not.toHaveAttribute('open')
		await firstPage.context().close()
		await secondPage.context().close()
	})
}

test('the same verified account never ends up twice in one team', async ({ browser }) => {
	const firstPage = await startSearch({
		browser,
		username: 'SamePlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	const secondPage = await startSearch({
		browser,
		username: 'SamePlayer',
		rows: meAndOneOpenRow,
	})
	await firstPage.waitForTimeout(12_000)
	await expect(firstPage.locator('#team-found')).not.toHaveAttribute('open')
	await firstPage.context().close()
	await secondPage.context().close()
})

test('after Leave Team, the host keeps the team as it was found', async ({ browser }) => {
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	const joinerPage = await startSearch({
		browser,
		username: 'JoinerPlayer',
		rows: meAndOneOpenRow,
	})
	await expect(hostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@JoinerPlayer)', {
		timeout: 20_000,
	})
	await joinerPage.locator('#team-found .window-close').click()
	await joinerPage.locator('#team-find button').click()
	await expect(joinerPage.locator('#team-find button')).toHaveText('Find Players')
	await hostPage.waitForTimeout(12_000)
	await expect(hostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@JoinerPlayer)')
	await expect(hostPage.locator('#team-found')).toHaveAttribute('open')
	await expect(hostPage.locator('#team-found a')).toHaveText(serverLinkA)
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('a team whose host closed the tab keeps its last status', async ({ browser }) => {
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	const joinerPage = await startSearch({
		browser,
		username: 'JoinerPlayer',
		rows: meAndOneOpenRow,
	})
	await expect(joinerPage.locator('#team-found a')).toHaveText(serverLinkA, { timeout: 20_000 })
	await hostPage.close({ runBeforeUnload: true })
	await joinerPage.waitForTimeout(12_000)
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('(@HostPlayer)')
	await expect(joinerPage.locator('#team-found a')).toHaveText(serverLinkA)
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('"looking for a team" counts searches that did not join a team', async ({ browser }) => {
	const firstPage = await startSearch({
		browser,
		username: 'FirstPlayer',
		rows: meAndOneOpenRow,
		floorGoal: '10',
	})
	// A page of an earlier test can still check in once, so the counts are compared with this one.
	// "Finding player" comes with the first answer that counts this search.
	await expect(firstPage.locator('#team-table tbody tr').nth(1)).toContainText('Finding player', {
		timeout: 20_000,
	})
	const startingCount = Number(
		(await firstPage.locator('#counters').textContent())!.match(/(\d+) looking/)![1],
	)
	const secondPage = await startSearch({
		browser,
		username: 'SecondPlayer',
		rows: meAndOneOpenRow,
		floorGoal: '20',
	})
	await expect(secondPage.locator('#counters'))
		.toContainText(`${startingCount + 1} looking for a team`, { timeout: 20_000 })
	await secondPage.locator('#team-find button').click()
	await expect(firstPage.locator('#counters'))
		.toContainText(`${startingCount} looking for a team`, { timeout: 20_000 })
	await firstPage.context().close()
	await secondPage.context().close()
})

test.describe('Upvote Players', () => {
	// "Team found!" covers the icons, so a player closes it before opening Upvote Players
	async function closeTeamFoundWindow(page: Page) {
		await expect(page.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
		await page.locator('#team-found .window-close').click()
	}

	async function openUpvotePlayers(page: Page) {
		// An icon does nothing while its window still shrinks into it
		await page.waitForFunction(() => document.getAnimations().length === 0)
		await page.locator('#upvote-icon').click()
		await expect(page.locator('#upvote-intro')).not.toHaveText('Loading your last team...')
	}

	test('before any found team, the window says so', async ({
		page,
		context,
	}) => {
		await verifyAsRobloxAccount({
			context,
			username: 'NewPlayer',
			ownedBadgeNames: [],
		})
		await page.goto('/')
		await openUpvotePlayers(page)
		await expect(page.locator('#upvote-intro'))
			.toHaveText('You\'ll be able to upvote other players here after you find a team!')
		await expect(page.locator('#upvote-table')).toHaveCount(0)
	})

	test('a found team shows as a record, and an upvote can be given and taken back', async ({
		browser,
	}) => {
		const hostPage = await startSearch({
			browser,
			username: 'HostPlayer',
			rows: [
				{
					reservedFor: 'me',
					toonPicture: 'bobette.png',
				},
				{},
			],
			serverLink: serverLinkA,
			floorGoal: '70',
		})
		const joinerPage = await startSearch({
			browser,
			username: 'JoinerPlayer',
			rows: meAndOneOpenRow,
			floorGoal: '70',
		})
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		await expect(hostPage.locator('#upvote-settings')).toContainText('Floor goal: 70')
		await expect(hostPage.locator('#upvote-settings a')).toHaveText(serverLinkA)
		const recordRows = hostPage.locator('#upvote-table tbody tr')
		await expect(recordRows.nth(0).locator('img')).toHaveAttribute('title', 'bobette')
		await expect(recordRows.nth(0)).toContainText('(@HostPlayer)')
		await expect(recordRows.nth(1)).toContainText('(@JoinerPlayer)')
		await expect(recordRows.nth(2)).toHaveText('(Leave Empty)')
		const upvoteButton = hostPage.locator('#upvote-players div', { hasText: '@JoinerPlayer' })
			.getByRole('button')
		await expect(upvoteButton).toHaveText('Upvote')
		await upvoteButton.click()
		await expect(upvoteButton).toHaveText('Upvoted ✓')
		await hostPage.locator('#upvote .window-close').first().click()
		await openUpvotePlayers(hostPage)
		await expect(upvoteButton).toHaveText('Upvoted ✓')
		await upvoteButton.click()
		await expect(upvoteButton).toHaveText('Upvote')
		await hostPage.reload()
		await openUpvotePlayers(hostPage)
		await expect(upvoteButton).toHaveText('Upvote')
		await closeTeamFoundWindow(joinerPage)
		await openUpvotePlayers(joinerPage)
		await expect(joinerPage.locator('#upvote-players div', { hasText: '@HostPlayer' })
			.getByRole('button')).toHaveText('Upvote')
		await hostPage.context().close()
		await joinerPage.context().close()
	})

	test('a host and the friend they invited cannot upvote each other', async ({ browser }) => {
		let friendPage: Page | undefined
		const hostPage = await startSearch({
			browser,
			username: 'HostPlayer',
			rows: [
				{ reservedFor: 'me' },
				{},
				{},
			],
			serverLink: serverLinkA,
			prepareBeforeSearch: async (page) => {
				await page.waitForFunction(() => document.getAnimations().length === 0)
				await page.getByRole('button', { name: 'Copy invite link' }).click()
				const inviteLink = await page.evaluate(() => navigator.clipboard.readText())
				const friendContext = await browser.newContext()
				await verifyAsRobloxAccount({
					context: friendContext,
					username: 'FriendPlayer',
					ownedBadgeNames: [],
				})
				friendPage = await friendContext.newPage()
				await friendPage.goto(new URL(inviteLink).search)
				const friendChip = page.locator('#team-reserved .team-chip', { hasText: '@FriendPlayer' })
				await expect(friendChip).toBeVisible({ timeout: 20_000 })
				// The Player column comes after Badges for a verified host
				await friendChip.dragTo(page.locator('#team-table tbody tr').nth(1).locator('td').nth(5))
			},
		})
		const otherPage = await startSearch({
			browser,
			username: 'OtherPlayer',
			rows: [
				{ reservedFor: 'me' },
				{},
				{},
			],
		})
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		await expect(hostPage.locator('#upvote-players div', { hasText: '@FriendPlayer' })
			.getByRole('button')).toHaveCount(0)
		await expect(hostPage.locator('#upvote-players div', { hasText: '@OtherPlayer' })
			.getByRole('button')).toHaveCount(1)
		await closeTeamFoundWindow(friendPage!)
		await openUpvotePlayers(friendPage!)
		await expect(friendPage!.locator('#upvote-players div', { hasText: '@HostPlayer' })
			.getByRole('button')).toHaveCount(0)
		await expect(friendPage!.locator('#upvote-players div', { hasText: '@OtherPlayer' })
			.getByRole('button')).toHaveCount(1)
		await closeTeamFoundWindow(otherPage)
		await openUpvotePlayers(otherPage)
		await expect(otherPage.locator('#upvote-players button')).toHaveCount(2)
		await hostPage.context().close()
		await friendPage!.context().close()
		await otherPage.context().close()
	})

	test('a player who did not verify only sees how to verify', async ({ browser }) => {
		const hostPage = await startSearch({
			browser,
			username: 'HostPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkA,
		})
		const unverifiedPage = await startSearch({
			browser,
			rows: meAndOneOpenRow,
		})
		await closeTeamFoundWindow(unverifiedPage)
		await openUpvotePlayers(unverifiedPage)
		await expect(unverifiedPage.locator('#upvote-intro'))
			.toContainText('Only players with a verified Roblox account can upvote')
		await expect(unverifiedPage.locator('#upvote-table')).toHaveCount(0)
		await expect(unverifiedPage.locator('#upvote-players')).toHaveCount(0)
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		await expect(hostPage.locator('#upvote-players'))
			.toContainText('Nobody else in this team verified their Roblox account.')
		await hostPage.context().close()
		await unverifiedPage.context().close()
	})

	test('the server refuses upvotes that the window would not offer', async ({ browser }) => {
		const hostPage = await startSearch({
			browser,
			username: 'HostPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkA,
		})
		const joinerPage = await startSearch({
			browser,
			username: 'JoinerPlayer',
			rows: meAndOneOpenRow,
		})
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		const joinerUserId = await hostPage.evaluate(async () => {
			const lastFoundTeam = await (await fetch('/api/upvotes/last-team')).json()
			return lastFoundTeam.verifiedPlayers[0].robloxUserId as string
		})
		const upvoteAs = ({
			page,
			robloxUserId,
		}: {
			page: Page
			robloxUserId: string
		}) => page.request.post('/api/upvotes', { data: { robloxUserId } })
		expect((await upvoteAs({
			page: hostPage,
			robloxUserId: 'someone-from-another-team',
		})).status()).toBe(403)
		const strangerContext = await browser.newContext()
		const strangerPage = await strangerContext.newPage()
		expect((await upvoteAs({
			page: strangerPage,
			robloxUserId: joinerUserId,
		})).status()).toBe(401)
		await verifyAsRobloxAccount({
			context: strangerContext,
			username: 'StrangerPlayer',
			ownedBadgeNames: [],
		})
		expect((await upvoteAs({
			page: strangerPage,
			robloxUserId: joinerUserId,
		})).status()).toBe(403)
		for (const attempt of [1, 2]) {
			expect((await upvoteAs({
				page: hostPage,
				robloxUserId: joinerUserId,
			})).status(), `upvote ${attempt}`).toBe(204)
		}
		const testDatabase = connectToTestDatabase()
		const { rows: upvoteRows } = await testDatabase.query(
			'SELECT * FROM upvotes WHERE receiver_roblox_user_id = $1',
			[joinerUserId],
		)
		await testDatabase.end()
		expect(upvoteRows).toHaveLength(1)
		await hostPage.context().close()
		await joinerPage.context().close()
		await strangerContext.close()
	})
})
