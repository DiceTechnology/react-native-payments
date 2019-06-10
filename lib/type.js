"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isTransactionApple(t) {
    return t.appReceipt !== undefined;
}
exports.isTransactionApple = isTransactionApple;
function isTransactionGoogle(t) {
    return t.appReceipt !== undefined;
}
exports.isTransactionGoogle = isTransactionGoogle;
function isTransactionAmazon(t) {
    return t.userId !== undefined;
}
exports.isTransactionAmazon = isTransactionAmazon;
var AppStore;
(function (AppStore) {
    AppStore[AppStore["APPLE"] = 0] = "APPLE";
    AppStore[AppStore["AMAZON"] = 1] = "AMAZON";
    AppStore[AppStore["GOOGLE"] = 2] = "GOOGLE";
    AppStore[AppStore["UNKNOWN"] = 3] = "UNKNOWN";
})(AppStore = exports.AppStore || (exports.AppStore = {}));
//# sourceMappingURL=type.js.map