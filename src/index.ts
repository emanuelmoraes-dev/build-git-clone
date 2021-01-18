// importing
import fs from 'fs'
import rimraf from 'rimraf'
import { spawn } from 'child_process'
import { resolve, join } from 'path'

// parse to promise
import { promisify } from 'util'
const mkdir = promisify(fs.mkdir)
const rmdir = promisify(rimraf)

function getStdioLogObj (stdioLog: StdioLog) {
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

export enum StdioLog {
	IncludeSilent,
	IncludeShow,
	Show,
	None
}

// clone a project
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
			stdout += await recreate(path, internalLog)
		}

		if (internalLogObj.show)
			console.log('Cloning', url, '...\n')
		if (internalLogObj.include)
			stdout += `Cloning ${url} ...\n\n`

		response = await exec(`cd ${path} && ${git} clone ${url} .`, stdioInherit, stdoutLog, stderrLog)
		stdout += response.stdout
		stderr += response.stderr

		if (internalLogObj.show)
			console.log('\n' + url, 'cloned in', path)
		if (internalLogObj.include)
			stdout += `\n${url} cloned in ${path}.\n`

		if (afterCommand) {
			response = await exec(`cd ${path} && ${afterCommand}`, stdioInherit, stdoutLog, stderrLog)
			stdout += response.stdout
			stderr += response.stderr
		}

		return [null, {
			stdout,
			stderr
		}]
	} catch (error) {
		return [error, {
			stdout,
			stderr
		}]
	}
}

// remove and create folder
async function recreate (path: string, internalLog: StdioLog): Promise<string> {
	const internalLogObj = getStdioLogObj(internalLog)
	await rmdir(path)
	await mkdir(path)
	if (internalLogObj.show)
		console.log(path, 'recreated.')
	if (internalLogObj.include)
		return `${path} recreated.\n`
	else
		return ''
}

// exec command
async function exec (
	command: string,
	stdioInherit: boolean,
	stdoutLog: StdioLog,
	stderrLog: StdioLog
): Promise<{ stdout: string, stderr: string }> {
	const stdoutLogObj = getStdioLogObj(stdoutLog)
	const stderrLogObj = getStdioLogObj(stderrLog)
    let program: string
	let args: Array<string>

	if (process.platform === 'win32') {
        program = 'cmd'
        args = ['/C', command]
    } else {
        program = 'sh'
        args = ['-c', command]
	}
	
	let options: any = {}

	if (stdioInherit)
		options = { stdio: 'inherit' }
	else
		options = {}

	return new Promise((resolve, reject) => {
		const proc = spawn(program, args, options)
		let error: Error | null = null
		let stderr = ''
		let stdout = ''

		// if (!stdioInherit) {
			proc.on('error', err => {
				error = err
			})
			proc.stderr.on('data', err => {
				const str = err.toString()
				if (stderrLogObj.show)
					process.stdout.write(str)
				if (stderrLogObj.include)
					stderr += `${str}`
			})
			proc.stdout.on('data', out => {
				const str = out.toString()
				if (stdoutLogObj.show)
					process.stdout.write(str)
				if (stdoutLogObj.include)
					stdout += `${str}`
			})
		// }

		proc.on('close', code => {
			if (code)
				reject(error || new Error(
					`${stderr}\nCode ${code}` || `error: ${program}: Code ${code}`
				))
			else
				resolve({
					stderr,
					stdout
				})
		})
	})
}
