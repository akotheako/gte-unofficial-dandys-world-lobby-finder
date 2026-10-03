import { expect, test } from '@playwright/test'
import { verifyAsRobloxAccount } from './verifyAsRobloxAccount.ts'

test.beforeEach(async ({ page }) => {
	await page.goto('/')
	await page.locator('#team-icon').click()
	await expect(page.locator('#team-toons img').first()).toBeVisible()
	// A drag during the window's grow animation aims at where the cells are moving to
	await page.waitForFunction(() => document.getAnimations().length === 0)
})

test.describe('before verifying', () => {
	test('the table has 8 rows and the columns without Badges', async ({ page }) => {
		await expect(page.locator('#team-table thead th')).toHaveText([
			'Toon',
			'Trinket A',
			'Trinket B',
			'Role',
			'Player',
		])
		await expect(page.locator('#team-table tbody tr')).toHaveCount(8)
		await expect(page.locator('.team-verified-only')).toHaveCount(0)
	})

	test('every Role cell starts with Extractor', async ({ page }) => {
		for (const roleCell of await page.locator('#team-table tbody tr td:nth-child(4)').all()) {
			await expect(roleCell).toHaveText('Extractor')
		}
	})

	test('empty picture cells show (Any)', async ({ page }) => {
		await expect(page.locator('#team-table tbody tr').first().locator('td').nth(0))
			.toHaveText('(Any)')
		await expect(page.locator('#team-table .team-placeholder', { hasText: '(Any)' }).first())
			.not.toHaveAttribute('draggable', 'true')
	})

	test('the side windows show "Drag onto the table" and list every picture', async ({ page }) => {
		await expect(page.locator('#team-toons .team-drag-hint')).toHaveText('Drag onto the table')
		await expect(page.locator('#team-trinkets .team-drag-hint')).toHaveText('Drag onto the table')
		await expect(page.locator('#team-toons img')).toHaveCount(40)
		await expect(page.locator('#team-toons img[title="bobette"]')).toBeVisible()
		await expect(page.locator('#team-trinkets img[title="alarm"]')).toBeVisible()
	})

	test('the Reserved window shows ME and UNVERIFIED FRIENDS', async ({ page }) => {
		await expect(page.locator('#team-reserved legend')).toHaveText([
			'ME',
			'UNVERIFIED FRIENDS',
		])
	})
})

