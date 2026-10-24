import { StdioLog } from './types';
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
