import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

const client = createClient({
  url: `file:${dbPath}`,
})

export const db = drizzle(client, { schema })
export { schema }