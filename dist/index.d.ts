export declare enum StdioLog {
    IncludeSilent = 0,
    IncludeShow = 1,
    Show = 2,
    None = 3
}
export declare function clone(folder: string, url: string, afterCommand?: string | null, { git, stdioInherit, stdoutLog, stderrLog, internalLog }?: {
    git?: string;
    stdioInherit?: boolean;
    stdoutLog?: StdioLog;
    stderrLog?: StdioLog;
    internalLog?: StdioLog;
}): Promise<[(Error | null), {
    stdout: string;
    stderr: string;
}]>;