test.describe('dragging pictures', () => {
	test('a toon drops into a Toon cell and stays in its side window', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons img[title="bobette"]').dragTo(firstRow.locator('td').nth(0))
		await expect(firstRow.locator('td').nth(0).locator('img')).toHaveAttribute('title', 'bobette')
		await expect(page.locator('#team-toons img[title="bobette"]')).toBeVisible()
	})

	test('a drop replaces the picture that was in the cell', async ({ page }) => {
		const toonCell = page.locator('#team-table tbody tr').first().locator('td').nth(0)
		await page.locator('#team-toons img[title="bobette"]').dragTo(toonCell)
		await page.locator('#team-toons img[title="vee"]').dragTo(toonCell)
		await expect(toonCell.locator('img')).toHaveAttribute('title', 'vee')
	})

	test('a toon does not drop into a Trinket cell, nor a trinket into a Toon cell', async ({
		page,
	}) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons img[title="bobette"]').dragTo(firstRow.locator('td').nth(1))
		await expect(firstRow.locator('td').nth(1)).toHaveText('(Any)')
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(firstRow.locator('td').nth(0))
		await expect(firstRow.locator('td').nth(0)).toHaveText('(Any)')
	})

	test('a picture dragged from the table to another cell moves there', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await page.locator('#team-toons img[title="bobette"]').dragTo(rows.nth(0).locator('td').nth(0))
		await rows.nth(0).locator('td').nth(0).locator('.team-text')
			.dragTo(rows.nth(1).locator('td').nth(0))
		await expect(rows.nth(1).locator('td').nth(0).locator('img'))
			.toHaveAttribute('title', 'bobette')
		await expect(rows.nth(0).locator('td').nth(0)).toHaveText('(Any)')
	})

	test('a picture dragged from the table and dropped elsewhere empties its cell', async ({
		page,
	}) => {
		const toonCell = page.locator('#team-table tbody tr').first().locator('td').nth(0)
		await page.locator('#team-toons img[title="bobette"]').dragTo(toonCell)
		await toonCell.locator('.team-text').dragTo(page.locator('#team > .window-title'))
		await expect(toonCell).toHaveText('(Any)')
	})

	test('a row refuses the same trinket in both trinket columns', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(firstRow.locator('td').nth(1))
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(firstRow.locator('td').nth(2))
		await expect(firstRow.locator('td').nth(2)).toHaveText('(Any)')
	})

	test('a trinket refused from another row stays in its row', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(rows.nth(0).locator('td').nth(1))
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(rows.nth(1).locator('td').nth(1))
		await rows.nth(1).locator('td').nth(1).locator('.team-text')
			.dragTo(rows.nth(0).locator('td').nth(2))
		await expect(rows.nth(0).locator('td').nth(2)).toHaveText('(Any)')
		await expect(rows.nth(1).locator('td').nth(1).locator('img')).toHaveAttribute('title', 'alarm')
	})

	test('a trinket moves between the two trinket columns of its row', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(firstRow.locator('td').nth(1))
		await firstRow.locator('td').nth(1).locator('.team-text').dragTo(firstRow.locator('td').nth(2))
		await expect(firstRow.locator('td').nth(1)).toHaveText('(Any)')
		await expect(firstRow.locator('td').nth(2).locator('img')).toHaveAttribute('title', 'alarm')
	})

	test('(Leave Empty) merges the row, and a click brings it back', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons .team-text', { hasText: '(Leave Empty)' })
			.dragTo(firstRow.locator('td').nth(2))
		await expect(firstRow.locator('td')).toHaveCount(1)
		await expect(firstRow).toHaveText('(Leave Empty)')
		await firstRow.locator('td').click()
		await expect(firstRow.locator('td')).toHaveCount(5)
	})

	test('a toon dropped on a left-empty row brings it back with the toon', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons .team-text', { hasText: '(Leave Empty)' })
			.dragTo(firstRow.locator('td').nth(0))
		await page.locator('#team-toons img[title="vee"]').dragTo(firstRow.locator('td').first())
		await expect(firstRow.locator('td').nth(0).locator('img')).toHaveAttribute('title', 'vee')
	})

	test('a trinket dropped on a left-empty row lands in Trinket A', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons .team-text', { hasText: '(Leave Empty)' })
			.dragTo(firstRow.locator('td').nth(0))
		await page.locator('#team-trinkets img[title="alarm"]').dragTo(firstRow.locator('td').first())
		await expect(firstRow.locator('td').nth(1).locator('img')).toHaveAttribute('title', 'alarm')
	})

	test('the table survives a reload', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await page.locator('#team-toons img[title="bobette"]').dragTo(firstRow.locator('td').nth(0))
		await page.locator('#team-toons .team-text', { hasText: '(Leave Empty)' })
			.dragTo(page.locator('#team-table tbody tr').nth(7).locator('td').nth(0))
		await page.reload()
		await page.locator('#team-icon').click()
		await expect(page.locator('#team-table tbody tr').first().locator('td').nth(0).locator('img'))
			.toHaveAttribute('title', 'bobette')
		await expect(page.locator('#team-table tbody tr').nth(7)).toHaveText('(Leave Empty)')
	})
})

