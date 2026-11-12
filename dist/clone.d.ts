import { StdioLog } from './types';
/**
 * @deprecated will be removed in v2. use `cloneRepo` instead.
 */
export declare function clone(folder: string, url: string, afterCommand?: string | null, { git, stdioInherit, stdoutLog, stderrLog, internalLog }?: {
    git?: string | undefined;
    stdioInherit?: boolean | undefined;
    stdoutLog?: StdioLog | undefined;
    stderrLog?: StdioLog | undefined;
    internalLog?: StdioLog | undefined;
}): Promise<[(Error | null), {
    stdout: string;
    stderr: string;
}]>;
