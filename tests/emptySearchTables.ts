import { connectToTestDatabase } from './testDatabase.ts'

// Runs before the first test. A stopped run leaves its pages' searches in the test database for
// 90 seconds, where they would merge with the searches of the next run.
export default async function emptySearchTables() {
	const testDatabase = connectToTestDatabase()
	// A new test database has no tables until the server's first check-in creates them
	await testDatabase.query(`
		DO $$ BEGIN
			IF to_regclass('open_pages') IS NOT NULL THEN DELETE FROM open_pages; END IF;
			IF to_regclass('teams') IS NOT NULL THEN DELETE FROM teams; END IF;
			IF to_regclass('verified_friends') IS NOT NULL THEN DELETE FROM verified_friends; END IF;
		END $$
	`)
	await testDatabase.end()
}