test.describe('Roles window', () => {
	test('a Role cell opens the Roles window with 6 roles', async ({ page }) => {
		await page.locator('#team-table tbody tr').first().locator('td').nth(3).click()
		await expect(page.locator('#team-roles')).toHaveAttribute('open')
		await expect(page.locator('#team-roles label')).toHaveText([
			'Distracts Pebble',
			'Distracts grabbers',
			'Distracts the rest',
			'Babysits Glisten',
			'Solar Support',
			'Extractor',
		])
	})

	test('checked roles stack in the cell, and no role shows (none required)', async ({ page }) => {
		const roleCell = page.locator('#team-table tbody tr').first().locator('td').nth(3)
		await roleCell.click()
		await page.locator('#team-roles label', { hasText: 'Distracts Pebble' }).click()
		await expect(roleCell.locator('.team-badge-or-role')).toHaveText([
			'Extractor',
			'Distracts Pebble',
		])
		await page.locator('#team-roles label', { hasText: 'Extractor' }).click()
		await page.locator('#team-roles label', { hasText: 'Distracts Pebble' }).click()
		await expect(roleCell).toHaveText('(none required)')
	})

	test('Solar Support is crossed out unless the toon is Bobette', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await firstRow.locator('td').nth(3).click()
		await page.locator('#team-roles label', { hasText: 'Solar Support' }).click()
		await page.locator('#team-roles .window-close').click()
		const solarSupport = firstRow.locator('.team-badge-or-role', { hasText: 'Solar Support' })
		await expect(solarSupport).toHaveAttribute('data-crossed-out', 'true')
		await expect(solarSupport)
			.toHaveAttribute('title', 'Only Bobette can help with Solar Distracting')
		await page.locator('#team-toons img[title="bobette"]').dragTo(firstRow.locator('td').nth(0))
		await expect(solarSupport).toHaveAttribute('data-crossed-out', 'false')
		await firstRow.locator('td').nth(0).locator('.team-text')
			.dragTo(page.locator('#team > .window-title'))
		await expect(solarSupport).toHaveAttribute('data-crossed-out', 'true')
	})

	test('Paste stays greyed out until Copy, and copies exactly the checked roles', async ({
		page,
	}) => {
		const rows = page.locator('#team-table tbody tr')
		await rows.nth(0).locator('td').nth(3).click()
		const pasteButton = page.locator('#team-roles button', { hasText: 'Paste' })
		await expect(pasteButton).toBeDisabled()
		await page.locator('#team-roles label', { hasText: 'Babysits Glisten' }).click()
		await page.locator('#team-roles label', { hasText: 'Extractor' }).click()
		await page.locator('#team-roles button', { hasText: 'Copy' }).click()
		await expect(page.locator('#team-roles .team-checklist-buttons button').first())
			.toHaveText('Copied!')
		await page.locator('#team-roles .window-close').click()
		await rows.nth(1).locator('td').nth(3).click()
		await page.locator('#team-roles .team-checklist-buttons button').nth(1).click()
		await expect(page.locator('#team-roles .team-checklist-buttons button').nth(1))
			.toHaveText('Pasted!')
		await expect(rows.nth(1).locator('td').nth(3)).toHaveText('Babysits Glisten')
		await expect(page.locator('#team-roles .team-checklist-buttons button').nth(1))
			.toHaveText('Paste', { timeout: 5000 })
	})

	test('Solar Support sent to the server only on Bobette rows', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await rows.nth(0).locator('td').nth(3).click()
		await page.locator('#team-roles label', { hasText: 'Solar Support' }).click()
		await page.locator('#team-roles .window-close').click()
		await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
			.dragTo(rows.nth(0).locator('td').nth(4))
		const checkInRequest = page.waitForRequest((request) => (
			request.url().endsWith('/api/check-in') && Boolean(request.postDataJSON().team)
		))
		await page.locator('#team-find button').click()
		const sentRows = (await checkInRequest).postDataJSON().team.teamTableRows
		expect(sentRows[0].roleNames).toEqual(['Extractor'])
		await page.locator('#team-find button').click()
	})
})

