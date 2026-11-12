export interface StdioLogObj {
    include: boolean
    show: boolean
    none: boolean
}

export enum StdioLog {
	IncludeSilent,
	IncludeShow,
	Show,
	None
}
