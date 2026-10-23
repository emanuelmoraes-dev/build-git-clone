# build-git-clone (ts/js)

Clone a Git repository into a destination folder.

## Install
```sh
npm install --save build-git-clone
```

## Quick Start
Use `cloneRepo` for new code:

```ts
import { cloneRepo } from 'build-git-clone'

const [error, result] = await cloneRepo(
    'build-git-clone',
    'https://github.com/emanuelmoraes-dev/build-git-clone.git'
)

if (error) {
    console.error(error)
} else {
    console.log(result.stdout)
}
```

## Functions

### `cloneRepo(folder, url, options?)`

The current API for cloning a repository. It does not run a post-clone command.

```ts
cloneRepo(folder: string, url: string, options?: {
    git?: string
    stdioInherit?: 'none' | 'stdin' | 'all'
    stdoutLog?: StdioLog
    stderrLog?: StdioLog
    internalLog?: StdioLog
}): Promise<[unknown | null, { stdout: string, stderr: string }]>
```

Arguments:

* `folder`: Destination folder, relative to the current working directory.
* `url`: Repository URL passed to Git.
* `git`: Git executable to run. Defaults to `git`.
* `stdioInherit`: Controls which standard streams are inherited by Git. Defaults to `'none'`.
    * `'none'`: Inherit no streams. Git output is captured and handled according to `stdoutLog` and `stderrLog`.
    * `'stdin'`: Inherit stdin for interactive prompts; capture stdout and stderr for logging and the return value.
    * `'all'`: Inherit stdin, stdout, and stderr. Git output goes directly to the parent terminal and is not captured in the returned `stdout` or `stderr`.
* `stdoutLog`, `stderrLog`: Control how captured Git output is handled. Both default to `StdioLog.IncludeSilent`.
* `internalLog`: Controls the library's own status messages. Defaults to `StdioLog.IncludeSilent`.

`StdioLog` values:

* `StdioLog.IncludeSilent`: Include the text in the returned string without printing it to the console.
* `StdioLog.IncludeShow`: Include the text in the returned string and print it to the console.
* `StdioLog.Show`: Print the text to the console without including it in the returned string.
* `StdioLog.None`: Do not print or include the text.

For `cloneRepo`, displayed stdout is written to `process.stdout`, and displayed stderr is written to `process.stderr`. Internal status messages are written to `process.stdout`. With the defaults, captured Git output and internal status messages are included in the returned strings but are not printed to the console. To allow interactive prompts while capturing and displaying Git output:

```ts
import { cloneRepo, StdioLog } from 'build-git-clone'

const [error, result] = await cloneRepo('project', repositoryUrl, {
    stdioInherit: 'stdin',
    stdoutLog: StdioLog.IncludeShow,
    stderrLog: StdioLog.IncludeShow
})
```

### `clone(folder, url, afterCommand?, options?)` (deprecated)

This is the legacy API and will be removed in v2. It remains available in this release to avoid breaking existing callers. New code should use `cloneRepo`.

The legacy defaults are preserved: `stdioInherit` defaults to `true`, and the log options default to `StdioLog.IncludeShow`. When `stdioInherit` is `true`, Git's standard streams are inherited by the terminal, so its stdout and stderr are not captured in the returned strings. Set it to `false` to capture output according to the log options.

For compatibility, the legacy function writes both displayed stdout and stderr to `process.stdout`. The newer `cloneRepo` function writes each stream to its corresponding process stream.

`afterCommand` is an optional shell command executed in the cloned repository. It is retained for compatibility, but should only contain a command explicitly trusted by the application. Do not pass user-controlled input to it.

The legacy function also accepts `git`, `stdioInherit`, `stdoutLog`, `stderrLog`, and `internalLog` in its options object. Its return value has the same shape as `cloneRepo`:

```ts
const [error, { stdout, stderr }] = await clone(folder, url, afterCommand, options)
```

## Input Handling

If your application accepts repository URLs from users, validate them according to the hosts and protocols your application intends to support.

The deprecated `afterCommand` parameter executes a shell command in the cloned repository. Only provide commands trusted by your application; do not build this value from untrusted input.

## Return Value

Both functions return a tuple:

```ts
[error, { stdout, stderr }]
```

`error` is `null` when the operation succeeds and contains the failure otherwise. `stdout` and `stderr` contain captured process output according to the selected options; output sent directly to the terminal using inherited streams cannot be captured.