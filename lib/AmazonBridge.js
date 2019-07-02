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
const { RNPaymentsAmazonModule: RNPayments } = react_native_1.NativeModules;
class AmazonBridge {
    constructor() {
        this.eventEmitter = new react_native_1.NativeEventEmitter(RNPayments);
    }
    static isAppStoreAvailable() {
        return RNPayments && !!RNPayments.APP_STORE_AVAILABLE;
    }
    availableAppStore() {
        return AmazonBridge.isAppStoreAvailable()
            ? type_1.AppStore.AMAZON
            : type_1.AppStore.UNKNOWN;
    }
    loadProducts(productIds) {
        return __awaiter(this, void 0, void 0, function* () {
            if (productIds && productIds.length > 0) {
                const validProducts = productIds.filter(p => p !== null && p !== undefined);
                return yield RNPayments.loadProducts(validProducts);
            }
            return [];
        });
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
    consume(productId) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    loadOwnedPurchases() {
        return __awaiter(this, void 0, void 0, function* () {
            console.warn('loadOwnedPurchases: Not implemented on Amazon');
            return [];
        });
    }
    restore() {
        return __awaiter(this, void 0, void 0, function* () {
            return RNPayments.restore();
        });
    }
}
exports.AmazonBridge = AmazonBridge;
//# sourceMappingURL=AmazonBridge.js.map