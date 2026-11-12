/// <reference types="node" />
/// <reference types="node" />
import { StdioLogObj } from './types';
import { ChildProcess } from 'child_process';
export declare function recreate(path: string, internalLogObj: StdioLogObj): Promise<string>;
export declare function resolveChildProcess(proc: ChildProcess, stdoutLogObj: StdioLogObj, stderrLogObj: StdioLogObj, stdoutTarget?: NodeJS.WritableStream, stderrTarget?: NodeJS.WritableStream): Promise<{
    stdout: string;
    stderr: string;
}>;
