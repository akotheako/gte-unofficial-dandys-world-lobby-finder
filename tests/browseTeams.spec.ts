import {
	expect,
	test,
	type APIRequestContext,
	type Browser,
} from '@playwright/test'
import type { TeamTableRow } from '../shared/teamTypes.ts'
import { connectToTestDatabase } from './testDatabase.ts'

const serverLinkA = 'https://www.roblox.com/share?code=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&type=Server'

// A search left over from another test would show up in Browse Teams
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

// Starts the search of an unverified host without a browser, with one check-in, which keeps it on
// the server for 90 seconds. Every row that is not given is "(Leave Empty)".
async function startHostSearchWithoutBrowser({
	request,
	pageId,
	rows,
	region,
	dandyRun,
	earlyDyle,
}: {
	request: APIRequestContext
	pageId: string
	rows: Partial<TeamTableRow>[]
	region?: string
	dandyRun?: string
	earlyDyle?: string
}) {
	const response = await request.post('/api/check-in', {
		data: {
			pageId,
			team: {
				teamTableRows: Array.from({ length: 8 }, (_, index): TeamTableRow => ({
					toonPicture: '',
					trinketAPicture: '',
					trinketBPicture: '',
					badgeNames: [],
					roleNames: [],
					isVerifiedPlayerRequired: false,
					reservedFor: '',
					isLeftEmpty: index >= rows.length,
					...rows[index],
				})),
				removedRobloxUsernames: [],
				missingToons: [],
				missingTrinkets: [],
				inviteCode: `${pageId}-invite`,
				serverLink: serverLinkA,
				dandyRun: dandyRun ?? 'Any',
				earlyDyle: earlyDyle ?? 'Any',
				region: region ?? 'Any',
				floorGoal: '50 to 50',
				isFindingPlayers: true,
				searchId: `${pageId}-search`,
			},
			invite: null,
		},
	})
	expect(response.ok()).toBe(true)
}

// Opens Browse Teams in a new browser profile with the given slot and TEAM SETTINGS
async function openBrowseTeams({
	browser,
	browseTeamsSlot,
	region,
	missingToons,
}: {
	browser: Browser
	browseTeamsSlot?: Partial<Pick<
		TeamTableRow,
		'toonPicture' | 'trinketAPicture' | 'trinketBPicture' | 'roleNames'
	>>
	region?: string
	missingToons?: string[]
}) {
	const context = await browser.newContext()
	await context.addInitScript((savedValues) => {
		if (sessionStorage.getItem('isSeeded')) return
		sessionStorage.setItem('isSeeded', 'true')
		for (const [key, value] of Object.entries(savedValues)) localStorage.setItem(key, value)
	}, {
		browseTeamsTableRows: JSON.stringify([{
			toonPicture: '',
			trinketAPicture: '',
			trinketBPicture: '',
			badgeNames: [],
			roleNames: [],
			isVerifiedPlayerRequired: false,
			reservedFor: 'me',
			isLeftEmpty: false,
			...browseTeamsSlot,
		}]),
		browseTeamsSettings: JSON.stringify({
			dandyRun: 'Any',
			earlyDyle: 'Any',
			region: region ?? 'Any',
			floorGoalFrom: '50',
			floorGoalTo: '50',
		}),
		missingToons: JSON.stringify(missingToons ?? []),
	})
	const page = await context.newPage()
	await page.goto('/')
	await page.locator('#browse-icon').click()
	return page
}

