"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const IOSBridge_1 = require("./IOSBridge");
const AndroidBridge_1 = require("./AndroidBridge");
const { RNPayments } = react_native_1.NativeModules;
exports.eventEmitter = new react_native_1.NativeEventEmitter(RNPayments);
exports.bridge = react_native_1.Platform.select({
    ios: new IOSBridge_1.IOSBridge(),
    android: new AndroidBridge_1.AndroidBridge()
});
//# sourceMappingURL=index.js.map