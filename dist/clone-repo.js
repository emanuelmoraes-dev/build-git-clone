"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneRepo = cloneRepo;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_child_process_1 = require("node:child_process");
const types_1 = require("./types");
const utils_1 = require("./utils");
function buildStdioLogObj(stdioLog, inheritAll) {
    return {
        include: (stdioLog === types_1.StdioLog.IncludeSilent ||
            stdioLog === types_1.StdioLog.IncludeShow),
        show: !inheritAll && (stdioLog === types_1.StdioLog.IncludeShow ||
            stdioLog === types_1.StdioLog.Show),
        none: stdioLog === types_1.StdioLog.None
    };
}
function cloneRepo(folder_1, url_1) {
    return __awaiter(this, arguments, void 0, function* (folder, url, { git = 'git', stdioInherit = 'none', recreateFolderIfExists = { enabled: false }, stdoutLog = types_1.StdioLog.IncludeSilent, stderrLog = types_1.StdioLog.IncludeSilent, internalLog = types_1.StdioLog.IncludeSilent } = {}) {
        const stdoutLogObj = buildStdioLogObj(stdoutLog, stdioInherit === 'all');
        const stderrLogObj = buildStdioLogObj(stderrLog, stdioInherit === 'all');
        const internalLogObj = buildStdioLogObj(internalLog, stdioInherit === 'all');
        const output = { stdout: '', stderr: '' };
        try {
            const pathResponse = yield resolvePath(folder, internalLogObj, recreateFolderIfExists);
            const path = pathResponse.path;
            output.stdout += pathResponse.stdout;
            yield resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj, output);
            return [null, output];
        }
        catch (error) {
            return [error, output];
        }
    });
}
function resolvePath(folder, internalLogObj, recreateFolderIfExists) {
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = '';
        const workingDirectory = (0, node_path_1.resolve)();
        let path = (0, node_path_1.resolve)(workingDirectory, folder);
        if (!recreateFolderIfExists.enabled)
            return { path, stdout };
        const configuredParent = (0, node_path_1.resolve)(workingDirectory, recreateFolderIfExists.parent);
        let actualParent;
        try {
            actualParent = yield (0, promises_1.realpath)(configuredParent);
        }
        catch (error) {
            if (typeof error === 'object' && (error === null || error === void 0 ? void 0 : error.code) !== 'ENOENT')
                throw error;
            const relativeDestination = (0, node_path_1.relative)(configuredParent, path);
            const isImmediateChild = relativeDestination !== '' &&
                relativeDestination !== '..' &&
                !relativeDestination.startsWith(`..${node_path_1.sep}`) &&
                !(0, node_path_1.isAbsolute)(relativeDestination) &&
                (0, node_path_1.dirname)(relativeDestination) === '.';
            if (!isImmediateChild)
                throw new Error('Destination must be an immediate child of the configured parent directory');
            return { path, stdout };
        }
        const destinationParent = yield (0, promises_1.realpath)((0, node_path_1.dirname)(path));
        if (actualParent !== destinationParent)
            throw new Error('Destination must be an immediate child of the configured parent directory');
        path = (0, node_path_1.join)(actualParent, (0, node_path_1.basename)(path));
        try {
            const stats = yield (0, promises_1.lstat)(path);
            if (!stats.isDirectory())
                throw new Error(`Destination exists and is not a directory: ${path}`);
            stdout += yield (0, utils_1.recreate)(path, internalLogObj);
        }
        catch (error) {
            if (typeof error === 'object' && (error === null || error === void 0 ? void 0 : error.code) !== 'ENOENT')
                throw error;
            if (internalLogObj.show)
                console.log('Creating', path, '...');
            if (internalLogObj.include)
                stdout += `Creating ${path} ...\n`;
            yield (0, promises_1.mkdir)(path);
            if (internalLogObj.show)
                console.log(path, 'created.');
            if (internalLogObj.include)
                stdout += `${path} created.\n`;
        }
        return { path, stdout };
    });
}
function resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj, output) {
    return __awaiter(this, void 0, void 0, function* () {
        if (internalLogObj.show)
            console.log('Cloning', url, '...\n');
        if (internalLogObj.include)
            output.stdout += `Cloning ${url} ...\n\n`;
        yield execGitClone(git, url, path, stdioInherit, stdoutLogObj, stderrLogObj, output);
        if (internalLogObj.show)
            console.log('\n' + url, 'cloned in', path);
        if (internalLogObj.include)
            output.stdout += `\n${url} cloned in ${path}.\n`;
    });
}
function execGitClone(git, url, dest, stdioInherit, stdoutLogObj, stderrLogObj, output) {
    const args = ['clone', '--', url, dest];
    let proc = stdioInherit === 'all'
        ? (0, node_child_process_1.spawn)(git, args, { shell: false, stdio: 'inherit' })
        : stdioInherit === 'stdin'
            ? (0, node_child_process_1.spawn)(git, args, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] })
            : (0, node_child_process_1.spawn)(git, args, { shell: false });
    return (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj, output, process.stdout, process.stderr);
}