test('a card shows the toons and tags of a fitting team, and Join gets its server link', async ({
	browser,
	request,
}) => {
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-host',
		rows: [
			{
				reservedFor: 'me',
				toonPicture: 'astro.png',
			},
			{
				toonPicture: 'vee.png',
				roleNames: ['Extractor'],
			},
		],
		region: 'Europe',
		dandyRun: 'Yes',
	})
	const page = await openBrowseTeams({ browser })
	// YOUR SLOT is filled like a row of Find a Team, from its own side windows and Roles window
	const slotRow = page.locator('#browse-slot-table tbody tr')
	await expect(page.locator('#browse-slot-table th')).toHaveText([
		'Toon',
		'Trinket A',
		'Trinket B',
		'Role',
	])
	await page.locator('#browse-toons img[title="vee"]').dragTo(slotRow.locator('td').nth(0))
	await expect(slotRow.locator('td').nth(0).locator('img')).toHaveAttribute('title', 'vee')
	await slotRow.locator('td').nth(3).click()
	await page.locator('#team-roles label', { hasText: 'Extractor' }).click()
	await page.keyboard.press('Escape')
	await expect(slotRow.locator('td').nth(3)).toContainText('Extractor')
	const card = page.locator('.browse-card')
	await expect(card).toHaveCount(1, { timeout: 10_000 })
	await expect(card.locator('img')).toHaveCount(2)
	await expect(card.locator('.browse-card-tags span')).toHaveText([
		'Dandy Run',
		'Europe',
		'Floors 50 to 50',
	])
	await card.click()
	await expect(page.locator('#browse-team-table tbody tr')).toHaveCount(2)
	// The free slot that the user fits has a Join button in its Player cell
	const freeSlotJoinButton = page.locator('#browse-team-table tbody tr').nth(1)
		.locator('.browse-join button')
	await expect(freeSlotJoinButton).toHaveText('Join')
	await freeSlotJoinButton.click()
	await expect(page.locator('#team-found')).toHaveAttribute('open', '', { timeout: 10_000 })
	await expect(page.locator('#team-found')).toContainText('You joined a team! Join its server:')
	await expect(page.locator('#team-found-join')).toHaveAttribute('href', serverLinkA)
	// YOUR SLOT and its side windows stay locked until the join ends
	await expect(page.locator('#browse-toons')).toHaveClass(/team-locked/)
	await expect(slotRow.locator('td').nth(0).locator('.team-text')).toHaveAttribute(
		'draggable',
		'false',
	)
	// Closing "Team found!" ends the join and unlocks the slot
	await page.locator('#team-found .window-close').click()
	await expect(page.locator('#browse-toons')).not.toHaveClass(/team-locked/)
	await page.context().close()
})

test('Browse Teams side windows only show owned choices', async ({ browser }) => {
	const page = await openBrowseTeams({
		browser,
		missingToons: ['vee.png'],
	})
	await expect(page.locator('#browse-toons img[title="vee"]')).toHaveCount(0)
	await expect(page.locator('#browse-toons img[title="poppy"]')).toHaveCount(1)
	await expect(page.locator('#browse-toons .team-palette-section-title')).toHaveCount(0)
	await expect(page.locator('#browse-trinkets img')).toHaveCount(0)
	await expect(page.locator('#browse-trinkets .team-palette-section-title')).toHaveCount(0)
	await page.context().close()
})

// The teams differ in Dandy Run or Early Dyle, so that no two of them merge with each other
test('only fitting teams are listed, and a team that stops searching disappears', async ({
	browser,
	request,
}) => {
	// Its free slot asks for a toon that the user marked as missing
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-needs-missing-toon',
		rows: [
			{ reservedFor: 'me' },
			{ toonPicture: 'vee.png' },
		],
		dandyRun: 'Yes',
		earlyDyle: 'Yes',
	})
	// Its free slot asks for a role that the user's slot does not do
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-needs-role',
		rows: [
			{ reservedFor: 'me' },
			{ roleNames: ['Extractor'] },
		],
		dandyRun: 'Yes',
		earlyDyle: 'No',
	})
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-other-region',
		rows: [
			{ reservedFor: 'me' },
			{},
		],
		region: 'Asia',
		dandyRun: 'No',
		earlyDyle: 'Yes',
	})
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-fitting',
		rows: [
			{
				reservedFor: 'me',
				toonPicture: 'shelly.png',
			},
			{},
		],
		dandyRun: 'No',
		earlyDyle: 'No',
	})
	// The slot names the missing toon, which still does not let the user take a slot that asks
	// for it
	const page = await openBrowseTeams({
		browser,
		browseTeamsSlot: { toonPicture: 'vee.png' },
		region: 'Europe',
		missingToons: ['vee.png'],
	})
	const card = page.locator('.browse-card')
	await expect(card).toHaveCount(1, { timeout: 10_000 })
	await expect(card.locator('img')).toHaveAttribute('src', '/pixelated/toons/shelly.png')
	await request.post('/api/check-in/leave', { data: { pageId: 'browse-fitting' } })
	await expect(card).toHaveCount(0, { timeout: 10_000 })
	await expect(page.locator('#browse-contents')).toContainText('Searching...')
	// Find a Team keeps its own TEAM SETTINGS
	await page.locator('#team-icon').click()
	await expect(page.locator('#team-settings select').nth(2)).toHaveValue('Any')
	await page.context().close()
})

