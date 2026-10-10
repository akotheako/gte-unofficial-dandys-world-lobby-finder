import { expect, test } from '@playwright/test'
import { connectToTestDatabase } from './testDatabase.ts'

test.beforeEach(async ({ page }) => {
	await page.goto('/')
	await page.locator('#team-icon').click()
	await expect(page.locator('#team-toons img').first()).toBeVisible()
	await page.waitForFunction(() => document.getAnimations().length === 0)
})

test('Find Players is greyed out until "Me" is on a row', async ({ page }) => {
	await expect(page.locator('#team-find button')).toBeDisabled()
	await expect(page.locator('#team-find')).toHaveAttribute(
		'title',
		'"Me" from the Reserved window has to be on at least 1 row that is not "(Leave Empty)".',
	)
	await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
		.dragTo(page.locator('#team-table tbody tr').first().locator('td').nth(4))
	await expect(page.locator('#team-find button')).toBeEnabled()
})

test('Find Players is greyed out when no row is left to find', async ({ page }) => {
	const rows = page.locator('#team-table tbody tr')
	await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
		.dragTo(rows.nth(0).locator('td').nth(4))
	for (const rowIndex of [1, 2, 3, 4, 5, 6, 7]) {
		await page.locator('#team-toons .team-text', { hasText: '(Leave Empty)' })
			.dragTo(rows.nth(rowIndex).locator('td').first())
	}
	await expect(page.locator('#team-find button')).toBeDisabled()
	await expect(page.locator('#team-find'))
		.toHaveAttribute('title', /At least 1 row has to be left for a player to find/)
	// A second row with the same chip is left for a player to find
	await rows.nth(1).locator('td').click()
	await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
		.dragTo(rows.nth(1).locator('td').nth(4))
	await expect(page.locator('#team-find button')).toBeEnabled()
})

test.describe('with "Me" on the first row', () => {
	test.beforeEach(async ({ page }) => {
		await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
			.dragTo(page.locator('#team-table tbody tr').first().locator('td').nth(4))
	})

	test('an invalid server link shows a red error that a change clears', async ({ page }) => {
		await page.locator('#team-server-link-row input').fill('https://example.com')
		await page.locator('#team-find button').click()
		await expect(page.locator('#team-form-error')).toHaveText('The server link is invalid!')
		await expect(page.locator('#team-find button')).toHaveText('Find Players')
		await page.locator('#team-settings select').nth(4).selectOption('60')
		await expect(page.locator('#team-form-error')).toHaveText('')
	})

	test('a valid server link starts the search without the hint', async ({ page }) => {
		await page.locator('#team-server-link-row input')
			.fill('https://www.roblox.com/share?code=0123456789abcdef0123456789ABCDEF&type=Server')
		await page.locator('#team-find button').click()
		await expect(page.locator('#team-find button')).toHaveText('Finding Players (Click to Cancel)')
		await expect(page.locator('#team-server-link-hint')).toHaveClass('team-invisible')
		await page.locator('#team-find button').click()
	})

	test('a search locks the table, the link and TEAM SETTINGS until it is canceled', async ({
		page,
	}) => {
		const rows = page.locator('#team-table tbody tr')
		await page.locator('#team-find button').click()
		await expect(page.locator('#team-find button')).toHaveText('Finding Players (Click to Cancel)')
		await expect(page.locator('#team-server-link-hint')).not.toHaveClass('team-invisible')
		await expect(page.locator('#team-server-link-row input')).toHaveAttribute('readonly')
		await expect(page.locator('#team-settings select').nth(2)).toBeDisabled()
		await expect(page.locator('#team-settings select').first()).toBeDisabled()
		// "Finding player" comes with the server's first answer, which names the player in each row
		await expect(rows.nth(1)).toContainText('Finding player', { timeout: 20_000 })
		await expect(rows.nth(0)).toContainText('(Me)')
		await page.locator('#team-toons img[title="vee"]')
			.dragTo(rows.nth(1).locator('td').first(), { force: true })
		await expect(rows.nth(1).locator('td').first()).toHaveText('(Any)')
		await rows.nth(1).locator('td').nth(3).click()
		await expect(page.locator('#team-roles')).not.toHaveAttribute('open')
		await page.locator('#team-find button').click()
		await expect(page.locator('#team-find button')).toHaveText('Find Players')
		await expect(page.locator('#team-settings select').nth(2)).toBeEnabled()
		await expect(rows.nth(0).locator('.team-chip')).toHaveText('Me')
	})

	test('a chip on several rows shows its player in only one of them', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
			.dragTo(rows.nth(1).locator('td').nth(4))
		await page.locator('#team-find button').click()
		await expect(rows.nth(1)).toContainText('Finding player', { timeout: 20_000 })
		await expect(rows.nth(0)).toContainText('(Me)')
		await page.locator('#team-find button').click()
	})

	test('a reload ends the search and keeps the table and settings', async ({ page }) => {
		await page.locator('#team-settings select').nth(2).selectOption('Asia')
		// "to" goes up first, since "from" only offers floors up to "to"
		await page.locator('#team-settings select').nth(4).selectOption('80')
		await page.locator('#team-settings select').nth(3).selectOption('70')
		await page.locator('#team-settings select').first().selectOption('Yes')
		await page.locator('#team-server-link-row input')
			.fill('https://www.roblox.com/share?code=0123456789abcdef0123456789abcdef&type=Server')
		await page.locator('#team-find button').click()
		await page.reload()
		await page.locator('#team-icon').click()
		await expect(page.locator('#team-find button')).toHaveText('Find Players')
		await expect(page.locator('#team-table tbody tr').first().locator('.team-chip')).toHaveText('Me')
		await expect(page.locator('#team-settings select').nth(2)).toHaveValue('Asia')
		await expect(page.locator('#team-settings select').nth(3)).toHaveValue('70')
		await expect(page.locator('#team-settings select').nth(4)).toHaveValue('80')
		await expect(page.locator('#team-settings select').first()).toHaveValue('Yes')
		await expect(page.locator('#team-server-link-row input'))
			.toHaveValue('https://www.roblox.com/share?code=0123456789abcdef0123456789abcdef&type=Server')
	})
})

