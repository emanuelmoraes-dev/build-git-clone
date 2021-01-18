// importing
import fs from 'fs'
import rimraf from 'rimraf'
import { spawn } from 'child_process'
import { resolve, join } from 'path'

// parse to promise
import { promisify } from 'util'
const mkdir = promisify(fs.mkdir)
const rmdir = promisify(rimraf)

// clone a project
export async function clone (folder: string, url: string, afterCommand: string|null = null, { git = 'git' } = {}): Promise<void> {
	try {
		const path = join(resolve(), folder)
		console.log('Creating', path, '...')
		try {
			await mkdir(path)
			console.log(path, 'created.')
		} catch (_) {
			await recreate(path)
		}
		console.log('Cloning', url, '...\n')
		await exec(`cd ${path} && ${git} clone ${url} .`)
		console.log('\n' + url, 'cloned.')
		if (afterCommand)
			await exec(`cd ${path} && ${afterCommand}`)
	} catch (error) {
		console.error(error)
	}
}

// remove and create folder
async function recreate (path: string): Promise<void> {
	await rmdir(path)
	await mkdir(path)
	console.log(path, 'recreated.')
}

// exec command
async function exec (command: string): Promise<void> {
    let program: string
    let args: Array<string>

	if (process.platform === 'win32') {
        program = 'cmd'
        args = ['/C', command]
    } else {
        program = 'sh'
        args = ['-c', command]
    }

	return new Promise((resolve, reject) => {
		const proc = spawn(program, args, { stdio: 'inherit' })
		proc.on('close', code => code ? reject(new Error(`Status Code: ${code}`)) : resolve())
	})
}
