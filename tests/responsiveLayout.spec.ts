import { expect, test } from '@playwright/test'

for (const screen of [
	{
		name: 'desktop',
		width: 1920,
		height: 1080,
	},
	{
		name: 'tablet',
		width: 1024,
		height: 768,
	},
	{
		name: 'phone',
		width: 390,
		height: 844,
	},
]) {
	test(`every window fits on a ${screen.name} screen`, async ({ page }) => {
		await page.setViewportSize({
			width: screen.width,
			height: screen.height,
		})
		await page.goto('/')
		for (const windowId of [
			'account',
			'team',
			'upvote',
		]) {
			await page.locator(`#${windowId}-icon`).click()
			// Waits for the window to finish growing out of its icon
			await page.waitForTimeout(400)
			// The side windows of Find a Team only show on a screen wide enough for them
			for (const element of await page.locator(
				`#${windowId}, #${windowId} #team-side-windows .window`,
			).filter({ visible: true }).all()) {
				const box = (await element.boundingBox())!
				expect(box.x).toBeGreaterThanOrEqual(0)
				expect(box.y).toBeGreaterThanOrEqual(0)
				expect(box.x + box.width).toBeLessThanOrEqual(screen.width)
				expect(box.y + box.height).toBeLessThanOrEqual(screen.height)
			}
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(screen.width)
			await page.locator(`#${windowId} .window-close`).first().click()
			await page.waitForTimeout(300)
		}
	})
}

test('side windows use viewport vertical positions beside both team windows', async ({
	page,
}) => {
	await page.setViewportSize({
		width: 1600,
		height: 900,
	})
	await page.goto('/')
	for (const windowId of ['team', 'browse']) {
		await page.locator(`#${windowId}-icon`).click()
		await page.waitForTimeout(250)
		const mainWindow = (await page.locator(`#${windowId}`).boundingBox())!
		const toonsWindow = (await page.locator(`#${windowId}-toons`).boundingBox())!
		const trinketsWindow = (await page.locator(`#${windowId}-trinkets`).boundingBox())!
		expect(toonsWindow.y).toBeCloseTo(180, 0)
		expect(trinketsWindow.y).toBeCloseTo(20, 0)
		// Horizontal placement remains tied to the main window's left and right edges.
		expect(Math.abs(toonsWindow.x + toonsWindow.width - mainWindow.x + 24)).toBeLessThan(3)
		expect(Math.abs(trinketsWindow.x - mainWindow.x - mainWindow.width - 24)).toBeLessThan(3)
		await page.locator(`#${windowId} .window-close`).first().click()
		await expect(page.locator(`#${windowId}`)).not.toHaveAttribute('open')
	}
})

test('on a phone, the boxes of a card open pick windows that fill them', async ({ page }) => {
	await page.setViewportSize({
		width: 390,
		height: 844,
	})
	await page.goto('/')
	await page.locator('#team-icon').click()
	await expect(page.locator('#team-table')).toBeHidden()
	const firstCard = page.locator('.team-card').first()
	await firstCard.locator('.team-card-box').nth(0).click()
	await expect(page.locator('#team-pick .window-title')).toContainText('Toons')
	await page.locator('#team-pick img').first().click()
	await expect(page.locator('#team-pick')).not.toHaveAttribute('open')
	await expect(firstCard.locator('.team-card-box').nth(0).locator('img')).toBeVisible()
	await firstCard.locator('.team-card-box').last().click()
	await expect(page.locator('#team-pick .window-title')).toContainText('Reserved Slots')
	await page.locator('#team-pick .team-chip', { hasText: 'Me' }).click()
	await expect(firstCard.locator('.team-card-box').last()).toContainText('Me')
	const secondCard = page.locator('.team-card').nth(1)
	await secondCard.locator('.team-card-box').nth(0).click()
	await page.locator('#team-pick .team-text', { hasText: '(Leave Empty)' }).click()
	await expect(secondCard).toHaveText('(Leave Empty)')
	await secondCard.click()
	await expect(secondCard).toContainText('Toon')
})

test('on a phone, the Toons pick window opens My Toons, which hides missing toons', async ({
	page,
}) => {
	await page.setViewportSize({
		width: 390,
		height: 844,
	})
	await page.goto('/')
	await page.locator('#team-icon').click()
	await page.locator('.team-card').first().locator('.team-card-box').nth(0).click()
	await page.locator('#team-pick .team-drag-hint button').click()
	await expect(page.locator('#team-owned-pictures')).toHaveAttribute('open')
	await page.locator('#team-owned-pictures img[title="bobette"]').click()
	await page.locator('#team-owned-pictures .window-close').click()
	await expect(page.locator('#team-pick img[title="bobette"]')).toHaveCount(0)
	await expect(page.locator('#team-pick .team-drag-hint button')).toHaveText('39/40 Toons')
})
