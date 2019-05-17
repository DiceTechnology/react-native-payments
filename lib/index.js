"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const Bridge_1 = require("./Bridge");
let bridge = new Bridge_1.UnimplementedBridge();
exports.bridge = bridge;
if (react_native_1.Platform.OS === 'android') {
}
else if (react_native_1.Platform.OS === 'ios') {
    const { IOSBridge } = require('./IOSBridge');
    exports.bridge = bridge = new IOSBridge();
}
else {
    const { AndroidBridge } = require('./AndroidBridge');
    const { AmazonBridge } = require('./AmazonBridge');
    exports.bridge = bridge = (AmazonBridge.isAppStoreAvailable()
        ? new AmazonBridge()
        : new AndroidBridge());
}
//# sourceMappingURL=index.js.map