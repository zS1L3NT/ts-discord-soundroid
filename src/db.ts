import Database from "bun:sqlite"
import { aliases } from "@framework"
import { drizzle } from "drizzle-orm/bun-sqlite"
import { servers } from "./schema"

export const connection = new Database("soundroid.db", { create: true })

export const db = drizzle(connection, { schema: { servers, aliases } })