test('closing Team Details ends a pending join and unlocks YOUR SLOT', async ({
	browser,
	request,
}) => {
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-cancel-join',
		rows: [
			{ reservedFor: 'me' },
			{},
		],
	})
	const page = await openBrowseTeams({ browser })
	await page.locator('.browse-card').click()
	const freeRow = page.locator('#browse-team-table tbody tr').nth(1)
	await freeRow.locator('.browse-join button').click()
	await expect(freeRow.locator('td').last()).toHaveText('Joined this slot')
	await expect(freeRow).toHaveClass('browse-joined-slot')
	await expect(page.locator('#browse-toons')).toHaveClass(/team-locked/)
	await page.locator('#browse-team-details .window-close').click()
	await expect(page.locator('#browse-toons')).not.toHaveClass(/team-locked/)
	// The details open again with the slot free to join
	await page.locator('.browse-card').click()
	await expect(freeRow.locator('.browse-join button')).toHaveText('Join')
	await expect(page.locator('#team-found')).not.toHaveAttribute('open', '')
	await page.context().close()
})

test('only the free slots that the user fits have a Join button, which takes that slot', async ({
	browser,
	request,
}) => {
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-join-chosen-slot',
		rows: [
			{ reservedFor: 'me' },
			{ toonPicture: 'vee.png' },
			{},
			{},
		],
	})
	const page = await openBrowseTeams({
		browser,
		browseTeamsSlot: { toonPicture: 'astro.png' },
	})
	await page.locator('.browse-card').click()
	const rows = page.locator('#browse-team-table tbody tr')
	// An Astro slot does not fit the Vee row
	await expect(rows.nth(1).locator('.browse-join')).toHaveCount(0)
	await expect(rows.nth(1).locator('td').last()).toHaveText('(Requirements incompatible with you)')
	await expect(rows.nth(0).locator('td').last()).toHaveText('(Slot filled)')
	await expect(rows.nth(2).locator('.browse-join button')).toHaveText('Join')
	await rows.nth(3).locator('.browse-join button').click()
	await expect(rows.nth(3).locator('td').last()).toHaveText('Joined this slot')
	// Join on the other slot that the user fits moves the join there
	await rows.nth(2).locator('.browse-join button').click()
	await expect(rows.nth(2).locator('td').last()).toHaveText('Joined this slot')
	await expect(rows.nth(3).locator('.browse-join button')).toHaveText('Join', { timeout: 10_000 })

	// Another page that browses sees the user in the third row, and the fourth one free again
	await expect.poll(async () => {
		const answer = await (await request.post('/api/check-in', {
			data: {
				pageId: 'browse-join-chosen-slot-observer',
				team: null,
				invite: null,
				browse: {
					toonPicture: '',
					trinketAPicture: '',
					trinketBPicture: '',
					roleNames: [],
					missingToons: [],
					missingTrinkets: [],
					dandyRun: 'Any',
					earlyDyle: 'Any',
					region: 'Any',
					floorGoal: '50 to 50',
					browsedTeamCount: 20,
				},
			},
		})).json()
		return answer.browsedTeams[0]?.playersInRows.map(Boolean)
	}, { timeout: 10_000 }).toEqual([
		true,
		false,
		true,
		false,
		false,
		false,
		false,
		false,
	])
	await page.context().close()
})

test('the host sees "Player found!" in the row that a Browse Teams player joined', async ({
	browser,
}) => {
	const hostContext = await browser.newContext()
	await hostContext.addInitScript((serverLink) => {
		if (sessionStorage.getItem('isSeeded')) return
		sessionStorage.setItem('isSeeded', 'true')
		localStorage.setItem('missingToons', '[]')
		localStorage.setItem('missingTrinkets', '[]')
		localStorage.setItem('serverLink', serverLink)
		localStorage.setItem('floorGoalFrom', '50')
		localStorage.setItem('floorGoalTo', '50')
		localStorage.setItem('team', JSON.stringify(Array.from({ length: 8 }, (_, index) => ({
			toonPicture: '',
			trinketAPicture: '',
			trinketBPicture: '',
			badgeNames: [],
			roleNames: [],
			isVerifiedPlayerRequired: false,
			reservedFor: index === 0 ? 'me' : '',
			isLeftEmpty: index >= 3,
		}))))
	}, serverLinkA)
	const hostPage = await hostContext.newPage()
	await hostPage.goto('/')
	await hostPage.locator('#team-icon').click()
	await hostPage.locator('#team-find button').click()

	const page = await openBrowseTeams({ browser })
	await page.locator('.browse-card').click({ timeout: 10_000 })
	await page.locator('#browse-team-table tbody tr').nth(2).locator('.browse-join button').click()

	const hostRows = hostPage.locator('#team-table tbody tr')
	await expect(hostRows.nth(2).locator('td').last()).toContainText('Player found!', {
		timeout: 10_000,
	})
	await expect(hostRows.nth(1).locator('td').last()).toContainText('Finding player')
	await hostContext.close()
	await page.context().close()
})

