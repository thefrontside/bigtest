"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timebox = void 0;
const effection_1 = require("effection");
function* timebox(operation, timelimit) {
    yield effection_1.spawn(function* () {
        yield effection_1.timeout(timelimit);
        let error = new Error(`timelimit of ${timelimit}ms exceeded`);
        error.name = 'TimeoutError';
        throw error;
    });
    return yield operation;
}
exports.timebox = timebox;
//# sourceMappingURL=timebox.js.map