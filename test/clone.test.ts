import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { PassThrough } from 'stream'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { clone, StdioLog } from '../src'

jest.mock('child_process', () => ({
	spawn: jest.fn()
}))

interface MockChildProcess extends EventEmitter {
	stdout: PassThrough | null
	stderr: PassThrough | null
}

const spawnMock = spawn as jest.Mock

function createChildProcess (
	stdout: string,
	stderr: string,
	code = 0,
	inherited = false
): ChildProcess {
	const child = new EventEmitter() as unknown as MockChildProcess
	child.stdout = inherited ? null : new PassThrough()
	child.stderr = inherited ? null : new PassThrough()

	child.on('newListener', event => {
		if (event === 'close') {
			setImmediate(() => {
				child.stdout?.emit('data', Buffer.from(stdout))
				child.stderr?.emit('data', Buffer.from(stderr))
				child.emit('close', code, null)
			})
		}
	})

	return child as unknown as ChildProcess
}

describe('legacy clone', () => {
	let originalCwd: string
	let testRoot: string

	beforeEach(() => {
		originalCwd = process.cwd()
		testRoot = mkdtempSync(join(tmpdir(), 'build-git-clone-'))
		process.chdir(testRoot)
		spawnMock.mockReset()
		jest.spyOn(console, 'log').mockImplementation(() => undefined)
	})

	afterEach(() => {
		jest.restoreAllMocks()
		process.chdir(originalCwd)
		rmSync(testRoot, { recursive: true, force: true })
	})

	it('preserves inherited stdio as the default and returns internal logs', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, true))

		const [error, result] = await clone('project', 'https://example.com/repo.git')

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', '.'],
			{ shell: false, cwd: join(testRoot, 'project'), stdio: 'inherit' }
		)
		expect(result.stdout).toContain('Cloning https://example.com/repo.git')
		expect(result.stdout).toContain('cloned in')
		expect(result.stdout).not.toContain('git stdout')
		expect(result.stderr).toBe('')
        expect(stdoutWrite).not.toHaveBeenCalled()
        expect(stderrWrite).not.toHaveBeenCalled()
	})

	it('captures stdout and stderr when inheritance is disabled', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, false))

		const [error, result] = await clone('project', 'https://example.com/repo.git', null, {
			stdioInherit: false,
			stdoutLog: StdioLog.IncludeSilent,
			stderrLog: StdioLog.IncludeSilent,
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', '.'],
			{ shell: false, cwd: join(testRoot, 'project') }
		)
		expect(result.stdout).toBe('git stdout')
		expect(result.stderr).toBe('git stderr')
	})

	it('includes and displays stdout and stderr with IncludeShow', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
        const consoleLog = jest.spyOn(console, 'log')

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, false))

		const [error, result] = await clone('project', 'https://example.com/repo.git', null, {
			stdioInherit: false,
			stdoutLog: StdioLog.IncludeShow,
			stderrLog: StdioLog.IncludeShow,
			internalLog: StdioLog.IncludeShow
		})

		expect(error).toBeNull()
		expect(result.stdout).toContain('git stdout')
		expect(result.stdout).toContain('Cloning https://example.com/repo.git')
		expect(result.stderr).toBe('git stderr')
		expect(stdoutWrite).toHaveBeenCalledWith('git stdout')
		expect(stdoutWrite).toHaveBeenCalledWith('git stderr')
		expect(stderrWrite).not.toHaveBeenCalled()
        expect(consoleLog).toHaveBeenCalledWith('Cloning', 'https://example.com/repo.git', '...\n')
	})

	it('continues writing displayed stdout and stderr to stdout', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))

		const [error, result] = await clone('project', 'https://example.com/repo.git', null, {
			stdioInherit: false,
			stdoutLog: StdioLog.Show,
			stderrLog: StdioLog.Show,
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(result.stdout).toBe('')
		expect(result.stderr).toBe('')
		expect(stdoutWrite).toHaveBeenCalledWith('git stdout')
		expect(stdoutWrite).toHaveBeenCalledWith('git stderr')
		expect(stderrWrite).not.toHaveBeenCalled()
	})

	it('runs afterCommand in the cloned folder after cloning', async () => {
		spawnMock
			.mockReturnValueOnce(createChildProcess('clone output', ''))
			.mockReturnValueOnce(createChildProcess('command output', ''))

		const [error, result] = await clone('project', 'https://example.com/repo.git', 'npm install', {
			stdioInherit: false,
			stdoutLog: StdioLog.IncludeSilent,
			stderrLog: StdioLog.IncludeSilent,
			internalLog: StdioLog.None
		})

		const shell = process.platform === 'win32' ? 'cmd' : 'sh'
		const shellArgs = process.platform === 'win32' ? ['/C', 'npm install'] : ['-c', 'npm install']

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenNthCalledWith(
			2,
			shell,
			shellArgs,
			{ cwd: join(testRoot, 'project') }
		)
		expect(result.stdout).toBe('clone outputcommand output')
	})

	it('returns a process failure in the error tuple element', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('', 'clone failed', 1))

		const [error] = await clone('project', 'https://example.com/repo.git', null, {
			stdioInherit: false,
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect(error?.message).toBe('clone failed\nCode 1')
	})

	it('preserves non-Error values thrown by dependencies', async () => {
		const thrownValue = { reason: 'custom failure' }
		spawnMock.mockImplementationOnce(() => {
			throw thrownValue
		})

		const [error] = await clone('project', 'https://example.com/repo.git', null, {
			stdioInherit: false,
			internalLog: StdioLog.None
		})

		expect(error).toBe(thrownValue)
	})
})