test.describe('Reserved window and Player column', () => {
	test('"+ Add unverified friend" numbers after the highest number', async ({ page }) => {
		const addButton = page.getByRole('button', { name: '+ Add unverified friend' })
		await addButton.click()
		await addButton.click()
		await addButton.click()
		const friendChips = page.locator('#team-reserved .team-reserved-friend')
		await friendChips.filter({ hasText: 'Unverified friend #2' }).getByLabel('Remove friend').click()
		await addButton.click()
		await expect(friendChips.locator('.team-chip')).toHaveText([
			'Me',
			'Unverified friend #1',
			'Unverified friend #3',
			'Unverified friend #4',
		])
		await page.reload()
		await page.locator('#team-icon').click()
		await expect(page.locator('#team-reserved .team-chip')).toHaveText([
			'Me',
			'Unverified friend #1',
			'Unverified friend #3',
			'Unverified friend #4',
		])
	})

	test('a chip can go on several rows and replaces the chip in a cell', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await page.getByRole('button', { name: '+ Add unverified friend' }).click()
		const meChip = page.locator('#team-reserved .team-chip', { hasText: 'Me' })
		await meChip.dragTo(rows.nth(0).locator('td').nth(4))
		await meChip.dragTo(rows.nth(1).locator('td').nth(4))
		await page.locator('#team-reserved .team-chip', { hasText: 'Unverified friend #1' })
			.dragTo(rows.nth(1).locator('td').nth(4))
		await expect(rows.nth(0).locator('td').nth(4)).toHaveText('Me')
		await expect(rows.nth(1).locator('td').nth(4)).toHaveText('Unverified friend #1')
	})

	test('a chip in the table moves to another row or empties when dropped elsewhere', async ({
		page,
	}) => {
		const rows = page.locator('#team-table tbody tr')
		await page.locator('#team-reserved .team-chip', { hasText: 'Me' })
			.dragTo(rows.nth(0).locator('td').nth(4))
		await rows.nth(0).locator('.team-chip').dragTo(rows.nth(2).locator('td').nth(4))
		await expect(rows.nth(0).locator('.team-chip')).toHaveCount(0)
		await expect(rows.nth(2).locator('.team-chip')).toHaveText('Me')
		await rows.nth(2).locator('.team-chip').dragTo(page.locator('#team > .window-title'))
		await expect(rows.nth(2).locator('.team-chip')).toHaveCount(0)
	})

	test('removing a friend also removes their chips from the table', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await page.getByRole('button', { name: '+ Add unverified friend' }).click()
		const friendChip = page.locator('#team-reserved .team-chip', { hasText: 'Unverified friend #1' })
		await friendChip.dragTo(rows.nth(0).locator('td').nth(4))
		await friendChip.dragTo(rows.nth(3).locator('td').nth(4))
		await page.locator('#team-reserved .team-reserved-friend', { hasText: 'Unverified friend #1' })
			.getByLabel('Remove friend').click()
		await expect(page.locator('#team-table .team-chip')).toHaveCount(0)
	})

	test('the Player header explains the rows that are left to find', async ({ page }) => {
		await expect(page.locator('#team-table th', { hasText: 'Player' }))
			.toHaveAttribute('title', /A row without a chip is left for a player to find/)
	})
})

