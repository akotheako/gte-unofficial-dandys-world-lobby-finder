import { expect, test } from '@playwright/test'
import { reportsReaderRobloxUserId } from '../shared/reports.ts'
import { connectToTestDatabase } from './testDatabase.ts'
import { verifyAsRobloxAccount } from './verifyAsRobloxAccount.ts'

test('the fan project icon opens a window that says Blushcrunch did not make the site', async ({
	page,
}) => {
	await page.goto('/')
	await page.locator('#fan-project-icon').click()
	await expect(page.locator('#fan-project')).toHaveAttribute('open')
	await expect(page.locator('#fan-project')).toContainText(
		'This project was made by fans for fans, and not made by Blushcrunch.',
	)
})

test('the game topics disable the message box and Send and point to Discord', async ({
	page,
}) => {
	await page.goto('/')
	await page.locator('#contact-report-icon').click()
	const form = page.locator('#contact-report-form')
	await expect(form.locator('select')).toHaveValue('Report a bug in the website')
	await expect(form.locator('textarea')).toBeEnabled()
	await expect(page.locator('#contact-report-discord')).toHaveCount(0)
	for (const topic of ['Report a bug in the game', 'Report a player']) {
		await form.locator('select').selectOption(topic)
		await expect(form.locator('textarea')).toBeDisabled()
		await expect(form.locator('button')).toBeDisabled()
		await expect(page.locator('#contact-report-discord')).toHaveText(
			`To ${topic.toLowerCase()}, join the Blushcrunch official discord server. This form is only for issues about this website, not the game itself or its players. Thank you!`,
		)
		await expect(page.locator('#contact-report-discord a')).toHaveAttribute(
			'href',
			'https://discord.com/invite/dandysworld',
		)
	}
	await form.locator('select').selectOption('Other')
	await expect(form.locator('textarea')).toBeEnabled()
	await expect(page.locator('#contact-report-discord')).toHaveCount(0)
})

test('Send stays disabled while the message box is empty', async ({ page }) => {
	await page.goto('/')
	await page.locator('#contact-report-icon').click()
	const form = page.locator('#contact-report-form')
	await expect(form.locator('button')).toBeDisabled()
	await form.locator('textarea').fill('   ')
	await expect(form.locator('button')).toBeDisabled()
	await form.locator('textarea').fill('Hello')
	await expect(form.locator('button')).toBeEnabled()
})

test('Send stores the report with the username of a verified sender', async ({
	page,
	context,
}) => {
	const message = `The website broke ${crypto.randomUUID()}`
	await context.setExtraHTTPHeaders({ 'x-forwarded-for': crypto.randomUUID() })
	await verifyAsRobloxAccount({
		context,
		username: 'ReportSender',
	})
	await page.goto('/')
	await page.locator('#contact-report-icon').click()
	const form = page.locator('#contact-report-form')
	await form.locator('textarea').fill(message)
	await form.locator('button').click()
	await expect(form).toContainText('Sent! Thank you for your message.')
	await expect(form.locator('textarea')).toHaveValue('')
	const testDatabase = connectToTestDatabase()
	const { rows } = await testDatabase.query(`
		SELECT topic, roblox_username FROM reports WHERE message = $1
	`, [message])
	await testDatabase.end()
	expect(rows).toEqual([{
		topic: 'Report a bug in the website',
		roblox_username: 'ReportSender',
	}])
})

test('the server rejects game topics, empty messages and messages that are too long', async ({
	request,
}) => {
	for (const report of [
		{
			topic: 'Report a player',
			message: 'Someone was mean',
		},
		{
			topic: 'Other',
			message: '  ',
		},
		{
			topic: 'Other',
			message: 'a'.repeat(2001),
		},
	]) {
		const res = await request.post('/api/reports', { data: report })
		expect(res.status()).toBe(400)
	}
})

test('a sender can only send one report per minute', async ({ request }) => {
	const senderIp = crypto.randomUUID()
	const sendReport = () => request.post('/api/reports', {
		headers: { 'x-forwarded-for': senderIp },
		data: {
			topic: 'Other',
			message: `Hello ${crypto.randomUUID()}`,
		},
	})
	expect((await sendReport()).status()).toBe(204)
	const secondReport = await sendReport()
	expect(secondReport.status()).toBe(429)
	expect((await secondReport.json()).error).toBe(
		'You can only send one report per minute. Please try again soon.',
	)
	const otherSenderReport = await request.post('/api/reports', {
		headers: { 'x-forwarded-for': crypto.randomUUID() },
		data: {
			topic: 'Other',
			message: 'Hello from someone else',
		},
	})
	expect(otherSenderReport.status()).toBe(204)
})

test('only one of several reports that a sender sends at the same moment is stored', async ({
	request,
}) => {
	const senderIp = crypto.randomUUID()
	const statuses = await Promise.all([1, 2, 3, 4, 5].map(async () => (
		await request.post('/api/reports', {
			headers: { 'x-forwarded-for': senderIp },
			data: {
				topic: 'Other',
				message: `Hello ${crypto.randomUUID()}`,
			},
		})
	).status()))
	expect(statuses.sort()).toEqual([204, 429, 429, 429, 429])
})

test('only @akotheakotheako sees the Reports icon, and it lists the reports', async ({
	page,
	context,
	browser,
}) => {
	const message = `Please add more toons ${crypto.randomUUID()}`
	await context.setExtraHTTPHeaders({ 'x-forwarded-for': crypto.randomUUID() })
	await page.goto('/')
	await page.locator('#contact-report-icon').click()
	await page.locator('#contact-report-form select').selectOption('Other')
	await page.locator('#contact-report-form textarea').fill(message)
	await page.locator('#contact-report-form button').click()
	await expect(page.locator('#contact-report-form')).toContainText('Sent!')
	await expect(page.locator('#reports-icon')).toHaveCount(0)

	const ownerContext = await browser.newContext()
	await verifyAsRobloxAccount({
		context: ownerContext,
		username: 'akotheakotheako',
		robloxUserId: reportsReaderRobloxUserId,
	})
	const ownerPage = await ownerContext.newPage()
	await ownerPage.goto('/')
	await ownerPage.locator('#reports-icon').click()
	const card = ownerPage.locator('.reports-card', { hasText: message })
	await expect(card).toContainText('Other')
	await expect(card).toContainText('Unverified sender')
	await ownerContext.close()

	// Another account with the same username is still not the owner
	await verifyAsRobloxAccount({
		context,
		username: 'akotheakotheako',
	})
	await page.reload()
	await page.locator('#account-icon').click()
	await expect(page.locator('#account')).toContainText('Verified as akotheakotheako')
	await expect(page.locator('#reports-icon')).toHaveCount(0)
})

test('the server only sends the reports to the Roblox user ID of @akotheakotheako', async ({
	request,
	context,
	page,
}) => {
	expect((await request.get('/api/reports')).status()).toBe(403)
	await verifyAsRobloxAccount({
		context,
		username: 'akotheakotheako',
	})
	expect((await page.request.get('/api/reports')).status()).toBe(403)
})