test('joining a team that stopped searching after it was opened shows an error', async ({
	browser,
	request,
}) => {
	await startHostSearchWithoutBrowser({
		request,
		pageId: 'browse-stopped-before-join',
		rows: [
			{ reservedFor: 'me' },
			{},
		],
	})
	const page = await openBrowseTeams({ browser })
	await page.locator('.browse-card').click()
	const joinButton = page.locator('#browse-team-table .browse-join button')
	await expect(joinButton).toHaveText('Join')

	// The card is still open in this page, but the server has ended the host's search.
	await request.post('/api/check-in/leave', {
		data: { pageId: 'browse-stopped-before-join' },
	})
	await joinButton.click()
	await expect(page.locator('#browse-error')).toHaveText('This team stopped searching or filled up', {
		timeout: 10_000,
	})
	await expect(page.locator('.browse-join')).toHaveCount(0)
	await expect(page.locator('#team-found')).not.toHaveAttribute('open', '')
	await page.context().close()
})

test('on a narrow screen, YOUR SLOT is a card whose boxes open the pick window', async ({
	browser,
}) => {
	const page = await openBrowseTeams({
		browser,
		missingToons: ['vee.png'],
	})
	await page.setViewportSize({
		width: 600,
		height: 900,
	})
	await expect(page.locator('#browse-slot-table')).toBeHidden()
	await expect(page.locator('#browse-toons')).toBeHidden()
	const slotCard = page.locator('#browse-slot-cards')
	await expect(slotCard.locator('.team-card-title')).toHaveText('YOUR SLOT')
	await expect(slotCard.locator('.team-card-label')).toHaveText([
		'Toon',
		'Trinket A',
		'Trinket B',
		'Role',
	])
	await slotCard.locator('.team-card-box').first().click()
	await expect(page.locator('#team-pick')).toHaveAttribute('open')
	// A single slot cannot be left empty
	await expect(page.locator('#team-pick')).not.toContainText('(Leave Empty)')
	await expect(page.locator('#team-pick img[title="vee"]')).toHaveCount(0)
	await expect(page.locator('#team-pick .team-palette-section-title')).toHaveCount(0)
	await page.locator('#team-pick img[title="poppy"]').click()
	await expect(slotCard.locator('.team-card-box').first().locator('img'))
		.toHaveAttribute('title', 'poppy')
	await slotCard.locator('.team-card-box').nth(1).click()
	await expect(page.locator('#team-pick img')).toHaveCount(0)
	await expect(page.locator('#team-pick .team-palette-section-title')).toHaveCount(0)
	await page.context().close()
})

test('scrolling to the end of the cards loads more teams', async ({
	browser,
	request,
}) => {
	// Every team gets its own mix of TEAM SETTINGS, so that no two of them merge with each other
	for (let teamNumber = 0; teamNumber < 21; teamNumber++) {
		await startHostSearchWithoutBrowser({
			request,
			pageId: `browse-team-${teamNumber}`,
			rows: [
				{ reservedFor: 'me' },
				{},
			],
			dandyRun: ['Yes', 'No'][teamNumber % 2],
			earlyDyle: ['Yes', 'No'][Math.floor(teamNumber / 2) % 2],
			region: [
				'Africa',
				'Asia',
				'Europe',
				'North America',
				'South America',
				'Oceania',
			][Math.floor(teamNumber / 4)],
		})
	}
	const page = await openBrowseTeams({ browser })
	const cards = page.locator('.browse-card')
	await expect(cards).toHaveCount(20, { timeout: 10_000 })
	await expect(page.locator('#browse-cards')).toContainText('Loading more teams...')
	await cards.last().scrollIntoViewIfNeeded()
	await expect(cards).toHaveCount(21, { timeout: 10_000 })
	await expect(page.locator('#browse-cards')).not.toContainText('Loading more teams...')
	await page.context().close()
})
