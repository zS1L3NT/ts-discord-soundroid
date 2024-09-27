import colors from "colors"
import Tracer from "tracer"

/**
 * log: Used for basic primitive information
 * debug: Only used for debugging if not don't use this
 * info: Used for general information
 * alert: Used for possible minor problems or user erros
 * warn: Used for caught errors which need attention
 * error: Used for errors that are not fixed
 */
export default Tracer.colorConsole({
	level: process.env.LOG_LEVEL || "log",
	format: [
		"[{{timestamp}}] {{message}}",
		{
			alert: "[{{timestamp}}] {{message}}",
			warn: "[{{timestamp}}] {{message}}",
			error: "[{{timestamp}}] {{message}}",
		},
	],
	methods: ["log", "discord", "debug", "info", "alert", "warn", "error"],
	dateformat: "dd mmm yyyy, hh:MM:sstt",
	filters: {
		log: colors.grey,
		discord: colors.cyan,
		debug: colors.blue,
		info: colors.green,
		alert: colors.yellow,
		warn: colors.yellow.bold.italic,
		error: colors.red.bold.italic,
	},
})
