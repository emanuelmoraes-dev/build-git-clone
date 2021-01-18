# build-git-clone (ts/js)
clone repositories in the desired folder, allowing custom commands to be executed within the cloned repository

## Install
```sh
npm install --save build-git-clone
```

## Import
```ts
import { clone } from 'build-git-clone'
```

## API
```ts
function clone (
    folder: string,
    url: string,
    afterCommand: string | null = null,
    options: object = { git: 'git' }
): Promise<void>
```

### Arguments
* folder: destination folder
* url: repository url
* afterCommand: command to be executed within the cloned repository (optional)
* options: configuration options (optional)
    * git: path to git binary (optional)