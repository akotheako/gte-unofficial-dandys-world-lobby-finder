import { readFileSync } from 'node:fs'

// Runs after the last test. The server only prints its start line, so anything else is an error.
export default function failOnServerErrors() {
	const serverLogPath = `${process.env.TEST_RUN_FOLDER}/server.log`
	const serverErrors = readFileSync(serverLogPath, 'utf8')
		.split('\n')
		.filter((line) => line.trim() && !line.startsWith('Server listening on'))
	if (serverErrors.length) {
		throw new Error(`The server logged errors during the run, see ${serverLogPath}:
${serverErrors.slice(0, 20).join('\n')}`)
	}
}
