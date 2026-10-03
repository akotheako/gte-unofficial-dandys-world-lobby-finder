import {
	expect,
	test,
	type Browser,
	type Page,
} from '@playwright/test'
import { verifyAsRobloxAccount } from './verifyAsRobloxAccount.ts'

// Every test opens its own browser profiles, which close when it ends, so that the server sees the
// pages leave
async function openFindATeamAs({
	browser,
	username,
	path,
}: {
	browser: Browser
	username?: string
	path?: string
}) {
	const context = await browser.newContext()
	await context.grantPermissions([
		'clipboard-read',
		'clipboard-write',
	])
	if (username) {
		await verifyAsRobloxAccount({
			context,
			username,
			ownedBadgeNames: [],
		})
	}
	const page = await context.newPage()
	await page.goto(path ?? '/')
	if (!path) await page.locator('#team-icon').click()
	await page.waitForFunction(() => document.getAnimations().length === 0)
	return page
}

// Waits until the server saved the host's team, since a friend who opens the link before that gets
// "This invite link expired"
async function copyInviteLinkOf(hostPage: Page) {
	const teamSavedResponse = hostPage.waitForResponse((response) => (
		response.url().endsWith('/api/check-in')
		&& Boolean(response.request().postDataJSON().team)
	))
	await hostPage.getByRole('button', { name: 'Copy invite link' }).click()
	await teamSavedResponse
	return new URL(await hostPage.evaluate(() => navigator.clipboard.readText())).search
}

test('a verified friend joins the host\'s team and sees it locked', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: invitePath,
	})
	await expect(friendPage.locator('#team')).toHaveAttribute('open')
	await expect(friendPage.locator('#team-invited-friend')).toHaveText(
		'You are in @InviteHost\'s team. Closing this window takes you out of it.',
		{ timeout: 10_000 },
	)
	await expect(friendPage.locator('#team-reserved')).toHaveCount(0)
	await expect(friendPage.locator('#team-server-link-row')).toHaveCount(0)
	await expect(friendPage.locator('#team-find button')).toHaveCount(0)
	await expect(friendPage.locator('#team-settings select').first()).toBeDisabled()
	await expect(hostPage.locator('#team-reserved .team-chip', { hasText: '@InvitedFriend' }))
		.toBeVisible({ timeout: 20_000 })
	await friendPage.context().close()
	await hostPage.context().close()
})

test('the friend sees the host\'s changes', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: invitePath,
	})
	await expect(friendPage.locator('#team-invited-friend')).toContainText('You are in', {
		timeout: 10_000,
	})
	await hostPage.locator('#team-toons img[title="bobette"]')
		.dragTo(hostPage.locator('#team-table tbody tr').first().locator('td').first())
	await expect(friendPage.locator('#team-table tbody tr').first().locator('img'))
		.toHaveAttribute('title', 'bobette', { timeout: 20_000 })
	await friendPage.context().close()
	await hostPage.context().close()
})

test('a friend who closes Find a Team shows as "left the team"', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: invitePath,
	})
	const friendChip = hostPage.locator('#team-reserved .team-chip', { hasText: '@InvitedFriend' })
	await expect(friendChip).toBeVisible({ timeout: 20_000 })
	await friendChip.dragTo(hostPage.locator('#team-table tbody tr').first().locator('td').nth(5))
	await hostPage.locator('#team-reserved .team-chip', { hasText: 'Me' })
		.dragTo(hostPage.locator('#team-table tbody tr').nth(1).locator('td').nth(5))
	await friendPage.locator('#team .window-close').first().click()
	await expect(hostPage.locator('#team-table .team-chip').first())
		.toHaveText('@InvitedFriend (left the team)', { timeout: 20_000 })
	await expect(hostPage.locator('#team-find button')).toBeDisabled()
	await expect(hostPage.locator('#team-find')).toHaveAttribute(
		'title',
		'A verified friend in the table left the team. Drag their name out of the table.',
	)
	await friendPage.context().close()
	await hostPage.context().close()
})

