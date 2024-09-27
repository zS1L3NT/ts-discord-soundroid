import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { connection, db } from "./db"

//
;(async () => {
	await migrate(db, { migrationsFolder: "./drizzle" })
	await connection.close()
})()
