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
exports.clone = clone;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_child_process_1 = require("node:child_process");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * @deprecated will be removed in v2.
 */
function getStdioLogObj(stdioLog) {
    return {
        include: (stdioLog === types_1.StdioLog.IncludeSilent ||
            stdioLog === types_1.StdioLog.IncludeShow),
        show: (stdioLog === types_1.StdioLog.IncludeShow ||
            stdioLog === types_1.StdioLog.Show),
        none: stdioLog === types_1.StdioLog.None
    };
}
/**
 * @deprecated will be removed in v2. use `cloneRepo` instead.
 */
function clone(folder_1, url_1) {
    return __awaiter(this, arguments, void 0, function* (folder, url, afterCommand = null, { git = 'git', stdioInherit = true, stdoutLog = types_1.StdioLog.IncludeShow, stderrLog = types_1.StdioLog.IncludeShow, internalLog = types_1.StdioLog.IncludeShow } = {}) {
        const internalLogObj = getStdioLogObj(internalLog);
        let stdout = '';
        let stderr = '';
        let response;
        try {
            const path = (0, node_path_1.join)((0, node_path_1.resolve)(), folder);
            if (internalLogObj.show)
                console.log('Creating', path, '...');
            if (internalLogObj.include)
                stdout += `Creating ${path} ...\n`;
            try {
                yield (0, promises_1.mkdir)(path);
                if (internalLogObj.show)
                    console.log(path, 'created.');
                if (internalLogObj.include)
                    stdout += `${path} created.\n`;
            }
            catch (_) {
                stdout += yield (0, utils_1.recreate)(path, internalLogObj);
            }
            if (internalLogObj.show)
                console.log('Cloning', url, '...\n');
            if (internalLogObj.include)
                stdout += `Cloning ${url} ...\n\n`;
            response = yield cloneCommand(git, url, path, stdioInherit, stdoutLog, stderrLog);
            stdout += response.stdout;
            stderr += response.stderr;
            if (internalLogObj.show)
                console.log('\n' + url, 'cloned in', path);
            if (internalLogObj.include)
                stdout += `\n${url} cloned in ${path}.\n`;
            if (afterCommand) {
                response = yield execAnyCommand(afterCommand, path, stdioInherit, stdoutLog, stderrLog);
                stdout += response.stdout;
                stderr += response.stderr;
            }
            return [null, {
                    stdout,
                    stderr
                }];
        }
        catch (error) {
            return [error, {
                    stdout,
                    stderr
                }];
        }
    });
}
/**
 * @deprecated will be removed in v2.
 */
function cloneCommand(git, url, dest, stdioInherit, stdoutLog, stderrLog) {
    return __awaiter(this, void 0, void 0, function* () {
        const stdoutLogObj = getStdioLogObj(stdoutLog);
        const stderrLogObj = getStdioLogObj(stderrLog);
        const output = { stdout: '', stderr: '' };
        const options = stdioInherit
            ? { shell: false, cwd: dest, stdio: 'inherit' }
            : { shell: false, cwd: dest };
        const proc = (0, node_child_process_1.spawn)(git, ['clone', '--', url, '.'], options);
        yield (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj, output);
        return output;
    });
}
/**
 * @deprecated will be removed in v2.
 */
function execAnyCommand(command, cwd, stdioInherit, stdoutLog, stderrLog) {
    return __awaiter(this, void 0, void 0, function* () {
        const stdoutLogObj = getStdioLogObj(stdoutLog);
        const stderrLogObj = getStdioLogObj(stderrLog);
        const output = { stdout: '', stderr: '' };
        let program;
        let args;
        if (process.platform === 'win32') {
            program = 'cmd';
            args = ['/C', command];
        }
        else {
            program = 'sh';
            args = ['-c', command];
        }
        let options = {};
        if (stdioInherit) {
            options = { cwd, stdio: 'inherit' };
        }
        else {
            options = { cwd };
        }
        const proc = (0, node_child_process_1.spawn)(program, args, options);
        yield (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj, output);
        return output;
    });
}
