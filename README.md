# build-git-clone (ts/js)
Clone Git repositories into a destination folder, with an optional post-clone command.

## Install
```sh
npm install --save build-git-clone
```

## Quick Start
```ts
import { clone } from 'build-git-clone'

clone('build-git-clone', 'https://github.com/emanuelmoraes-dev/build-git-clone.git')
```

## Import
```ts
import { clone, StdioLog } from 'build-git-clone'
```

## API
```ts
async function clone (
    folder: string,
    url: string,
    afterCommand: string | null = null,
    options: object = {
		git = 'git',
		stdioInherit = true,
		stdoutLog = StdioLog.IncludeShow,
		stderrLog = StdioLog.IncludeShow,
		internalLog = StdioLog.IncludeShow
	}
): Promise<[
    (Error | null),
    { stdout: string, stderr: string }
]>
```

### Arguments
* folder: destination folder, relative to the current working directory. If it already exists, it is removed and recreated before cloning.
* url: repository url
* afterCommand: shell command to execute within the cloned repository (optional). Only pass commands trusted by your application; do not build this value from untrusted input.
* options: configuration options (optional)
    * git: path to git binary (optional)
    * stdioInherit: If true, stdin, stdout, and stderr are inherited by the parent process; child-process output is not captured or routed by the logging options. If false, output is captured and handled according to the logging options.
    * stdoutLog: Defines what should be done with the standard output of the executed commands (optional)
        * StdioLog.IncludeShow: Include in the return (stdout) and write to the terminal's stdout
        * StdioLog.IncludeSilent: ONLY includes in the return (stdout) the standard output of the executed commands
        * StdioLog.Show: ONLY write to the terminal's stdout
        * StdioLog.None: Does nothing with standard output from commands executed
    * stderrLog: Defines what should be done with the standard error output of the executed commands (optional)
        * StdioLog.IncludeShow: Include in the return (stderr) and write to the terminal's stdout
        * StdioLog.IncludeSilent: ONLY includes in the return (stderr) the standard error output of the executed commands
        * StdioLog.Show: ONLY write to the terminal's stdout
        * StdioLog.None: Does nothing with standard error output from commands executed
    * internalLog: Defines what should be done with the logs generated internally (optional)
        * StdioLog.IncludeShow: Include in the return (stdout) write to the terminal's stdout the logs generated internally
        * StdioLog.IncludeSilent: ONLY includes in the return (stdout) the logs generated internally
        * StdioLog.Show: ONLY write to the terminal's stdout the logs generated internally
        * StdioLog.None: Does nothing with the logs generated internally

### Return  
```ts
[error, { stdout, stderr }]
```
* error: `null` on success; on failure, the value caught by the function (normally an `Error`). If a child process exits unsuccessfully, captured stderr may be included in the error message when `stderrLog` is set to an including mode. Output already collected from earlier successful steps may still be present in the returned strings.
* stdout: Internal log messages and captured stdout according to the selected options.
* stderr: Captured stderr from child processes that completed successfully, according to `stderrLog`. Stderr from a process that exits unsuccessfully is reported through `error`, not appended to this field.