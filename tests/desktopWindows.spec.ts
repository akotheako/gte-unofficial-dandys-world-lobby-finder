import { expect, test } from '@playwright/test'

test('an icon opens its window and the × button closes it', async ({ page }) => {
	await page.goto('/')
	await page.locator('#account-icon').click()
	await expect(page.locator('#account')).toHaveAttribute('open')
	await page.locator('#account .window-close').click()
	await expect(page.locator('#account')).not.toHaveAttribute('open')
})

test('Esc closes the open window', async ({ page }) => {
	await page.goto('/')
	await page.locator('#team-icon').click()
	await expect(page.locator('#team')).toHaveAttribute('open')
	await page.keyboard.press('Escape')
	await expect(page.locator('#team')).not.toHaveAttribute('open')
})

test('opening one window closes the other one', async ({ page }) => {
	await page.goto('/')
	await page.locator('#account-icon').click()
	await page.locator('#team-icon').click()
	await expect(page.locator('#team')).toHaveAttribute('open')
	await expect(page.locator('#account')).not.toHaveAttribute('open')
})

test('the page stays clickable while a window is open', async ({ page }) => {
	await page.goto('/')
	await page.locator('#account-icon').click()
	// A modal dialog would make the icon behind it unclickable
	await page.locator('#team-icon').click({ timeout: 2000 })
	await expect(page.locator('#team')).toHaveAttribute('open')
})

test('the counters show "…" and then numbers', async ({ page }) => {
	await page.route('/api/check-in', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 1000))
		await route.continue()
	})
	await page.goto('/')
	await expect(page.locator('#counters')).toContainText('… online')
	await expect(page.locator('#counters')).toContainText('… looking for a team')
	// Neon wakes a sleeping database for the first check-in, which takes a few seconds
	await expect(page.locator('#counters')).toContainText(/\d+ online/, { timeout: 20_000 })
	await expect(page.locator('#counters')).toContainText(/\d+ looking for a team/)
})

test('Dark mode swaps the wallpaper and the window colors, also after a reload', async ({
	page,
}) => {
	await page.goto('/')
	await expect(page.locator('body')).toHaveCSS('background-image', /Gardenview_Rainbow_Print/)
	await expect(page.locator('#account')).toHaveCSS('background-color', 'rgb(192, 192, 192)')
	await page.locator('#options-icon').click()
	await page.locator('#dark-mode input').check()
	await expect(page.locator('body')).toHaveCSS('background-image', /Astro_Pattern_Print/)
	await expect(page.locator('#account')).toHaveCSS('background-color', 'rgb(52, 48, 74)')
	await page.reload()
	await expect(page.locator('#dark-mode input')).toBeChecked()
	await expect(page.locator('body')).toHaveCSS('background-image', /Astro_Pattern_Print/)
})

test('Options remembers its checkboxes, and a refused notification stays unchecked', async ({
	page,
}) => {
	await page.goto('/')
	await page.locator('#options-icon').click()
	const teamFoundBox = page.locator('#options-team-found')
	await teamFoundBox.getByLabel('Play a "Ding!" sound').check()
	await teamFoundBox.getByLabel('Join the server automatically').check()
	await page.reload()
	await expect(teamFoundBox.getByLabel('Play a "Ding!" sound')).toBeChecked()
	await expect(teamFoundBox.getByLabel('Join the server automatically')).toBeChecked()
	await expect(teamFoundBox.getByLabel('Flash the browser tab')).not.toBeChecked()

	await page.evaluate(() => {
		Notification.requestPermission = async () => 'denied'
	})
	await page.locator('#options-icon').click()
	await teamFoundBox.getByLabel('Show a notification').click()
	await expect(teamFoundBox.getByLabel('Show a notification')).not.toBeChecked()
	await expect(teamFoundBox.locator('.options-error')).toHaveText(
		'Notifications are blocked for this site in the browser settings.',
	)
})
