# build-git-clone (ts/js)
clone repositories in the desired folder, allowing custom commands to be executed within the cloned repository

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
* folder: destination folder
* url: repository url
* afterCommand: command to be executed within the cloned repository (optional)
* options: configuration options (optional)
    * git: path to git binary (optional)
    * stdioInherit: If true, standard input and output ONLY occur (not included in the return) by the terminal that runs the script
    * stdoutLog: Defines what should be done with the standard output of the executed commands (optional)
        * StdioLog.IncludeShow: Include in the return (stdout) and display in the console.log the standard output of the executed commands
        * StdioLog.IncludeSilent: ONLY includes in the return (stdout) the standard output of the executed commands
        * StdioLog.Show: ONLY display in the console.log the standard output of the executed commands
        * StdioLog.None: Does nothing with standard output from commands executed
    * stderrLog: Defines what should be done with the standard error output of the executed commands (optional)
        * StdioLog.IncludeShow: Include in the return (stderr) and display in the console.log the standard error output of the executed commands
        * StdioLog.IncludeSilent: ONLY includes in the return (stderr) the standard error output of the executed commands
        * StdioLog.Show: ONLY display in the console.log the standard error output of the executed commands
        * StdioLog.None: Does nothing with standard error output from commands executed

### Return
```ts
[error, { stdout, stderr }]
```
* error: Error launched in case of failure. `null` if there was no failure
* stdout: Standard output obtained by all commands executed
* stderr: Standard error output obtained by all commands executed