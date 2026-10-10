import { readFileSync } from 'node:fs'

// Runs after the last test, and fails the run when the server wrote anything to its error output
export default function failOnServerErrors() {
	const serverErrorsPath = `${process.env.TEST_RUN_FOLDER}/server-errors.log`
	const serverErrors = readFileSync(serverErrorsPath, 'utf8')
		.split('\n')
		.filter((line) => line.trim())
	if (serverErrors.length) {
		throw new Error(`The server logged errors during the run, see ${serverErrorsPath}:
${serverErrors.slice(0, 20).join('\n')}`)
	}
}
