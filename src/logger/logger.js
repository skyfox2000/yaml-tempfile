"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var consola_1 = require("consola");
var util = require("util");
var colors = {
    reset: "\x1b[0m",
    // 文字颜色
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    green: "\x1b[32m",
    brown: "\x1b[33m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    // 背景颜色
    bgRed: "\x1b[41m",
    bgYellow: "\x1b[43m",
    bgGreen: "\x1b[42m",
    bgBrown: "\x1b[43m",
    bgWhite: "\x1b[47m",
};
function applyColor(text, color) {
    return "".concat(color).concat(text).concat(colors.reset);
}
/**
 * 默认Level设置为3
 */
consola_1.default.level = 3;
consola_1.default.setReporters([
    {
        log: function (logObj) {
            var output = [];
            output.push("[");
            output.push(new Date().toLocaleTimeString());
            output.push("] ");
            var logLevel = logObj.level;
            var levelText = "";
            var logText = "";
            var messages = [];
            for (var _i = 0, _a = logObj.args; _i < _a.length; _i++) {
                var msg = _a[_i];
                if (typeof msg === "object")
                    messages.push(util.inspect(msg, false, 3, true));
                else
                    messages.push(msg);
                messages.push(" ");
            }
            switch (logLevel) {
                case 0:
                    logText = "ERROR";
                    levelText = applyColor(applyColor(logText, colors.white), colors.bgRed);
                    logObj.message = applyColor(messages.join(""), colors.red);
                    break;
                case 1:
                    logText = "WARN";
                    levelText = applyColor(logText, colors.bgYellow);
                    logObj.message = applyColor(messages.join(""), colors.yellow);
                    break;
                case 2:
                    logText = "LOG";
                    levelText = applyColor(logText, colors.green);
                    logObj.message = messages.join("");
                    break;
                case 3:
                    logText = "INFO";
                    levelText = applyColor(logText, colors.green);
                    logObj.message = applyColor(messages.join(""), colors.gray);
                    break;
                case 4:
                    logText = "DEBUG";
                    levelText = applyColor(logText, colors.red);
                    logObj.message = applyColor(messages.join(""), colors.red);
                    break;
                case 5:
                    logText = "TRACE";
                    levelText = applyColor(logText, colors.red);
                    logObj.message = messages.join("");
                    break;
            }
            output.push(levelText);
            output.push(": ");
            output.push(logObj.message || "");
            console.log(output.join(""));
        },
    },
]);
exports.default = consola_1.default;
