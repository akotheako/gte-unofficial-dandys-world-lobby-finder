import type { BrowserContext } from '@playwright/test'

// Lets the pages of a browser profile copy text and the test read it back. Chromium grants the
// real clipboard. Firefox and WebKit refuse a script that reads the clipboard, so their pages get a
// stand-in that keeps the copied text until the page reloads. The stand-in only reaches pages that
// load after this call.
export async function allowClipboard(context: BrowserContext) {
	if (context.browser()?.browserType().name() === 'chromium') {
		await context.grantPermissions([
			'clipboard-read',
			'clipboard-write',
		])
		return
	}
	await context.addInitScript(() => {
		let copiedText = ''
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: async (text: string) => {
					copiedText = text
				},
				readText: async () => copiedText,
			},
		})
	})
}
