/// <reference types="node" />
/// <reference types="node" />
import { StdioLogObj } from './types';
import { ChildProcess } from 'child_process';
export interface ChildProcessOutput {
    stdout: string;
    stderr: string;
}
export declare function recreate(path: string, internalLogObj: StdioLogObj): Promise<string>;
export declare function resolveChildProcess(proc: ChildProcess, stdoutLogObj: StdioLogObj, stderrLogObj: StdioLogObj, output: ChildProcessOutput, stdoutTarget?: NodeJS.WritableStream, stderrTarget?: NodeJS.WritableStream): Promise<void>;