test.describe('after verifying', () => {
	test.beforeEach(async ({
		page,
		context,
	}) => {
		await verifyAsRobloxAccount({
			context,
			username: 'TestHost',
			ownedBadgeNames: [
				'Speed Walker',
				'Long Distance Runner',
				'Overtime',
				'Hissy Fit',
				'Skilled Toon!',
			],
		})
		await page.reload()
		await page.locator('#team-icon').click()
		await page.waitForFunction(() => document.getAnimations().length === 0)
	})

	test('the Badges column, the checkboxes and VERIFIED FRIENDS appear', async ({ page }) => {
		await expect(page.locator('#team-table thead th')).toHaveText([
			'Toon',
			'Trinket A',
			'Trinket B',
			'Badges',
			'Role',
			'Player',
		])
		await expect(page.locator('.team-verified-only')).toHaveCount(8)
		await expect(page.locator('#team-reserved legend')).toHaveText([
			'ME',
			'VERIFIED FRIENDS',
			'UNVERIFIED FRIENDS',
		])
	})

	test('the Badges window lists the owned badges with lines between groups', async ({ page }) => {
		await page.locator('#team-table tbody tr').first().locator('td').nth(3).click()
		const badgeLabels = page.locator('#team-badges label')
		await expect(badgeLabels).toHaveText([
			'Speed Walker',
			'Long Distance Runner',
			'Overtime',
			'Hissy Fit',
			'Skilled Toon!',
		])
		const linesAbove = await badgeLabels.evaluateAll((labels) => (
			labels.map((label) => label.getAttribute('data-has-line-above'))
		))
		expect(linesAbove).toEqual([
			'false',
			'false',
			'true',
			'false',
			'true',
		])
	})

	test('a badge unchecks the other badge of its category', async ({ page }) => {
		const badgesCell = page.locator('#team-table tbody tr').first().locator('td').nth(3)
		await badgesCell.click()
		await page.locator('#team-badges label', { hasText: 'Speed Walker' }).click()
		await page.locator('#team-badges label', { hasText: 'Long Distance Runner' }).click()
		await page.locator('#team-badges label', { hasText: 'Overtime' }).click()
		await expect(badgesCell.locator('.team-badge-or-role')).toHaveText([
			'Long Distance Runner',
			'Overtime',
		])
	})

	test('badges are crossed out until "Verified only" is checked', async ({ page }) => {
		const firstRow = page.locator('#team-table tbody tr').first()
		await firstRow.locator('td').nth(3).click()
		await page.locator('#team-badges label', { hasText: 'Hissy Fit' }).click()
		await page.locator('#team-badges .window-close').click()
		const hissyFit = firstRow.locator('.team-badge-or-role', { hasText: 'Hissy Fit' })
		await expect(hissyFit).toHaveAttribute('data-crossed-out', 'true')
		await expect(hissyFit).toHaveAttribute('title', /Check "Verified only"/)
		await firstRow.locator('.team-verified-only input').check()
		await expect(hissyFit).toHaveAttribute('data-crossed-out', 'false')
	})

	test('the Badges and Roles windows remember their own copied names', async ({ page }) => {
		const rows = page.locator('#team-table tbody tr')
		await rows.nth(0).locator('td').nth(3).click()
		await page.locator('#team-badges label', { hasText: 'Overtime' }).click()
		await page.locator('#team-badges .team-checklist-buttons button').first().click()
		await page.locator('#team-badges .window-close').click()
		await rows.nth(1).locator('td').nth(4).click()
		await expect(page.locator('#team-roles .team-checklist-buttons button').nth(1)).toBeDisabled()
		await page.locator('#team-roles .window-close').click()
		await rows.nth(1).locator('td').nth(3).click()
		await page.locator('#team-badges .team-checklist-buttons button').nth(1).click()
		await expect(rows.nth(1).locator('td').nth(3)).toHaveText('Overtime')
	})

	test('"Copy invite link" copies one link per tab', async ({ page }) => {
		const copyButton = page.getByRole('button', { name: 'Copy invite link' })
		await copyButton.click()
		await expect(page.locator('#team-reserved button', { hasText: 'Copied!' })).toBeVisible()
		const inviteLink = await page.evaluate(() => navigator.clipboard.readText())
		expect(inviteLink).toMatch(/^http:\/\/localhost:3100\/\?invite=[\w-]+$/)
		await page.reload()
		await page.locator('#team-icon').click()
		await page.getByRole('button', { name: 'Copy invite link' }).click()
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(inviteLink)
	})
})
