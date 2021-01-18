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
        while (_) try {
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
exports.clone = exports.StdioLog = void 0;
// importing
var fs_1 = __importDefault(require("fs"));
var rimraf_1 = __importDefault(require("rimraf"));
var child_process_1 = require("child_process");
var path_1 = require("path");
// parse to promise
var util_1 = require("util");
var mkdir = util_1.promisify(fs_1.default.mkdir);
var rmdir = util_1.promisify(rimraf_1.default);
function getStdioLogObj(stdioLog) {
    return {
        include: (stdioLog === StdioLog.IncludeSilent ||
            stdioLog === StdioLog.IncludeShow),
        show: (stdioLog === StdioLog.IncludeShow ||
            stdioLog === StdioLog.Show),
        none: stdioLog === StdioLog.None
    };
}
var StdioLog;
(function (StdioLog) {
    StdioLog[StdioLog["IncludeSilent"] = 0] = "IncludeSilent";
    StdioLog[StdioLog["IncludeShow"] = 1] = "IncludeShow";
    StdioLog[StdioLog["Show"] = 2] = "Show";
    StdioLog[StdioLog["None"] = 3] = "None";
})(StdioLog = exports.StdioLog || (exports.StdioLog = {}));
// clone a project
function clone(folder, url, afterCommand, _a) {
    if (afterCommand === void 0) { afterCommand = null; }
    var _b = _a === void 0 ? {} : _a, _c = _b.git, git = _c === void 0 ? 'git' : _c, _d = _b.stdioInherit, stdioInherit = _d === void 0 ? true : _d, _e = _b.stdoutLog, stdoutLog = _e === void 0 ? StdioLog.IncludeShow : _e, _f = _b.stderrLog, stderrLog = _f === void 0 ? StdioLog.IncludeShow : _f, _g = _b.internalLog, internalLog = _g === void 0 ? StdioLog.IncludeShow : _g;
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
                    path = path_1.join(path_1.resolve(), folder);
                    if (internalLogObj.show)
                        console.log('Creating', path, '...');
                    if (internalLogObj.include)
                        stdout += "Creating " + path + " ...\n";
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, mkdir(path)];
                case 3:
                    _j.sent();
                    if (internalLogObj.show)
                        console.log(path, 'created.');
                    if (internalLogObj.include)
                        stdout += path + " created.\n";
                    return [3 /*break*/, 6];
                case 4:
                    _1 = _j.sent();
                    _h = stdout;
                    return [4 /*yield*/, recreate(path, internalLog)];
                case 5:
                    stdout = _h + _j.sent();
                    return [3 /*break*/, 6];
                case 6:
                    if (internalLogObj.show)
                        console.log('Cloning', url, '...\n');
                    if (internalLogObj.include)
                        stdout += "Cloning " + url + " ...\n\n";
                    return [4 /*yield*/, exec("cd " + path + " && " + git + " clone " + url + " .", stdioInherit, stdoutLog, stderrLog)];
                case 7:
                    response = _j.sent();
                    stdout += response.stdout;
                    stderr += response.stderr;
                    if (internalLogObj.show)
                        console.log('\n' + url, 'cloned in', path);
                    if (internalLogObj.include)
                        stdout += "\n" + url + " cloned in " + path + ".\n";
                    if (!afterCommand) return [3 /*break*/, 9];
                    return [4 /*yield*/, exec("cd " + path + " && " + afterCommand, stdioInherit, stdoutLog, stderrLog)];
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
// remove and create folder
function recreate(path, internalLog) {
    return __awaiter(this, void 0, void 0, function () {
        var internalLogObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    internalLogObj = getStdioLogObj(internalLog);
                    return [4 /*yield*/, rmdir(path)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, mkdir(path)];
                case 2:
                    _a.sent();
                    if (internalLogObj.show)
                        console.log(path, 'recreated.');
                    if (internalLogObj.include)
                        return [2 /*return*/, path + " recreated.\n"];
                    else
                        return [2 /*return*/, ''];
                    return [2 /*return*/];
            }
        });
    });
}
// exec command
function exec(command, stdioInherit, stdoutLog, stderrLog) {
    return __awaiter(this, void 0, void 0, function () {
        var stdoutLogObj, stderrLogObj, program, args, options;
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
            if (stdioInherit)
                options = { stdio: 'inherit' };
            else
                options = {};
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var proc = child_process_1.spawn(program, args, options);
                    var error = null;
                    var stderr = '';
                    var stdout = '';
                    // if (!stdioInherit) {
                    proc.on('error', function (err) {
                        error = err;
                    });
                    proc.stderr.on('data', function (err) {
                        var str = err.toString();
                        if (stderrLogObj.show)
                            process.stdout.write(str);
                        if (stderrLogObj.include)
                            stderr += "" + str;
                    });
                    proc.stdout.on('data', function (out) {
                        var str = out.toString();
                        if (stdoutLogObj.show)
                            process.stdout.write(str);
                        if (stdoutLogObj.include)
                            stdout += "" + str;
                    });
                    // }
                    proc.on('close', function (code) {
                        if (code)
                            reject(error || new Error(stderr + "\nCode " + code || "error: " + program + ": Code " + code));
                        else
                            resolve({
                                stderr: stderr,
                                stdout: stdout
                            });
                    });
                })];
        });
    });
}
