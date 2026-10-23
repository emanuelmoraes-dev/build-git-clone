import fs from 'fs'
import { join, resolve } from 'path'
import { StdioLog, StdioLogObj } from './types'
import { recreate, resolveChildProcess } from './utils'

import { promisify } from 'util'
import { execFile, spawn } from 'child_process'
const mkdir = promisify(fs.mkdir)

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
        stdoutLog = StdioLog.IncludeSilent,
        stderrLog = StdioLog.IncludeSilent,
        internalLog = StdioLog.IncludeSilent
    } = {}
): Promise<[(unknown | null), { stdout: string, stderr: string }]> {
    const stdoutLogObj = buildStdioLogObj(stdoutLog, stdioInherit === 'all')
    const stderrLogObj = buildStdioLogObj(stderrLog, stdioInherit === 'all')
    const internalLogObj = buildStdioLogObj(internalLog, stdioInherit === 'all')

    let stdout = ''
    let stderr = ''

    try {
        const pathResponse = await resolvePath(folder, internalLogObj)
        const path = pathResponse.path
        stdout += pathResponse.stdout

        const cloneResponse = await resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj)
        stdout += cloneResponse.stdout
        stderr += cloneResponse.stderr

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

async function resolvePath (folder: string, internalLogObj: StdioLogObj) {
    let stdout = ''
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

    return { path, stdout }
}

async function resolveGitClone (
    git: string,
    url: string,
    path: string,
    stdioInherit: StdioInherit,
    internalLogObj: StdioLogObj,
	stdoutLogObj: StdioLogObj,
	stderrLogObj: StdioLogObj
) {
    let stdout = ''
    let stderr = ''

    if (internalLogObj.show)
        console.log('Cloning', url, '...\n')
    if (internalLogObj.include)
        stdout += `Cloning ${url} ...\n\n`

    const response = await execGitClone(git, url, path, stdioInherit, stdoutLogObj, stderrLogObj)
    stdout += response.stdout
    stderr += response.stderr

    if (internalLogObj.show)
        console.log('\n' + url, 'cloned in', path)
    if (internalLogObj.include)
        stdout += `\n${url} cloned in ${path}.\n`

    return { stdout, stderr }
}

function execGitClone (
    git: string,
	url: string,
	dest: string,
    stdioInherit: StdioInherit,
	stdoutLogObj: StdioLogObj,
	stderrLogObj: StdioLogObj
) {
    const args = ['clone', '--', url, dest]
    let proc = stdioInherit === 'all'
        ? spawn(git, args, { shell: false, stdio: 'inherit' })
        : stdioInherit === 'stdin'
            ? spawn(git, args, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] })
            : execFile(git, args, { shell: false })
    return resolveChildProcess(proc, stdoutLogObj, stderrLogObj, process.stdout, process.stderr)
}

