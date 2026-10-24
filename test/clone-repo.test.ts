import { ChildProcess, execFile, spawn } from 'child_process'
import { EventEmitter } from 'events'
import { mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { PassThrough } from 'stream'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { cloneRepo, StdioLog } from '../src'

jest.mock('child_process', () => ({
	execFile: jest.fn(),
	spawn: jest.fn()
}))

interface MockChildProcess extends EventEmitter {
	stdout: PassThrough | null
	stderr: PassThrough | null
}

const execFileMock = execFile as unknown as jest.Mock
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

describe('cloneRepo', () => {
	let originalCwd: string
	let testRoot: string

	beforeEach(() => {
		originalCwd = process.cwd()
		testRoot = mkdtempSync(join(tmpdir(), 'build-git-clone-'))
		process.chdir(testRoot)
		execFileMock.mockReset()
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

		execFileMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))
		const consoleLog = jest.spyOn(console, 'log')

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git')

		expect(error).toBeNull()
		expect(execFileMock).toHaveBeenCalledWith(
			'git',
			['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
			{ shell: false }
		)
		expect(spawnMock).not.toHaveBeenCalled()
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
        expect(execFileMock).not.toHaveBeenCalled()
		expect(result.stdout).toBe('git stdout')
		expect(result.stderr).toBe('git stderr')
	})

    it('does not inherit any stdio, captures and shows stdio when requested', async () => {
        const stdoutWrite = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)
		const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(() => true)
        const consoleLog = jest.spyOn(console, 'log')

		execFileMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr', 0, false))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			stdioInherit: 'none',
            stdoutLog: StdioLog.IncludeShow,
            stderrLog: StdioLog.IncludeShow,
            internalLog: StdioLog.IncludeShow
		})

        expect(error).toBeNull()
        expect(execFileMock).toHaveBeenCalledWith(
            'git',
            ['clone', '--', 'https://example.com/repo.git', join(testRoot, 'project')],
            { shell: false }
        )
        expect(spawnMock).not.toHaveBeenCalled()
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
		expect(execFileMock).not.toHaveBeenCalled()
		expect(result.stdout).not.toContain('git stdout')
		expect(result.stderr).toBe('')
	})

	it('writes displayed stdout and stderr to their corresponding process streams', async () => {
		execFileMock.mockReturnValueOnce(createChildProcess('git stdout', 'git stderr'))
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

	it('returns process failures as unknown values with captured error details', async () => {
		execFileMock.mockReturnValueOnce(createChildProcess('', 'git failed', 1))

		const [error, result] = await cloneRepo('project', 'https://example.com/repo.git', {
			internalLog: StdioLog.None
		})

		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toBe('git failed\nCode 1')
		expect(result.stderr).toBe('')
	})
})
