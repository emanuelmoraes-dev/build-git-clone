import fs from 'fs'
import rimraf from 'rimraf'
import { StdioLogObj } from './types'

import { promisify } from 'util'
import { ChildProcess } from 'child_process'
const mkdir = promisify(fs.mkdir)
const rmdir = promisify(rimraf)

export interface ChildProcessOutput {
	stdout: string
	stderr: string
}

export async function recreate (path: string, internalLogObj: StdioLogObj): Promise<string> {
	await rmdir(path)
	await mkdir(path)
	if (internalLogObj.show)
		console.log(path, 'recreated.')
	if (internalLogObj.include)
		return `${path} recreated.\n`
	else
		return ''
}

export function resolveChildProcess (
	proc: ChildProcess,
	stdoutLogObj: StdioLogObj,
	stderrLogObj: StdioLogObj,
	output: ChildProcessOutput,
	stdoutTarget: NodeJS.WritableStream = process.stdout,
	stderrTarget: NodeJS.WritableStream = process.stdout
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let error: Error | null = null

		proc.on('error', err => {
			error = err
		})
		proc.stderr?.on('data', err => {
			const str = err.toString()
			if (stderrLogObj.show)
				stderrTarget.write(str)
			if (stderrLogObj.include)
				output.stderr += str
		})
		proc.stdout?.on('data', out => {
			const str = out.toString()
			if (stdoutLogObj.show)
				stdoutTarget.write(str)
			if (stdoutLogObj.include)
				output.stdout += str
		})

		proc.on('close', code => {
			if (error || code !== 0) {
				reject(error || new Error(
					`${output.stderr}\nCode ${code}`
				))
			} else {
				resolve()
			}
		})
	})
}
