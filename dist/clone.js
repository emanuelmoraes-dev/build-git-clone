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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var types_1 = require("./types");
var utils_1 = require("./utils");
var child_process_1 = require("child_process");
var util_1 = require("util");
var mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
function getStdioLogObj(stdioLog) {
    return {
        include: (stdioLog === types_1.StdioLog.IncludeSilent ||
            stdioLog === types_1.StdioLog.IncludeShow),
        show: (stdioLog === types_1.StdioLog.IncludeShow ||
            stdioLog === types_1.StdioLog.Show),
        none: stdioLog === types_1.StdioLog.None
    };
}
function clone(folder, url, afterCommand, _a) {
    if (afterCommand === void 0) { afterCommand = null; }
    var _b = _a === void 0 ? {} : _a, _c = _b.git, git = _c === void 0 ? 'git' : _c, _d = _b.stdioInherit, stdioInherit = _d === void 0 ? true : _d, _e = _b.stdoutLog, stdoutLog = _e === void 0 ? types_1.StdioLog.IncludeShow : _e, _f = _b.stderrLog, stderrLog = _f === void 0 ? types_1.StdioLog.IncludeShow : _f, _g = _b.internalLog, internalLog = _g === void 0 ? types_1.StdioLog.IncludeShow : _g;
    return __awaiter(this, void 0, void 0, function () {
        var internalLogObj, stdout, stderr, response, path, _1, _h, error_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    internalLogObj = getStdioLogObj(internalLog);
                    stdout = '';
                    stderr = '';
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 10, , 11]);
                    path = (0, path_1.join)((0, path_1.resolve)(), folder);
                    if (internalLogObj.show)
                        console.log('Creating', path, '...');
                    if (internalLogObj.include)
                        stdout += "Creating ".concat(path, " ...\n");
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, mkdir(path)];
                case 3:
                    _j.sent();
                    if (internalLogObj.show)
                        console.log(path, 'created.');
                    if (internalLogObj.include)
                        stdout += "".concat(path, " created.\n");
                    return [3 /*break*/, 6];
                case 4:
                    _1 = _j.sent();
                    _h = stdout;
                    return [4 /*yield*/, (0, utils_1.recreate)(path, internalLogObj)];
                case 5:
                    stdout = _h + _j.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (internalLogObj.show)
                        console.log('Cloning', url, '...\n');
                    if (internalLogObj.include)
                        stdout += "Cloning ".concat(url, " ...\n\n");
                    return [4 /*yield*/, cloneCommand(git, url, path, stdioInherit, stdoutLog, stderrLog)];
                case 7:
                    response = _j.sent();
                    stdout += response.stdout;
                    stderr += response.stderr;
                    if (internalLogObj.show)
                        console.log('\n' + url, 'cloned in', path);
                    if (internalLogObj.include)
                        stdout += "\n".concat(url, " cloned in ").concat(path, ".\n");
                    if (!afterCommand) return [3 /*break*/, 9];
                    return [4 /*yield*/, execAnyCommand(afterCommand, path, stdioInherit, stdoutLog, stderrLog)];
                case 8:
                    response = _j.sent();
                    stdout += response.stdout;
                    stderr += response.stderr;
                    _j.label = 9;
                case 9: return [2 /*return*/, [null, {
                            stdout: stdout,
                            stderr: stderr
                        }]];
                case 10:
                    error_1 = _j.sent();
                    return [2 /*return*/, [error_1, {
                                stdout: stdout,
                                stderr: stderr
                            }]];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.clone = clone;
function cloneCommand(git, url, dest, stdioInherit, stdoutLog, stderrLog) {
    return __awaiter(this, void 0, void 0, function () {
        var stdoutLogObj, stderrLogObj, options, proc;
        return __generator(this, function (_a) {
            stdoutLogObj = getStdioLogObj(stdoutLog);
            stderrLogObj = getStdioLogObj(stderrLog);
            options = {};
            if (stdioInherit) {
                options = { shell: false, stdio: 'inherit' };
            }
            else {
                options = { shell: false };
            }
            proc = (0, child_process_1.spawn)(git, ['clone', '--', url, dest], options);
            return [2 /*return*/, (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj)];
        });
    });
}
function execAnyCommand(command, cwd, stdioInherit, stdoutLog, stderrLog) {
    return __awaiter(this, void 0, void 0, function () {
        var stdoutLogObj, stderrLogObj, program, args, options, proc;
        return __generator(this, function (_a) {
            stdoutLogObj = getStdioLogObj(stdoutLog);
            stderrLogObj = getStdioLogObj(stderrLog);
            if (process.platform === 'win32') {
                program = 'cmd';
                args = ['/C', command];
            }
            else {
                program = 'sh';
                args = ['-c', command];
            }
            options = {};
            if (stdioInherit) {
                options = { cwd: cwd, stdio: 'inherit' };
            }
            else {
                options = { cwd: cwd };
            }
            proc = (0, child_process_1.spawn)(program, args, options);
            return [2 /*return*/, (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj)];
        });
    });
}
