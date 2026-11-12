import { mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { StdioLog, StdioLogObj } from './types'
import { ChildProcessOutput, resolveChildProcess, recreate } from './utils'

/**
 * @deprecated will be removed in v2.
 */
function getStdioLogObj (stdioLog: StdioLog): StdioLogObj {
    return {
        include: (
            stdioLog === StdioLog.IncludeSilent ||
            stdioLog === StdioLog.IncludeShow
        ),
        show: (
            stdioLog === StdioLog.IncludeShow ||
            stdioLog === StdioLog.Show
        ),
        none: stdioLog === StdioLog.None
    }
}

/**
 * @deprecated will be removed in v2. use `cloneRepo` instead.
 */
export async function clone (
	folder: string,
	url: string,
	afterCommand: string|null = null,
	{
		git = 'git',
		stdioInherit = true,
		stdoutLog = StdioLog.IncludeShow,
		stderrLog = StdioLog.IncludeShow,
		internalLog = StdioLog.IncludeShow
	} = {}
): Promise<[(Error | null), { stdout: string, stderr: string }]> {
	const internalLogObj = getStdioLogObj(internalLog)

	let stdout = ''
	let stderr = ''

	let response: { stdout: string, stderr: string }

	try {
		const path = join(resolve(), folder)

		if (internalLogObj.show)
			console.log('Creating', path, '...')
		if (internalLogObj.include)
			stdout += `Creating ${path} ...\n`

		try {
			await mkdir(path)

			if (internalLogObj.show)
				console.log(path, 'created.')
			if (internalLogObj.include)
				stdout += `${path} created.\n`
		} catch (_) {
			stdout += await recreate(path, internalLogObj)
		}

		if (internalLogObj.show)
			console.log('Cloning', url, '...\n')
		if (internalLogObj.include)
			stdout += `Cloning ${url} ...\n\n`

		response = await cloneCommand(git, url, path, stdioInherit, stdoutLog, stderrLog)
		stdout += response.stdout
		stderr += response.stderr

		if (internalLogObj.show)
			console.log('\n' + url, 'cloned in', path)
		if (internalLogObj.include)
			stdout += `\n${url} cloned in ${path}.\n`

		if (afterCommand) {
			response = await execAnyCommand(afterCommand, path, stdioInherit, stdoutLog, stderrLog)
			stdout += response.stdout
			stderr += response.stderr
		}

		return [null, {
			stdout,
			stderr
		}]
	} catch (error) {
		return [error as Error, {
			stdout,
			stderr
		}]
	}
}

/**
 * @deprecated will be removed in v2.
 */
async function cloneCommand (
	git: string,
	url: string,
	dest: string,
	stdioInherit: boolean,
	stdoutLog: StdioLog,
	stderrLog: StdioLog
): Promise<{ stdout: string, stderr: string }> {
	const stdoutLogObj = getStdioLogObj(stdoutLog)
	const stderrLogObj = getStdioLogObj(stderrLog)
	const output: ChildProcessOutput = { stdout: '', stderr: '' }
	
	const options = stdioInherit
		? { shell: false, cwd: dest, stdio: 'inherit' as const }
		: { shell: false, cwd: dest }

	const proc = spawn(git, ['clone', '--', url, '.'], options)

	await resolveChildProcess(proc, stdoutLogObj, stderrLogObj, output)
	return output
}

/**
 * @deprecated will be removed in v2.
 */
async function execAnyCommand (
	command: string,
	cwd: string,
	stdioInherit: boolean,
	stdoutLog: StdioLog,
	stderrLog: StdioLog
): Promise<{ stdout: string, stderr: string }> {
	const stdoutLogObj = getStdioLogObj(stdoutLog)
	const stderrLogObj = getStdioLogObj(stderrLog)
	const output: ChildProcessOutput = { stdout: '', stderr: '' }

	let program: string
	let args: Array<string>

	if (process.platform === 'win32') {
        program = 'cmd'
        args = ['/C', command]
    } else {
        program = 'sh'
        args = ['-c', command]
	}

	let options = {}

	if (stdioInherit) {
		options = { cwd, stdio: 'inherit' }
	} else {
		options = { cwd }
	}

	const proc = spawn(program, args, options)

	await resolveChildProcess(proc, stdoutLogObj, stderrLogObj, output)
	return output
}
