"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const IOSBridge_1 = require("./IOSBridge");
const AndroidBridge_1 = require("./AndroidBridge");
const AmazonBridge_1 = require("./AmazonBridge");
exports.bridge = react_native_1.Platform.select({
    ios: new IOSBridge_1.IOSBridge(),
    android: (AmazonBridge_1.AmazonBridge.isAppStoreAvailable()
        ? new AmazonBridge_1.AmazonBridge()
        : new AndroidBridge_1.AndroidBridge())
});
//# sourceMappingURL=index.js.map