"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("./type");
class UnimplementedBridge {
    availableAppStore() {
        return type_1.AppStore.UNKNOWN;
    }
    loadOwnedPurchases() {
        return Promise.reject('NOT IMPLEMENTED');
    }
    loadProducts(productIds) {
        return Promise.reject('NOT IMPLEMENTED');
    }
    purchase(productId, developerPayload) {
        return Promise.reject('NOT IMPLEMENTED');
    }
    restore() {
        return Promise.reject('NOT IMPLEMENTED');
    }
    subscribe(productId, developerPayload) {
        return Promise.reject('NOT IMPLEMENTED');
    }
    upgrade(oldProductIds, productId, developerPayload) {
        return Promise.reject('NOT IMPLEMENTED');
    }
}
exports.UnimplementedBridge = UnimplementedBridge;
//# sourceMappingURL=Bridge.js.map