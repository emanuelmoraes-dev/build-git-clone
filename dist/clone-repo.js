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
exports.cloneRepo = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var types_1 = require("./types");
var utils_1 = require("./utils");
var util_1 = require("util");
var child_process_1 = require("child_process");
var mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
function buildStdioLogObj(stdioLog, inheritAll) {
    return {
        include: (stdioLog === types_1.StdioLog.IncludeSilent ||
            stdioLog === types_1.StdioLog.IncludeShow),
        show: !inheritAll && (stdioLog === types_1.StdioLog.IncludeShow ||
            stdioLog === types_1.StdioLog.Show),
        none: stdioLog === types_1.StdioLog.None
    };
}
function cloneRepo(folder, url, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.git, git = _c === void 0 ? 'git' : _c, _d = _b.stdioInherit, stdioInherit = _d === void 0 ? 'none' : _d, _e = _b.stdoutLog, stdoutLog = _e === void 0 ? types_1.StdioLog.IncludeSilent : _e, _f = _b.stderrLog, stderrLog = _f === void 0 ? types_1.StdioLog.IncludeSilent : _f, _g = _b.internalLog, internalLog = _g === void 0 ? types_1.StdioLog.IncludeSilent : _g;
    return __awaiter(this, void 0, void 0, function () {
        var stdoutLogObj, stderrLogObj, internalLogObj, stdout, stderr, pathResponse, path, cloneResponse, error_1;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    stdoutLogObj = buildStdioLogObj(stdoutLog, stdioInherit === 'all');
                    stderrLogObj = buildStdioLogObj(stderrLog, stdioInherit === 'all');
                    internalLogObj = buildStdioLogObj(internalLog, stdioInherit === 'all');
                    stdout = '';
                    stderr = '';
                    _h.label = 1;
                case 1:
                    _h.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, resolvePath(folder, internalLogObj)];
                case 2:
                    pathResponse = _h.sent();
                    path = pathResponse.path;
                    stdout += pathResponse.stdout;
                    return [4 /*yield*/, resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj)];
                case 3:
                    cloneResponse = _h.sent();
                    stdout += cloneResponse.stdout;
                    stderr += cloneResponse.stderr;
                    return [2 /*return*/, [null, {
                                stdout: stdout,
                                stderr: stderr
                            }]];
                case 4:
                    error_1 = _h.sent();
                    return [2 /*return*/, [error_1, {
                                stdout: stdout,
                                stderr: stderr
                            }]];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.cloneRepo = cloneRepo;
function resolvePath(folder, internalLogObj) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, path, _1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stdout = '';
                    path = (0, path_1.join)((0, path_1.resolve)(), folder);
                    if (internalLogObj.show)
                        console.log('Creating', path, '...');
                    if (internalLogObj.include)
                        stdout += "Creating ".concat(path, " ...\n");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, mkdir(path)];
                case 2:
                    _b.sent();
                    if (internalLogObj.show)
                        console.log(path, 'created.');
                    if (internalLogObj.include)
                        stdout += "".concat(path, " created.\n");
                    return [3 /*break*/, 5];
                case 3:
                    _1 = _b.sent();
                    _a = stdout;
                    return [4 /*yield*/, (0, utils_1.recreate)(path, internalLogObj)];
                case 4:
                    stdout = _a + _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, { path: path, stdout: stdout }];
            }
        });
    });
}
function resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, stderr, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stdout = '';
                    stderr = '';
                    if (internalLogObj.show)
                        console.log('Cloning', url, '...\n');
                    if (internalLogObj.include)
                        stdout += "Cloning ".concat(url, " ...\n\n");
                    return [4 /*yield*/, execGitClone(git, url, path, stdioInherit, stdoutLogObj, stderrLogObj)];
                case 1:
                    response = _a.sent();
                    stdout += response.stdout;
                    stderr += response.stderr;
                    if (internalLogObj.show)
                        console.log('\n' + url, 'cloned in', path);
                    if (internalLogObj.include)
                        stdout += "\n".concat(url, " cloned in ").concat(path, ".\n");
                    return [2 /*return*/, { stdout: stdout, stderr: stderr }];
            }
        });
    });
}
function execGitClone(git, url, dest, stdioInherit, stdoutLogObj, stderrLogObj) {
    var args = ['clone', '--', url, dest];
    var proc = stdioInherit === 'all'
        ? (0, child_process_1.spawn)(git, args, { shell: false, stdio: 'inherit' })
        : stdioInherit === 'stdin'
            ? (0, child_process_1.spawn)(git, args, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] })
            : (0, child_process_1.execFile)(git, args, { shell: false });
    return (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj, process.stdout, process.stderr);
}
