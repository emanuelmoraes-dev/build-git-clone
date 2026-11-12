import { ChildProcess } from 'node:child_process';
import { StdioLogObj } from './types';
export interface ChildProcessOutput {
    stdout: string;
    stderr: string;
}
export declare function recreate(path: string, internalLogObj: StdioLogObj): Promise<string>;
export declare function resolveChildProcess(proc: ChildProcess, stdoutLogObj: StdioLogObj, stderrLogObj: StdioLogObj, output: ChildProcessOutput, stdoutTarget?: NodeJS.WritableStream, stderrTarget?: NodeJS.WritableStream): Promise<void>;
