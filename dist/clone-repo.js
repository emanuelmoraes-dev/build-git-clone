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
var lstat = (0, util_1.promisify)(fs_1.default.lstat);
var realpath = (0, util_1.promisify)(fs_1.default.realpath);
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
    var _b = _a === void 0 ? {} : _a, _c = _b.git, git = _c === void 0 ? 'git' : _c, _d = _b.stdioInherit, stdioInherit = _d === void 0 ? 'none' : _d, _e = _b.recreateFolderIfExists, recreateFolderIfExists = _e === void 0 ? { enabled: false } : _e, _f = _b.stdoutLog, stdoutLog = _f === void 0 ? types_1.StdioLog.IncludeSilent : _f, _g = _b.stderrLog, stderrLog = _g === void 0 ? types_1.StdioLog.IncludeSilent : _g, _h = _b.internalLog, internalLog = _h === void 0 ? types_1.StdioLog.IncludeSilent : _h;
    return __awaiter(this, void 0, void 0, function () {
        var stdoutLogObj, stderrLogObj, internalLogObj, output, pathResponse, path, error_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    stdoutLogObj = buildStdioLogObj(stdoutLog, stdioInherit === 'all');
                    stderrLogObj = buildStdioLogObj(stderrLog, stdioInherit === 'all');
                    internalLogObj = buildStdioLogObj(internalLog, stdioInherit === 'all');
                    output = { stdout: '', stderr: '' };
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, resolvePath(folder, internalLogObj, recreateFolderIfExists)];
                case 2:
                    pathResponse = _j.sent();
                    path = pathResponse.path;
                    output.stdout += pathResponse.stdout;
                    return [4 /*yield*/, resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj, output)];
                case 3:
                    _j.sent();
                    return [2 /*return*/, [null, output]];
                case 4:
                    error_1 = _j.sent();
                    return [2 /*return*/, [error_1, output]];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.cloneRepo = cloneRepo;
function resolvePath(folder, internalLogObj, recreateFolderIfExists) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, workingDirectory, path, configuredParent, actualParent, error_2, destinationParent, stats, _a, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    stdout = '';
                    workingDirectory = (0, path_1.resolve)();
                    path = (0, path_1.resolve)(workingDirectory, folder);
                    if (!recreateFolderIfExists.enabled)
                        return [2 /*return*/, { path: path, stdout: stdout }];
                    configuredParent = (0, path_1.resolve)(workingDirectory, recreateFolderIfExists.parent);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, realpath(configuredParent)];
                case 2:
                    actualParent = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _b.sent();
                    if (typeof error_2 === 'object' && (error_2 === null || error_2 === void 0 ? void 0 : error_2.code) !== 'ENOENT')
                        throw error_2;
                    if ((0, path_1.dirname)(path) !== configuredParent)
                        throw new Error('Destination must be an immediate child of the configured parent directory');
                    return [2 /*return*/, { path: path, stdout: stdout }];
                case 4: return [4 /*yield*/, realpath((0, path_1.dirname)(path))];
                case 5:
                    destinationParent = _b.sent();
                    if (actualParent !== destinationParent)
                        throw new Error('Destination must be an immediate child of the configured parent directory');
                    path = (0, path_1.join)(actualParent, (0, path_1.basename)(path));
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 9, , 11]);
                    return [4 /*yield*/, lstat(path)];
                case 7:
                    stats = _b.sent();
                    if (!stats.isDirectory())
                        throw new Error("Destination exists and is not a directory: ".concat(path));
                    _a = stdout;
                    return [4 /*yield*/, (0, utils_1.recreate)(path, internalLogObj)];
                case 8:
                    stdout = _a + _b.sent();
                    return [3 /*break*/, 11];
                case 9:
                    error_3 = _b.sent();
                    if (typeof error_3 === 'object' && (error_3 === null || error_3 === void 0 ? void 0 : error_3.code) !== 'ENOENT')
                        throw error_3;
                    if (internalLogObj.show)
                        console.log('Creating', path, '...');
                    if (internalLogObj.include)
                        stdout += "Creating ".concat(path, " ...\n");
                    return [4 /*yield*/, mkdir(path)];
                case 10:
                    _b.sent();
                    if (internalLogObj.show)
                        console.log(path, 'created.');
                    if (internalLogObj.include)
                        stdout += "".concat(path, " created.\n");
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/, { path: path, stdout: stdout }];
            }
        });
    });
}
function resolveGitClone(git, url, path, stdioInherit, internalLogObj, stdoutLogObj, stderrLogObj, output) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (internalLogObj.show)
                        console.log('Cloning', url, '...\n');
                    if (internalLogObj.include)
                        output.stdout += "Cloning ".concat(url, " ...\n\n");
                    return [4 /*yield*/, execGitClone(git, url, path, stdioInherit, stdoutLogObj, stderrLogObj, output)];
                case 1:
                    _a.sent();
                    if (internalLogObj.show)
                        console.log('\n' + url, 'cloned in', path);
                    if (internalLogObj.include)
                        output.stdout += "\n".concat(url, " cloned in ").concat(path, ".\n");
                    return [2 /*return*/];
            }
        });
    });
}
function execGitClone(git, url, dest, stdioInherit, stdoutLogObj, stderrLogObj, output) {
    var args = ['clone', '--', url, dest];
    var proc = stdioInherit === 'all'
        ? (0, child_process_1.spawn)(git, args, { shell: false, stdio: 'inherit' })
        : stdioInherit === 'stdin'
            ? (0, child_process_1.spawn)(git, args, { shell: false, stdio: ['inherit', 'pipe', 'pipe'] })
            : (0, child_process_1.execFile)(git, args, { shell: false });
    return (0, utils_1.resolveChildProcess)(proc, stdoutLogObj, stderrLogObj, output, process.stdout, process.stderr);
}
