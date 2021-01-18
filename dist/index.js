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
exports.clone = void 0;
// importing
var fs_1 = __importDefault(require("fs"));
var rimraf_1 = __importDefault(require("rimraf"));
var child_process_1 = require("child_process");
var path_1 = require("path");
// parse to promise
var util_1 = require("util");
var mkdir = util_1.promisify(fs_1.default.mkdir);
var rmdir = util_1.promisify(rimraf_1.default);
// clone a project
function clone(folder, url, afterCommand, _a) {
    if (afterCommand === void 0) { afterCommand = null; }
    var _b = _a === void 0 ? {} : _a, _c = _b.git, git = _c === void 0 ? 'git' : _c;
    return __awaiter(this, void 0, void 0, function () {
        var path, _1, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 9, , 10]);
                    path = path_1.join(path_1.resolve(), folder);
                    console.log('Creating', path, '...');
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, mkdir(path)];
                case 2:
                    _d.sent();
                    console.log(path, 'created.');
                    return [3 /*break*/, 5];
                case 3:
                    _1 = _d.sent();
                    return [4 /*yield*/, recreate(path)];
                case 4:
                    _d.sent();
                    return [3 /*break*/, 5];
                case 5:
                    console.log('Cloning', url, '...\n');
                    return [4 /*yield*/, exec("cd " + path + " && " + git + " clone " + url + " .")];
                case 6:
                    _d.sent();
                    console.log('\n' + url, 'cloned.');
                    if (!afterCommand) return [3 /*break*/, 8];
                    return [4 /*yield*/, exec("cd " + path + " && " + afterCommand)];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _d.sent();
                    console.error(error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.clone = clone;
// remove and create folder
function recreate(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, rmdir(path)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, mkdir(path)];
                case 2:
                    _a.sent();
                    console.log(path, 'recreated.');
                    return [2 /*return*/];
            }
        });
    });
}
// exec command
function exec(command) {
    return __awaiter(this, void 0, void 0, function () {
        var program, args;
        return __generator(this, function (_a) {
            if (process.platform === 'win32') {
                program = 'cmd';
                args = ['/C', command];
            }
            else {
                program = 'sh';
                args = ['-c', command];
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var proc = child_process_1.spawn(program, args, { stdio: 'inherit' });
                    proc.on('close', function (code) { return code ? reject(new Error("Status Code: " + code)) : resolve(); });
                })];
        });
    });
}
