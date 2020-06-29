"use strict";
exports.__esModule = true;
var cucumber_1 = require("cucumber");
var And = cucumber_1.When;
// globals for now
var left = 0;
var right = 0;
var result = 0;
cucumber_1.Given('I take the number {int}', function (n) {
    left = Number(n);
});
cucumber_1.When('I take the number {int}', function (n) {
    right = Number(n);
});
And('I add them', function () {
    result = left + right;
});
cucumber_1.Then('I will have {int}', function () {
    console.log(result);
});
