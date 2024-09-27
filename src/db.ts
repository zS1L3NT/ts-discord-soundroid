import Database from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"

export const connection = new Database("soundroid.db", { create: true })

export const db = drizzle(connection)
