import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { Pool } from '@neondatabase/serverless'

// The tests empty this database's tables, so it must never be the real one from .env
export function connectToTestDatabase() {
	const testDatabaseUrl = parseEnv(readFileSync('.env.test', 'utf8')).DATABASE_URL
	const realDatabaseUrl = parseEnv(readFileSync('.env', 'utf8')).DATABASE_URL
	if (!testDatabaseUrl || testDatabaseUrl === realDatabaseUrl) {
		throw new Error('.env.test needs a DATABASE_URL of its own, see README.md')
	}
	return new Pool({ connectionString: testDatabaseUrl })
}
