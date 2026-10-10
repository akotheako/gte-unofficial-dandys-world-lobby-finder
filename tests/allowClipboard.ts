import type { BrowserContext } from '@playwright/test'

// Lets the pages of a browser profile copy text and the test read it back, through a stand-in for
// the clipboard that keeps the copied text until the page reloads. The real clipboard is shared
// with the rest of the computer, and Edge only lets a page write to it while its window has focus,
// so a test that shows its window could read back something else. The stand-in only reaches pages
// that load after this call.
export async function allowClipboard(context: BrowserContext) {
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
