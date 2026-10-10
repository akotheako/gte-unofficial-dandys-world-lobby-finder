import { mkdirSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

// Every run keeps its own folder in test-runs/, named after the time it started, so the details of
// a failure survive the next run. The workers load this file again, and they inherit the folder
// from the environment of the runner.
process.env.TEST_RUN_FOLDER ??= `test-runs/${
	new Date().toISOString().replaceAll(':', '-').slice(0, 19)
}`
const runFolder = process.env.TEST_RUN_FOLDER
mkdirSync(runFolder, { recursive: true })

// The tests run the built site on its own port, with the database from .env.test, which overrides
// the DATABASE_URL of .env, so a test run never touches the real teams
export default defineConfig({
	testDir: 'tests',
	// Every test shares one database, and searches of parallel tests would merge with each other
	workers: 1,
	outputDir: `${runFolder}/results`,
	reporter: [
		['list'],
		[
			'html',
			{
				outputFolder: `${runFolder}/report`,
				open: 'never',
			},
		],
	],
	use: {
		baseURL: 'http://localhost:3100',
		// Every click, request, answer and console line of a failed test, which
		// npx playwright show-trace opens
		trace: 'retain-on-failure',
	},
	// "fast" runs without a window, and the npm scripts that show the tests use "visible". "firefox"
	// and "webkit" run without a window in the engines of Firefox and Safari, which
	// npx playwright install firefox webkit downloads.
	projects: [
		{
			name: 'fast',
			// Edge is Chromium and comes with Windows, so the tests need no browser download
			use: { channel: 'msedge' },
		},
		{
			name: 'firefox',
			use: { browserName: 'firefox' },
		},
		{
			name: 'webkit',
			use: { browserName: 'webkit' },
		},
		{
			name: 'visible',
			// Slow motion makes the longest tests take minutes
			timeout: 600_000,
			use: {
				channel: 'msedge',
				headless: false,
				launchOptions: {
					// Every step waits this long, so a person can follow the page
					slowMo: 700,
					args: [
						// An English browser with translation off, since Edge in another language offers
						// to translate every page, and a fresh browser forgets the answer
						'--lang=en-US',
						'--disable-features=Translate,TranslateUI',
						// The second monitor, which sits right of the 1920px wide main one, so that the
						// test windows stay out of the way of other work
						'--window-position=1920,0',
						'--window-size=1920,1080',
					],
				},
			},
		},
	],
	// The server writes its log into server.log and its errors into server-errors.log, and the run
	// fails when it logged any error, since a failed check-in can go unnoticed by the test that
	// caused it. Node's warnings stay out of it, since Playwright sets FORCE_COLOR, and Node warns
	// about it in a shell that sets NO_COLOR as well.
	webServer: {
		command: `npm run build && node --no-warnings --env-file=.env --env-file=.env.test server/main.ts > ${
			runFolder
		}/server.log 2> ${runFolder}/server-errors.log`,
		url: 'http://localhost:3100',
		env: { PORT: '3100' },
		timeout: 120_000,
	},
	globalSetup: './tests/emptySearchTables.ts',
	globalTeardown: './tests/failOnServerErrors.ts',
})
