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
exports.recreate = recreate;
exports.resolveChildProcess = resolveChildProcess;
const promises_1 = require("node:fs/promises");
const rimraf_1 = require("rimraf");
function recreate(path, internalLogObj) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, rimraf_1.rimraf)(path);
        yield (0, promises_1.mkdir)(path);
        if (internalLogObj.show)
            console.log(path, 'recreated.');
        if (internalLogObj.include)
            return `${path} recreated.\n`;
        else
            return '';
    });
}
function resolveChildProcess(proc, stdoutLogObj, stderrLogObj, output, stdoutTarget = process.stdout, stderrTarget = process.stdout) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        let error = null;
        proc.on('error', err => {
            error = err;
        });
        (_a = proc.stderr) === null || _a === void 0 ? void 0 : _a.on('data', err => {
            const str = err.toString();
            if (stderrLogObj.show)
                stderrTarget.write(str);
            if (stderrLogObj.include)
                output.stderr += str;
        });
        (_b = proc.stdout) === null || _b === void 0 ? void 0 : _b.on('data', out => {
            const str = out.toString();
            if (stdoutLogObj.show)
                stdoutTarget.write(str);
            if (stdoutLogObj.include)
                output.stdout += str;
        });
        proc.on('close', code => {
            if (error || code !== 0) {
                reject(error || new Error(`${output.stderr}\nCode ${code}`));
            }
            else {
                resolve();
            }
        });
    });
}
