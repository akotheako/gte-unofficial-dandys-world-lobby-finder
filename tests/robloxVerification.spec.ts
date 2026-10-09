import { expect, test } from '@playwright/test'
import { allowClipboard } from './allowClipboard.ts'
import { verifyAsRobloxAccount } from './verifyAsRobloxAccount.ts'

// The real Roblox API stays out of the tests, so the routes that call it answer from here, the way
// that the server answers them

test('the emoji code has the sentence and 8 emojis, and Copy copies it', async ({ page }) => {
	await allowClipboard(page.context())
	await page.goto('/')
	await page.locator('#account-icon').click()
	const emojiCodeField = page.locator('#account-code input')
	await expect(emojiCodeField).toHaveValue(
		/^This is my verification code for DW Team Finder! \p{Extended_Pictographic}{8}$/u,
	)
	await page.locator('#account-code button').click()
	await expect(page.locator('#account-code button')).toHaveText('Copied!')
	expect(await page.evaluate(() => navigator.clipboard.readText()))
		.toBe(await emojiCodeField.inputValue())
	await expect(page.locator('#account-code button')).toHaveText('Copy', { timeout: 5000 })
})

test('an empty username field cannot be checked', async ({ page }) => {
	let wasCheckSent = false
	await page.route('/api/roblox/check', (route) => {
		wasCheckSent = true
		return route.abort()
	})
	await page.goto('/')
	await page.locator('#account-icon').click()
	await page.locator('#account-username button').click()
	expect(wasCheckSent).toBe(false)
})

for (const robloxError of [
	'No Roblox account has that username',
	'The code is not in your profile description yet',
]) {
	test(`a failed check shows "${robloxError}"`, async ({ page }) => {
		await page.route('/api/roblox/check', (route) => route.fulfill({
			status: 400,
			json: { error: robloxError },
		}))
		await page.goto('/')
		await page.locator('#account-icon').click()
		await page.locator('#account-username input').fill('someone')
		await page.locator('#account-username button').click()
		await expect(page.locator('#account-username p')).toHaveText(robloxError)
	})
}

test('a successful check shows the account and its badges', async ({ page }) => {
	await page.route('/api/roblox/check', (route) => route.fulfill({
		json: {
			id: 1,
			username: 'TestHost',
		},
	}))
	await page.route('/api/roblox/badges', (route) => route.fulfill({
		json: [
			{
				name: 'Speed Walker',
				owned: true,
			},
			{
				name: 'Hissy Fit',
				owned: false,
			},
		],
	}))
	await page.goto('/')
	await page.locator('#account-icon').click()
	await page.locator('#account-username input').fill('TestHost')
	await page.locator('#account-username button').click()
	await expect(page.locator('#account')).toContainText('Verified as TestHost')
	await expect(page.locator('#account-badges')).toContainText('✅ Speed Walker')
	await expect(page.locator('#account-badges')).toContainText('⬜ Hissy Fit')
})

test('the account and its badges from the cookie survive a reload', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'TestHost',
		ownedBadgeNames: ['Marathon Runner'],
	})
	await page.goto('/')
	await page.reload()
	await page.locator('#account-icon').click()
	await expect(page.locator('#account')).toContainText('Verified as TestHost')
	await expect(page.locator('#account-badges li')).toHaveCount(14)
	await expect(page.locator('#account-badges')).toContainText('✅ Marathon Runner')
	await expect(page.locator('#account-badges')).toContainText('⬜ Speed Walker')
})

test('a private inventory shows its error', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'TestHost',
	})
	await page.route('/api/roblox/badges', (route) => route.fulfill({
		status: 403,
		json: { error: 'Make your Roblox inventory public to show your badges' },
	}))
	await page.goto('/')
	await page.locator('#account-icon').click()
	await expect(page.locator('#account'))
		.toContainText('Make your Roblox inventory public to show your badges')
})

test('a failed Update Badges keeps the old badges with a red error', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'TestHost',
		ownedBadgeNames: ['Hissy Fit'],
	})
	await page.route('/api/roblox/badges?refresh', (route) => route.fulfill({
		status: 503,
		json: { error: 'Roblox is busy right now, try again in a minute' },
	}))
	await page.goto('/')
	await page.locator('#account-icon').click()
	await expect(page.locator('#account-badges')).toContainText('✅ Hissy Fit')
	await page.getByRole('button', { name: 'Update Badges' }).click()
	await expect(page.locator('#account-badge-update-error'))
		.toHaveText('Roblox is busy right now, try again in a minute')
	await expect(page.locator('#account-badges')).toContainText('✅ Hissy Fit')
})

test('Log out forgets the account, also after a reload', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'TestHost',
		ownedBadgeNames: [],
	})
	await page.goto('/')
	await page.locator('#account-icon').click()
	await page.getByRole('button', { name: 'Log out' }).click()
	await expect(page.locator('#account-username')).toBeVisible()
	await page.reload()
	await page.locator('#account-icon').click()
	await expect(page.locator('#account-username')).toBeVisible()
	await expect(page.locator('#account')).not.toContainText('Verified as')
})

test('a second account shows only its own badges', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'FirstAccount',
		ownedBadgeNames: ['Overtime'],
	})
	await page.goto('/')
	await page.locator('#account-icon').click()
	await expect(page.locator('#account-badges')).toContainText('✅ Overtime')
	await page.getByRole('button', { name: 'Log out' }).click()
	await page.route('/api/roblox/check', (route) => route.fulfill({
		json: {
			id: 2,
			username: 'SecondAccount',
		},
	}))
	await page.route('/api/roblox/badges', (route) => route.fulfill({
		json: [{
			name: 'Overtime',
			owned: false,
		}],
	}))
	await page.locator('#account-username input').fill('SecondAccount')
	await page.locator('#account-username button').click()
	await expect(page.locator('#account')).toContainText('Verified as SecondAccount')
	await expect(page.locator('#account-badges')).toContainText('⬜ Overtime')
})

test('a changed roblox cookie counts as not verified', async ({
	page,
	context,
}) => {
	await verifyAsRobloxAccount({
		context,
		username: 'TestHost',
		ownedBadgeNames: [],
	})
	const [cookie] = await context.cookies()
	await context.addCookies([{
		...cookie,
		value: cookie.value.replace('TestHost', 'Impostor'),
	}])
	await page.goto('/')
	await page.locator('#account-icon').click()
	await expect(page.locator('#account-username')).toBeVisible()
})
