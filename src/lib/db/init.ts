import { db } from './index'

export function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "email" TEXT UNIQUE,
      "emailVerified" INTEGER,
      "image" TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      UNIQUE(provider, providerAccountId)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "sessionToken" TEXT NOT NULL UNIQUE,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "expires" INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS "verificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expires" INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS "game_save" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      "mayorName" TEXT NOT NULL,
      "origin" TEXT NOT NULL,
      "year" INTEGER NOT NULL,
      "career" TEXT NOT NULL DEFAULT '[]',
      "stats" TEXT NOT NULL DEFAULT '{}',
      "currentCity" TEXT,
      "phase" TEXT NOT NULL DEFAULT 'carriere',
      "yearInMandate" INTEGER NOT NULL DEFAULT 0,
      "createdAt" INTEGER NOT NULL,
      "updatedAt" INTEGER NOT NULL
    )
  `)

  console.log('✓ Database initialized')
}

initDatabase()