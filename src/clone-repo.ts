import fs from 'fs'
import { join, resolve } from 'path'
import { StdioLog, StdioLogObj } from './types'
import { ChildProcessOutput, recreate, resolveChildProcess } from './utils'

import { promisify } from 'util'
import { execFile, spawn } from 'child_process'
const mkdir = promisify(fs.mkdir)
const lstat = promisify(fs.lstat)

type StdioInherit = 'none' | 'stdin' | 'all'

function buildStdioLogObj (stdioLog: StdioLog, inheritAll: boolean): StdioLogObj {
    return {
        include: (
            stdioLog === StdioLog.IncludeSilent ||
            stdioLog === StdioLog.IncludeShow
        ),
        show: !inheritAll && (
            stdioLog === StdioLog.IncludeShow ||
            stdioLog === StdioLog.Show
        ),
        none: stdioLog === StdioLog.None
    }
}

export async function cloneRepo (
    folder: string,
    url: string,
    {
        git = 'git',
        stdioInherit = 'none' as StdioInherit,
        recreateFolderIfExists = false,
        stdoutLog = StdioLog.IncludeSilent,
        stderrLog = StdioLog.IncludeSilent,
        internalLog = StdioLog.IncludeSilent
    } = {}
): Promise<[(unknown | null), { stdout: string, stderr: string }]> {
    const stdoutLogObj = buildStdioLogObj(stdoutLog, stdioInherit === 'all')
    const stderrLogObj = buildStdioLogObj(stderrLog, stdioInherit === 'all')
    const internalLogObj = buildStdioLogObj(internalLog, stdioInherit === 'all')

    const output: ChildProcessOutput = { stdout: '', stderr: '' }

    try {
        const pathResponse = await resolvePath(folder, internalLogObj, recreateFolderIfExists)
        const path = pathResponse.path
        output.stdout += pathResponse.stdout

        await resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj, output)

        return [null, output]
    } catch (error) {
        return [error, output]
    }
}

async function resolvePath (folder: string, internalLogObj: StdioLogObj, recreateFolderIfExists: boolean) {
    let stdout = ''
    const path = join(resolve(), folder)

    if (!recreateFolderIfExists)
        return { path, stdout }

    try {
        const stats = await lstat(path)
        if (!stats.isDirectory())
            throw new Error(`Destination exists and is not a directory: ${path}`)

        stdout += await recreate(path, internalLogObj)
    } catch (error) {
        if (typeof error === 'object' && (error as NodeJS.ErrnoException)?.code !== 'ENOENT')
            throw error

        if (internalLogObj.show)
            console.log('Creating', path, '...')
        if (internalLogObj.include)
            stdout += `Creating ${path} ...\n`

        await mkdir(path)

        if (internalLogObj.show)
            console.log(path, 'created.')
        if (internalLogObj.include)
            stdout += `${path} created.\n`
    }

    return { path, stdout }
}

async function resolveGitClone (
    git: string,
    url: string,
    path: string,
    stdioInherit: StdioInherit,
    internalLogObj: StdioLogObj,
	stdoutLogObj: StdioLogObj,
    stderrLogObj: StdioLogObj,
    output: ChildProcessOutput
) {
    if (internalLogObj.show)
        console.log('Cloning', url, '...\n')
    if (internalLogObj.include)
        output.stdout += `Cloning ${url} ...\n\n`

    await execGitClone(git, url, path, stdioInherit, stdoutLogObj, stderrLogObj, output)

    if (internalLogObj.show)
        console.log('\n' + url, 'cloned in', path)
    if (internalLogObj.include)
        output.stdout += `\n${url} cloned in ${path}.\n`
}

function execGitClone (
    git: string,
	url: string,
	dest: string,
    stdioInherit: StdioInherit,
	stdoutLogObj: StdioLogObj,
    stderrLogObj: StdioLogObj,
    output: ChildProcessOutput
) {
    const args = ['clone', '--', url, dest]
    let proc = stdioInherit === 'all'
        ? spawn(git, args, { shell: false, stdio: 'inherit' })
        : stdioInherit === 'stdin'
            ? spawn(git, args, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] })
            : execFile(git, args, { shell: false })
    return resolveChildProcess(proc, stdoutLogObj, stderrLogObj, output, process.stdout, process.stderr)
}
