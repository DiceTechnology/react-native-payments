"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
class UnimplementedBridge {
    availableAppStore() {
        return type_1.AppStore.UNKNOWN;
    }
    loadOwnedPurchases() {
        return Promise.reject('loadOwnedPurchases: NOT IMPLEMENTED');
    }
    loadProducts(productIds) {
        return Promise.reject('loadProducts: NOT IMPLEMENTED');
    }
    purchase(productId, developerPayload) {
        return Promise.reject('purchase: NOT IMPLEMENTED');
    }
    restore() {
        return Promise.reject('restore: NOT IMPLEMENTED');
    }
    subscribe(productId, developerPayload) {
        return Promise.reject('subscribe: NOT IMPLEMENTED');
    }
    upgrade(oldProductIds, productId, developerPayload) {
        return Promise.reject('upgrade: NOT IMPLEMENTED');
    }
}
exports.UnimplementedBridge = UnimplementedBridge;
//# sourceMappingURL=Bridge.js.map