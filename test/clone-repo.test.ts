import { ChildProcess, spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { cloneRepo, StdioLog } from '../src'

jest.mock('node:child_process', () => ({
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
	inherited = false,
	processError?: Error
): ChildProcess {
	const child = new EventEmitter() as unknown as MockChildProcess
	child.stdout = inherited ? null : new PassThrough()
	child.stderr = inherited ? null : new PassThrough()

	child.on('newListener', event => {
		if (event === 'close') {
			setImmediate(() => {
				child.stdout?.emit('data', Buffer.from(stdout))
				child.stderr?.emit('data', Buffer.from(stderr))
				if (processError)
					child.emit('error', processError)
				child.emit('close', processError ? null : code, null)
			})
		}
	})

	return child as unknown as ChildProcess
}

describe('cloneRepo', () => {
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

	it('uses captured stdio and silent logging by default', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))
		const consoleLog = jest.spyOn(console, 'log')

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git')

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
			{ shell: false }
		)
		expect(result.stdout).toContain('git stdout')
		expect(result.stdout).toContain('Cloning https://example.com/repo.git')
		expect(result.stderr).toBe('git stderr')
		expect(consoleLog).not.toHaveBeenCalled()
        expect(stdoutWrite).not.toHaveBeenCalled()
		expect(stderrWrite).not.toHaveBeenCalled()
	})

	it('inherits stdin while capturing stdout and stderr', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			stdioInherit: 'stdin',
			stdoutLog: StdioLog.IncludeSilent,
			stderrLog: StdioLog.IncludeSilent,
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
			{ shell: false, stdio: ['inherit', 'pipe', 'pipe'] }
		)
		expect(result.stdout).toBe('git stdout')
		expect(result.stderr).toBe('git stderr')
	})

    it('does not inherit any stdio, captures and shows stdio when requested', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
        const consoleLog = jest.spyOn(console, 'log')

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, false))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			stdioInherit: 'none',
            stdoutLog: StdioLog.IncludeShow,
            stderrLog: StdioLog.IncludeShow,
            internalLog: StdioLog.IncludeShow
		})

        expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
            'git',
            ['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
            { shell: false }
        )
		expect(result.stdout).toContain('git stdout')
		expect(result.stderr).toBe('git stderr')
        expect(stdoutWrite).toHaveBeenCalledWith('git stdout')
        expect(stderrWrite).toHaveBeenCalledWith('git stderr')
		expect(consoleLog).toHaveBeenCalledWith('Cloning', 'https://example.com/repo.git', '...\n')
    })

	it('inherits all stdio when requested and does not capture Git output', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, true))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			stdioInherit: 'all'
		})

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
			{ shell: false, stdio: 'inherit' }
		)
		expect(result.stdout).not.toContain('git stdout')
		expect(result.stderr).toBe('')
	})

	it('does not remove a non-empty destination by default and returns output on Git failure', async () => {
		const destination = join(testRoot, 'project')
		const existingFile = join(destination, 'keep.txt')
		mkdirSync(destination)
		writeFileSync(existingFile, 'keep')
		spawnMock.mockReturnValueOnce(createChildProcess('partial stdout', 'destination is not empty', 1))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect(existsSync(existingFile)).toBe(true)
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', destination],
			{ shell: false }
		)
		expect(result.stdout).toBe('partial stdout')
		expect(result.stderr).toBe('destination is not empty')
	})

	it('recreates an existing destination only when explicitly requested', async () => {
		const parent = join(testRoot, 'clones')
		const destination = join(parent, 'project')
		const existingFile = join(destination, 'remove-me.txt')
		mkdirSync(parent)
		mkdirSync(destination)
		writeFileSync(existingFile, 'remove')
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', ''))

		const [error] = await cloneRepo('clones/project', 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent },
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(existsSync(destination)).toBe(true)
		expect(existsSync(existingFile)).toBe(false)
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', destination],
			{ shell: false }
		)
	})

	it('rejects a destination outside the configured parent without deleting anything', async () => {
		const parent = join(testRoot, 'clones')
		const outside = join(testRoot, 'keep')
		const existingFile = join(outside, 'keep.txt')
		mkdirSync(parent)
		mkdirSync(outside)
		writeFileSync(existingFile, 'keep')

		const [error] = await cloneRepo('clones/../keep', 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent: 'clones' },
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toContain('immediate child')
		expect(existsSync(existingFile)).toBe(true)
		expect(spawnMock).not.toHaveBeenCalled()
	})

	it('uses lexical validation and does not create a missing parent directory', async () => {
		const parent = join(testRoot, 'new', 'clones')
		const destination = join(parent, 'project')
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', ''))

		const [error] = await cloneRepo(join('new', 'clones', 'project'), 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent: join('new', 'clones') },
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(existsSync(parent)).toBe(false)
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', destination],
			{ shell: false }
		)
	})

	it('accepts case-insensitive parent paths on Windows', async () => {
		if (process.platform !== 'win32')
			return

		const parent = join('missing', 'clones')
		const destination = join('MISSING', 'CLONES', 'project')
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', ''))

		const [error] = await cloneRepo(destination, 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent },
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(testRoot, destination)],
			{ shell: false }
		)
	})

	it('rejects lexical traversal when the configured parent does not exist', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', ''))

		const [error] = await cloneRepo(join('new', '..', 'outside'), 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent: join('new', 'clones') },
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toContain('immediate child')
		expect(spawnMock).not.toHaveBeenCalled()
	})

	it('accepts an absolute parent path and rejects the parent itself as destination', async () => {
		const parent = join(testRoot, 'clones')
		mkdirSync(parent)

		const [error] = await cloneRepo('clones', 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent },
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toContain('immediate child')
		expect(existsSync(parent)).toBe(true)
		expect(spawnMock).not.toHaveBeenCalled()

		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', ''))
		const [success] = await cloneRepo('clones/project', 'https://example.com/repo.git', {
			recreateFolderIfExists: { enabled: true, parent },
			internalLog: StdioLog.None
		})

		expect(success).toBeNull()
		expect(spawnMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(parent, 'project')],
			{ shell: false }
		)
	})

	it('writes displayed stdout and stderr to their corresponding process streams', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))
		const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			stdoutLog: StdioLog.IncludeShow,
			stderrLog: StdioLog.IncludeShow,
			internalLog: StdioLog.None
		})

		expect(error).toBeNull()
		expect(result.stdout).toBe('git stdout')
		expect(result.stderr).toBe('git stderr')
		expect(stdoutWrite).toHaveBeenCalledWith('git stdout')
		expect(stderrWrite).toHaveBeenCalledWith('git stderr')
	})

	it('returns process failures with captured stdout and stderr', async () => {
		spawnMock.mockReturnValueOnce(createChildProcess('partial stdout', 'git failed', 1))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toBe('git failed\nCode 1')
		expect(result.stdout).toContain('partial stdout')
		expect(result.stderr).toBe('git failed')
	})

	it('returns captured output when the process emits an error before closing', async () => {
		const processError = new Error('failed to start git')
		spawnMock.mockReturnValueOnce(createChildProcess('partial stdout', 'partial stderr', 0, false, processError))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			internalLog: StdioLog.None
		})

		expect(error).toBe(processError)
		expect(result.stdout).toBe('partial stdout')
		expect(result.stderr).toBe('partial stderr')
	})
})
