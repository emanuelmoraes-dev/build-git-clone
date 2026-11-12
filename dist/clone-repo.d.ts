import { StdioLog } from './types';
type StdioInherit = 'none' | 'stdin' | 'all';
export type RecreateFolderOptions = {
    enabled: false;
} | {
    enabled: true;
    parent: string;
};
export interface CloneRepoOptions {
    git?: string;
    stdioInherit?: StdioInherit;
    recreateFolderIfExists?: RecreateFolderOptions;
    stdoutLog?: StdioLog;
    stderrLog?: StdioLog;
    internalLog?: StdioLog;
}
export declare function cloneRepo(folder: string, url: string, { git, stdioInherit, recreateFolderIfExists, stdoutLog, stderrLog, internalLog }?: CloneRepoOptions): Promise<[(unknown | null), {
    stdout: string;
    stderr: string;
}]>;
export {};
