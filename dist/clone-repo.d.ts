import { StdioLog } from './types';
type StdioInherit = 'none' | 'stdin' | 'all';
export declare function cloneRepo(folder: string, url: string, { git, stdioInherit, stdoutLog, stderrLog, internalLog }?: {
    git?: string | undefined;
    stdioInherit?: StdioInherit | undefined;
    stdoutLog?: StdioLog | undefined;
    stderrLog?: StdioLog | undefined;
    internalLog?: StdioLog | undefined;
}): Promise<[(unknown | null), {
    stdout: string;
    stderr: string;
}]>;
export {};
