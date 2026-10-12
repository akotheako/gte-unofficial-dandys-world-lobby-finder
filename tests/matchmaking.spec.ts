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
	robloxUserId,
	ownedBadgeNames,
	rows,
	serverLink,
	region,
	floorGoalFrom,
	floorGoalTo,
	dandyRun,
	earlyDyle,
	missingToons,
	missingTrinkets,
	prepareBeforeSearch,
}: {
	browser: Browser
	username?: string
	robloxUserId?: number
	ownedBadgeNames?: string[]
	rows: Partial<TeamTableRow>[]
	serverLink?: string
	region?: string
	// The "to" dropdown of the Floor goal starts on the same floor as "from" unless it is given
	floorGoalFrom?: string
	floorGoalTo?: string
	dandyRun?: string
	earlyDyle?: string
	// Pictures that My Toons and My Trinkets mark as missing
	missingToons?: string[]
	missingTrinkets?: string[]
	prepareBeforeSearch?: (page: Page) => Promise<void>
}) {
	const context = await browser.newContext()
	await allowClipboard(context)
	if (username) {
		await verifyAsRobloxAccount({
			context,
			username,
			ownedBadgeNames: ownedBadgeNames ?? [],
			robloxUserId,
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
		floorGoalFrom: floorGoalFrom ?? '50',
		floorGoalTo: floorGoalTo ?? floorGoalFrom ?? '50',
		dandyRunOption: dandyRun ?? 'Any',
		earlyDyleOption: earlyDyle ?? 'Any',
		missingToons: JSON.stringify(missingToons ?? []),
		missingTrinkets: JSON.stringify(missingTrinkets ?? []),
		// The page drops the chip of an unverified friend who is not in the Reserved window
		unverifiedFriendNumbers: JSON.stringify(rows.flatMap((row) => (
			row.reservedFor?.startsWith('unverifiedFriend:')
				? [Number(row.reservedFor.split(':')[1])]
				: []
		))),
	})
	const page = await context.newPage()
	await page.goto('/')
	await page.locator('#team-icon').click()
	await prepareBeforeSearch?.(page)
	await page.locator('#team-find button').click()
	await expect(page.locator('#team-find button')).toHaveText('Finding Players (Click to Cancel)')
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
		.toContainText('Players joined your team! Everyone meets in your server:')
	await expect(hostPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkA)
	await expect(joinerPage.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
	await expect(joinerPage.locator('#team-found'))
		.toContainText('The host is @HostPlayer. Everyone, join their server!')
	await expect(joinerPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkA)
	await expect(hostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@JoinerPlayer)')
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('(@HostPlayer)')
	// Closing "Team found!" ends the search and unlocks the table
	await joinerPage.locator('#team-found .window-close').click()
	await expect(joinerPage.locator('#team-find button')).toHaveText('Find Players')
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('Verified only')
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('searches with close upvotes merge first, and any upvotes merge after a wait', async ({
	browser,
}) => {
	// The lone search with 500 upvotes needs about 54 seconds of waiting
	test.setTimeout(120_000)
	const veteranUserId = Math.floor(Math.random() * 1e9)
	const testDatabase = connectToTestDatabase()
	await testDatabase.query(`
		INSERT INTO upvotes (voter_roblox_user_id, receiver_roblox_user_id)
		SELECT 'test-voter-' || voter_number, $1 FROM generate_series(1, 500) AS voter_number
	`, [String(veteranUserId)])
	await testDatabase.end()
	const newHostPage = await startSearch({
		browser,
		username: 'NewHost',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	const veteranPage = await startSearch({
		browser,
		username: 'VeteranPlayer',
		robloxUserId: veteranUserId,
		rows: meAndOneOpenRow,
	})
	const newJoinerPage = await startSearch({
		browser,
		username: 'NewJoiner',
		rows: meAndOneOpenRow,
	})
	await expect(newHostPage.locator('#team-found')).toHaveAttribute('open', '', {
		timeout: 20_000,
	})
	await expect(newHostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@NewJoiner)')
	await expect(veteranPage.locator('#team-find button'))
		.toHaveText('Finding Players (Click to Cancel)')
	const lateHostPage = await startSearch({
		browser,
		username: 'LateHost',
		rows: meAndOneOpenRow,
		serverLink: serverLinkB,
	})
	await expect(veteranPage.locator('#team-found')).toHaveAttribute('open', '', {
		timeout: 90_000,
	})
	await expect(lateHostPage.locator('#team-table tbody tr').nth(1))
		.toContainText('(@VeteranPlayer)')
	await newHostPage.context().close()
	await veteranPage.context().close()
	await newJoinerPage.context().close()
	await lateHostPage.context().close()
})

test('two merged searches merge as a whole', async ({ browser }) => {
	// The two pairs only merge once the wider upvote gap fits, after about 36 seconds
	test.setTimeout(120_000)
	const firstVeteranUserId = Math.floor(Math.random() * 1e9)
	const secondVeteranUserId = Math.floor(Math.random() * 1e9)
	// 63 upvotes each are 6 upvote levels above a player without upvotes
	const testDatabase = connectToTestDatabase()
	await testDatabase.query(`
		INSERT INTO upvotes (voter_roblox_user_id, receiver_roblox_user_id)
		SELECT 'test-voter-' || voter_number, receiver
		FROM generate_series(1, 63) AS voter_number, unnest($1::text[]) AS receiver
	`, [[String(firstVeteranUserId), String(secondVeteranUserId)]])
	await testDatabase.end()
	const meAndThreeOpenRows: Partial<TeamTableRow>[] = [
		{ reservedFor: 'me' },
		{},
		{},
		{},
	]
	const firstVeteranPage = await startSearch({
		browser,
		username: 'FirstVeteran',
		robloxUserId: firstVeteranUserId,
		rows: meAndThreeOpenRows,
		serverLink: serverLinkA,
	})
	const secondVeteranPage = await startSearch({
		browser,
		username: 'SecondVeteran',
		robloxUserId: secondVeteranUserId,
		rows: meAndThreeOpenRows,
	})
	const firstNewPage = await startSearch({
		browser,
		username: 'FirstNewPlayer',
		rows: meAndThreeOpenRows,
	})
	const secondNewPage = await startSearch({
		browser,
		username: 'SecondNewPlayer',
		rows: meAndThreeOpenRows,
	})
	// Each pair merges on its own first
	await expect(firstVeteranPage.locator('#team-table tbody')).toContainText('(@SecondVeteran)', {
		timeout: 20_000,
	})
	await expect(firstNewPage.locator('#team-table tbody')).toContainText('(@SecondNewPlayer)', {
		timeout: 20_000,
	})
	await expect(firstNewPage.locator('#team-table tbody')).not.toContainText('(@FirstVeteran)')
	// Then the two merged searches merge into one team of four
	for (const page of [firstVeteranPage, secondVeteranPage, firstNewPage, secondNewPage]) {
		await expect(page.locator('#team-found')).toHaveAttribute('open', '', { timeout: 60_000 })
		await expect(page.locator('#team-found-join')).toHaveAttribute('href', serverLinkA)
	}
	await expect(secondNewPage.locator('#team-table tbody')).toContainText('(@FirstVeteran)')
	await expect(secondNewPage.locator('#team-table tbody')).toContainText('(@SecondVeteran)')
	await expect(secondNewPage.locator('#team-table tbody')).toContainText('(@FirstNewPlayer)')
	for (const page of [firstVeteranPage, secondVeteranPage, firstNewPage, secondNewPage]) {
		await page.context().close()
	}
})

test('"Team found!" waits until every row has a player', async ({ browser }) => {
	const meAndTwoOpenRows: Partial<TeamTableRow>[] = [
		{ reservedFor: 'me' },
		{},
		{},
	]
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndTwoOpenRows,
		serverLink: serverLinkA,
	})
	const firstJoinerPage = await startSearch({
		browser,
		username: 'FirstJoiner',
		rows: meAndTwoOpenRows,
	})
	await expect(hostPage.locator('#team-table tbody')).toContainText('(@FirstJoiner)', {
		timeout: 20_000,
	})
	await expect(hostPage.locator('#team-found')).not.toHaveAttribute('open')
	await expect(firstJoinerPage.locator('#team-find button'))
		.toHaveText('Finding Players (Click to Cancel)')
	const secondJoinerPage = await startSearch({
		browser,
		username: 'SecondJoiner',
		rows: meAndTwoOpenRows,
	})
	for (const page of [hostPage, firstJoinerPage, secondJoinerPage]) {
		await expect(page.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
	}
	await hostPage.context().close()
	await firstJoinerPage.context().close()
	await secondJoinerPage.context().close()
})

test('a newer search with the only link hosts the older one', async ({ browser }) => {
	const joinerPage = await startSearch({
		browser,
		username: 'JoinerPlayer',
		rows: meAndOneOpenRow,
	})
	const hostPage = await startSearch({
		browser,
		username: 'HostPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkB,
	})
	await expect(hostPage.locator('#team-found'))
		.toContainText('Players joined your team!', { timeout: 20_000 })
	await expect(hostPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkB)
	await expect(joinerPage.locator('#team-found'))
		.toContainText('The host is @HostPlayer.', { timeout: 20_000 })
	await expect(joinerPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkB)
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
			first: {
				floorGoalFrom: '40',
				floorGoalTo: '50',
			},
			second: {
				floorGoalFrom: '60',
				floorGoalTo: '100+',
			},
		},
		{
			difference: 'Region',
			first: { region: 'Asia' },
			second: { region: 'Europe' },
		},
		{
			difference: 'Dandy Run',
			first: { dandyRun: 'Yes' },
			second: { dandyRun: 'No' },
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
			difference: 'owned toon',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ toonPicture: 'bobette.png' },
				],
			},
			second: { missingToons: ['bobette.png'] },
		},
		{
			difference: 'owned trinket',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ trinketAPicture: 'alarm.png' },
				],
			},
			second: { missingTrinkets: ['alarm.png'] },
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
			match: 'a Dandy Run of Any matches Yes',
			first: { dandyRun: 'Any' },
			second: { dandyRun: 'Yes' },
		},
		{
			match: 'an Early Dyle of Any matches No',
			first: { earlyDyle: 'No' },
			second: { earlyDyle: 'Any' },
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
			match: 'an "(Any)" toon on a "Me" row fits a toon that is not marked as missing',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{ toonPicture: 'bobette.png' },
				],
			},
			second: { missingToons: ['vee.png'] },
		},
		{
			match: 'an "(Any)" toon on a friend\'s row fits a toon that the user marked as missing',
			first: {
				rows: [
					{ reservedFor: 'me' },
					{},
					{ toonPicture: 'bobette.png' },
				],
			},
			second: {
				rows: [
					{ reservedFor: 'me' },
					{ reservedFor: 'unverifiedFriend:1' },
					{},
				],
				missingToons: ['bobette.png'],
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

test('a new search does not match the found host again, who keeps the found team', async ({
	browser,
}) => {
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
	await expect(joinerPage.locator('#team-find button'))
		.toHaveText('Finding Players (Click to Cancel)')
	await hostPage.waitForTimeout(12_000)
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('Finding player')
	await expect(joinerPage.locator('#team-found')).not.toHaveAttribute('open')
	await expect(hostPage.locator('#team-table tbody tr').nth(1)).toContainText('(@JoinerPlayer)')
	await expect(hostPage.locator('#team-found')).toHaveAttribute('open')
	await expect(hostPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkA)
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
	await expect(joinerPage.locator('#team-found-join'))
		.toHaveAttribute('href', serverLinkA, { timeout: 20_000 })
	await hostPage.close({ runBeforeUnload: true })
	await joinerPage.waitForTimeout(12_000)
	await expect(joinerPage.locator('#team-table tbody tr').nth(1)).toContainText('(@HostPlayer)')
	await expect(joinerPage.locator('#team-found-join')).toHaveAttribute('href',serverLinkA)
	await hostPage.context().close()
	await joinerPage.context().close()
})

test('"looking for a team" counts searches that did not join a team', async ({ browser }) => {
	const firstPage = await startSearch({
		browser,
		username: 'FirstPlayer',
		rows: meAndOneOpenRow,
		floorGoalFrom: '10',
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
		floorGoalFrom: '20',
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

	test('a found team shows the floor of its range nearest the middle, the higher on a tie', async ({
		browser,
	}) => {
		// 50 to 60 has its middle at 55, which is as close to 50 as to 60
		const hostPage = await startSearch({
			browser,
			username: 'HostPlayer',
			rows: meAndOneOpenRow,
			serverLink: serverLinkA,
			floorGoalFrom: '50',
			floorGoalTo: '60',
		})
		const joinerPage = await startSearch({
			browser,
			username: 'JoinerPlayer',
			rows: meAndOneOpenRow,
			floorGoalFrom: '50',
			floorGoalTo: '60',
		})
		await expect(hostPage.locator('#team-found')).toHaveAttribute('open', '', { timeout: 20_000 })
		await expect(hostPage.locator('#team-found-settings')).toContainText('Floor Goal: 60')
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		await expect(hostPage.locator('#upvote-settings')).toContainText('Floor Goal: 60')
		await hostPage.context().close()
		await joinerPage.context().close()
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
			floorGoalFrom: '60',
			floorGoalTo: '80',
		})
		// Floor goals that only share floor 80 still merge
		const joinerPage = await startSearch({
			browser,
			username: 'JoinerPlayer',
			rows: meAndOneOpenRow,
			floorGoalFrom: '80',
			floorGoalTo: '100+',
		})
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		// The record holds the floors that both ranges share
		await expect(hostPage.locator('#upvote-settings')).toContainText('Floor Goal: 80')
		await expect(hostPage.locator('#upvote-settings a')).toHaveText(serverLinkA)
		const recordRows = hostPage.locator('#upvote-table tbody tr')
		await expect(recordRows.nth(0).locator('img')).toHaveAttribute('title', 'bobette')
		await expect(recordRows.nth(0)).toContainText('(@HostPlayer)')
		await expect(recordRows.nth(1)).toContainText('(@JoinerPlayer)')
		// "(Leave Empty)" rows are left out
		await expect(recordRows).toHaveCount(2)
		const upvoteButton = hostPage.locator('#upvote-table tr', { hasText: '@JoinerPlayer' })
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
		await expect(joinerPage.locator('#upvote-table tr', { hasText: '@HostPlayer' })
			.getByRole('button')).toHaveText('Upvote')
		await hostPage.context().close()
		await joinerPage.context().close()
	})

	test('a player and the friend who opened their invite link cannot upvote each other', async ({
		browser,
	}) => {
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
		await expect(hostPage.locator('#upvote-table tr', { hasText: '@FriendPlayer' })
			.getByRole('button')).toHaveCount(0)
		await expect(hostPage.locator('#upvote-table tr', { hasText: '@FriendPlayer' }))
			.toContainText('(You cannot upvote your invited friends)')
		await expect(hostPage.locator('#upvote-table tr', { hasText: '@HostPlayer' }))
			.toContainText('(You cannot upvote yourself)')
		await expect(hostPage.locator('#upvote-table tr', { hasText: '@OtherPlayer' })
			.getByRole('button')).toHaveCount(1)
		await closeTeamFoundWindow(friendPage!)
		await openUpvotePlayers(friendPage!)
		await expect(friendPage!.locator('#upvote-table tr', { hasText: '@HostPlayer' })
			.getByRole('button')).toHaveCount(0)
		await expect(friendPage!.locator('#upvote-table tr', { hasText: '@HostPlayer' }))
			.toContainText('(You cannot upvote the friend who invited you)')
		await expect(friendPage!.locator('#upvote-table tr', { hasText: '@OtherPlayer' })
			.getByRole('button')).toHaveCount(1)
		await closeTeamFoundWindow(otherPage)
		await openUpvotePlayers(otherPage)
		await expect(otherPage.locator('#upvote-table button')).toHaveCount(2)
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
		await expect(unverifiedPage.locator('#upvote-cards')).toHaveCount(0)
		await closeTeamFoundWindow(hostPage)
		await openUpvotePlayers(hostPage)
		await expect(hostPage.locator('#upvote-table tbody tr')).toHaveCount(2)
		await expect(hostPage.locator('#upvote-table button')).toHaveCount(0)
		await expect(hostPage.locator('#upvote-table tbody tr').nth(1))
			.toContainText('(You cannot upvote unverified players)')
		await hostPage.context().close()
		await unverifiedPage.context().close()
	})

	test('a crash while the last team loads shows its error in place of the loading line', async ({
		browser,
	}) => {
		const context = await browser.newContext()
		await verifyAsRobloxAccount({
			context,
			username: 'CrashWitness',
		})
		const page = await context.newPage()
		await page.route('/api/upvotes/last-team', (route) => route.fulfill({
			status: 500,
			json: { error: 'Something went wrong on the server, try again in a minute' },
		}))
		await page.goto('/')
		await openUpvotePlayers(page)
		await expect(page.locator('#upvote-intro'))
			.toHaveText('Something went wrong on the server, try again in a minute')
		await context.close()
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

test('a running search greys out the "N/N Toons" button until it ends', async ({ browser }) => {
	const page = await startSearch({
		browser,
		username: 'SearchingPlayer',
		rows: meAndOneOpenRow,
		serverLink: serverLinkA,
	})
	await expect(page.locator('.team-drag-hint button').first()).toBeDisabled()
	await page.locator('#team-find button').click()
	await expect(page.locator('.team-drag-hint button').first()).toBeEnabled()
	await page.context().close()
})