test('TEAM SETTINGS start on Any and 25, with the Dandy Run and Early Dyle tooltips', async ({
	page,
}) => {
	await expect(page.locator('#team-settings select').first()).toHaveValue('Any')
	await expect(page.locator('#team-settings select').nth(1)).toHaveValue('Any')
	await expect(page.locator('#team-settings select').nth(2)).toHaveValue('Any')
	await expect(page.locator('#team-settings select').nth(3)).toHaveValue('25')
	await expect(page.locator('#team-settings select').nth(4)).toHaveValue('25')
	await expect(page.locator('#team-settings label', { hasText: 'Dandy Run' }))
		.toHaveAttribute('title', 'Don\'t buy anything in Dandy\'s shop!!')
	await expect(page.locator('#team-settings label', { hasText: 'Early Dyle' }))
		.toHaveAttribute('title', 'Vote the special "TIME\'S UP" card as soon as it appears')
})

test('the blue "?" opens the server link help on top with both pictures', async ({ page }) => {
	await page.locator('#team-server-link-help').click()
	await expect(page.locator('#team-howto')).toHaveAttribute('open')
	await expect(page.locator('#team-howto img[src="/howtomakeprivateserver1.webp"]')).toBeVisible()
	await expect(page.locator('#team-howto img[src="/howtomakeprivateserver2.webp"]')).toBeVisible()
	await expect(page.locator('#team')).toHaveAttribute('open')
})

test('the images route only lists the toons and trinkets folders', async ({ request }) => {
	expect((await request.get('/api/images/toons')).ok()).toBe(true)
	for (const path of [
		'/api/images/..',
		'/api/images/%2e%2e',
		'/api/images/toons%2f..%2f..',
		'/api/images/server',
	]) {
		const response = await request.get(path)
		expect(response.headers()['content-type'] ?? '').not.toContain('application/json')
	}
})

test('a check-in cannot give the host badges that the cookie does not hold', async ({
	request,
}) => {
	const pageId = crypto.randomUUID()
	const answer = await request.post('/api/check-in', {
		data: {
			pageId,
			team: {
				teamTableRows: [],
				removedRobloxUsernames: [],
				inviteCode: crypto.randomUUID(),
				serverLink: '',
				dandyRun: 'Any',
				earlyDyle: 'Any',
				region: 'Any',
				floorGoal: '50 to 50',
				isFindingPlayers: false,
				robloxBadgeNames: ['THE Machine'],
				robloxUsername: 'Impostor',
			},
			invite: null,
		},
	})
	expect(answer.ok()).toBe(true)
	const testDatabase = connectToTestDatabase()
	const { rows: [savedTeam] } = await testDatabase.query(
		'SELECT roblox_username, roblox_badge_names FROM teams WHERE team_id = $1',
		[pageId],
	)
	await request.post('/api/check-in/leave', { data: { pageId } })
	await testDatabase.end()
	expect(savedTeam.roblox_username).toBe('')
	expect(savedTeam.roblox_badge_names).toEqual([])
})

test('quotes and backslashes in a check-in are stored as they are', async ({ request }) => {
	const trickyText = `it's a \\ "test"'); DROP TABLE teams; --`
	const pageId = `${crypto.randomUUID()} ${trickyText}`
	const answer = await request.post('/api/check-in', {
		data: {
			pageId,
			team: {
				teamTableRows: [{
					toonPicture: trickyText,
					trinketAPicture: '',
					trinketBPicture: '',
					badgeNames: [],
					roleNames: [trickyText],
					isVerifiedPlayerRequired: false,
					reservedFor: 'me',
					isLeftEmpty: false,
				}],
				removedRobloxUsernames: [trickyText],
				inviteCode: pageId,
				serverLink: '',
				dandyRun: 'Any',
				earlyDyle: 'Any',
				region: trickyText,
				floorGoal: trickyText,
				isFindingPlayers: false,
			},
			invite: null,
		},
	})
	expect(answer.ok()).toBe(true)
	const testDatabase = connectToTestDatabase()
	const { rows: [savedTeam] } = await testDatabase.query(
		'SELECT * FROM teams WHERE team_id = $1',
		[pageId],
	)
	expect(savedTeam.region).toBe(trickyText)
	expect(savedTeam.removed_roblox_usernames).toEqual([trickyText])
	expect(savedTeam.team_table_rows[0].toonPicture).toBe(trickyText)
	expect(savedTeam.team_table_rows[0].roleNames).toEqual([trickyText])
	expect((await request.post('/api/check-in/leave', { data: { pageId } })).ok()).toBe(true)
	const { rows: teamsLeft } = await testDatabase.query(
		'SELECT * FROM teams WHERE team_id = $1',
		[pageId],
	)
	await testDatabase.end()
	expect(teamsLeft).toEqual([])
})
