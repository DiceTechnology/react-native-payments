"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
const type_1 = require("./type");
const utils_1 = require("./utils");
const { RNPayments } = react_native_1.NativeModules;
class IOSBridge {
    constructor() {
        this.eventEmitter = new react_native_1.NativeEventEmitter(RNPayments);
    }
    static isAppStoreAvailable() {
        return !!RNPayments;
    }
    loadProducts(products) {
        return __awaiter(this, void 0, void 0, function* () {
            const validProducts = products.filter(utils_1.licenceSkuFilter);
            return yield RNPayments.loadProducts(validProducts);
        });
    }
    availableAppStore() {
        return IOSBridge.isAppStoreAvailable() ? type_1.AppStore.APPLE : type_1.AppStore.UNKNOWN;
    }
    purchase(product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RNPayments.purchaseProduct(product);
        });
    }
    subscribe(product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RNPayments.purchaseProduct(product);
        });
    }
    upgrade(oldProducts, product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield RNPayments.purchaseProduct(product);
        });
    }
    loadOwnedPurchases() {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('loadOwnedPurchases: Not implemented on iOS');
            return [];
        });
    }
    restore() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield RNPayments.restore();
            if (Array.isArray(response) && response.length > 0) {
                response.sort((a, b) => b.transactionDate - a.transactionDate);
                return [response[0]];
            }
            return [];
        });
    }
}
exports.IOSBridge = IOSBridge;
//# sourceMappingURL=IOSBridge.js.map