import { Pool } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set, see README.md')

// Postgres database on Neon, where each module that uses it creates its own table
export const database = new Pool({ connectionString: process.env.DATABASE_URL })
