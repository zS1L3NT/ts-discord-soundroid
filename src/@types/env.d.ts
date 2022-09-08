declare module NodeJS {
	interface ProcessEnv {
		readonly DATABASE_URL: string
		readonly DISCORD__TOKEN: string
		readonly DISCORD__BOT_ID: string
		readonly DISCORD__DEV_ID: string
		readonly PORT: string
		readonly SPOTIFY__CLIENT_ID: string
		readonly SPOTIFY__CLIENT_SECRET: string
		readonly SPOTIFY__REFRESH_TOKEN: string
	}
}
