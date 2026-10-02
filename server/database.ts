import { Pool } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set, see README.md')

// Postgres database on Neon, where each module that uses it creates its own table
export const database = new Pool({ connectionString: process.env.DATABASE_URL })
// Neon drops idle connections, for example when its compute suspends, and the pool reports that
// as an error event, which crashes the whole server when nothing listens for it. The pool opens a
// new connection for the next query by itself.
database.on('error', (error: Error) => console.error('Database connection lost:', error.message))