test('a removed friend cannot come back with the link', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: invitePath,
	})
	await hostPage.locator('#team-reserved .team-reserved-friend', { hasText: '@InvitedFriend' })
		.getByLabel('Remove friend')
		.click({ timeout: 20_000 })
	await expect(friendPage.locator('#team-form-error'))
		.toHaveText('The host took you out of the team', { timeout: 20_000 })
	const returningPage = await friendPage.context().newPage()
	await returningPage.goto(invitePath)
	await expect(returningPage.locator('#team-form-error'))
		.toHaveText('The host took you out of the team', { timeout: 20_000 })
	await friendPage.context().close()
	await hostPage.context().close()
})

test('the link lets no new friend in once the team searches', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	await hostPage.locator('#team-reserved .team-chip', { hasText: 'Me' })
		.dragTo(hostPage.locator('#team-table tbody tr').first().locator('td').nth(5))
	// Settings that no other test uses, so that this search merges with nobody
	await hostPage.locator('#team-settings select').nth(1).selectOption('100+')
	await hostPage.locator('#team-settings select').first().selectOption('Oceania')
	await hostPage.locator('#team-find button').click()
	await expect(hostPage.locator('#team-find button'))
		.toHaveText('Finding Players (Click to Cancel)')
	const friendPage = await openFindATeamAs({
		browser,
		username: 'LateFriend',
		path: invitePath,
	})
	await expect(friendPage.locator('#team-form-error'))
		.toHaveText('The team already started finding players', { timeout: 20_000 })
	expect(new URL(friendPage.url()).search).toBe('')
	await friendPage.context().close()
	await hostPage.context().close()
})

test('the same account cannot join twice in two tabs', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: invitePath,
	})
	await expect(friendPage.locator('#team-invited-friend')).toContainText('You are in', {
		timeout: 10_000,
	})
	const secondTab = await friendPage.context().newPage()
	await secondTab.goto(invitePath)
	await expect(secondTab.locator('#team-form-error'))
		.toHaveText('You already joined this team in another tab', { timeout: 20_000 })
	await friendPage.context().close()
	await hostPage.context().close()
})

test('the host opening their own link in a new tab does not join their own team', async ({
	browser,
}) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const secondTab = await hostPage.context().newPage()
	await secondTab.goto(invitePath)
	await expect(secondTab.locator('#team-form-error'))
		.toHaveText('This invite link is for your friends, send it to them', { timeout: 20_000 })
	await expect(hostPage.locator('#team-reserved .team-chip', { hasText: '@InviteHost' }))
		.toHaveCount(0)
	await hostPage.context().close()
})

test('the host opening their own link in the same tab ends the team', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	await hostPage.goto(invitePath)
	await expect(hostPage.locator('#team-form-error'))
		.toHaveText('This invite link expired', { timeout: 20_000 })
	await hostPage.context().close()
})

test('a link with an unknown code expired', async ({ browser }) => {
	const friendPage = await openFindATeamAs({
		browser,
		username: 'InvitedFriend',
		path: '/?invite=no-such-team',
	})
	await expect(friendPage.locator('#team-form-error'))
		.toHaveText('This invite link expired', { timeout: 20_000 })
	await friendPage.context().close()
})

test('an unverified friend joins on their own after verifying', async ({ browser }) => {
	const hostPage = await openFindATeamAs({
		browser,
		username: 'InviteHost',
	})
	const invitePath = `/${await copyInviteLinkOf(hostPage)}`
	const friendPage = await openFindATeamAs({
		browser,
		path: invitePath,
	})
	await expect(friendPage.locator('#team-invited-friend')).toHaveText(
		'Verify your Roblox account in Roblox Verification to join the team that invited you.',
		{ timeout: 20_000 },
	)
	expect(new URL(friendPage.url()).search).toBe(invitePath.slice(1))
	await verifyAsRobloxAccount({
		context: friendPage.context(),
		username: 'LateVerifier',
		ownedBadgeNames: [],
	})
	await expect(friendPage.locator('#team-invited-friend')).toHaveText(
		'You are in @InviteHost\'s team. Closing this window takes you out of it.',
		{ timeout: 20_000 },
	)
	await expect(hostPage.locator('#team-reserved .team-chip', { hasText: '@LateVerifier' }))
		.toBeVisible({ timeout: 20_000 })
	await friendPage.context().close()
	await hostPage.context().close()
})
