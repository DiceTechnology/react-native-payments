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
const base64_1 = require("./utils/base64");
const type_1 = require("./type");
const { RNPaymentsGoogleModule: RNPayments } = react_native_1.NativeModules;
class AndroidBridge {
    constructor() {
        this.eventEmitter = new react_native_1.NativeEventEmitter(RNPayments);
    }
    static isAppStoreAvailable() {
        return RNPayments && !!RNPayments.APP_STORE_AVAILABLE;
    }
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield RNPayments.close();
            yield RNPayments.open();
        });
    }
    availableAppStore() {
        return AndroidBridge.isAppStoreAvailable()
            ? type_1.AppStore.GOOGLE
            : type_1.AppStore.UNKNOWN;
    }
    loadProducts(productIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const validProductIds = productIds.filter(p => p !== null && p !== undefined);
            if (validProductIds.length === 0) {
                return [];
            }
            try {
                yield AndroidBridge.open();
                const details = yield Promise.all([
                    RNPayments.getProductDetails(validProductIds),
                    RNPayments.getSubscriptionDetails(validProductIds)
                ]);
                return [].concat.apply([], details);
            }
            catch (err) {
                throw err;
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    purchase(productId, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                let success = yield RNPayments.purchase(productId, developerPayload);
                if (success) {
                    success = yield RNPayments.loadOwnedPurchasesFromGoogle();
                }
                if (success) {
                    const details = yield RNPayments.getPurchaseTransactionDetails(productId);
                    return {
                        productId: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        id: details.purchaseToken
                    };
                }
                throw new Error('Purchase was unsuccessful, please try again');
            }
            catch (err) {
                throw err;
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    subscribe(productId, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                const success = yield RNPayments.subscribe(productId, developerPayload);
                if (success) {
                    yield RNPayments.loadOwnedPurchasesFromGoogle();
                    const details = yield RNPayments.getSubscriptionTransactionDetails(productId);
                    return {
                        productId: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        id: details.purchaseToken
                    };
                }
                else {
                    throw new Error('Subscription was unsuccessful, please try again');
                }
            }
            catch (err) {
                throw err;
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    upgrade(oldProductIds, productId, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                const success = yield RNPayments.updateSubscription(oldProductIds, productId, developerPayload);
                if (success) {
                    yield RNPayments.loadOwnedPurchasesFromGoogle();
                    const details = yield RNPayments.getSubscriptionTransactionDetails(productId);
                    return {
                        productId: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        id: details.purchaseToken
                    };
                }
                throw new Error('Subscription upgrade/downgrade was unsuccessful, please try again');
            }
            catch (err) {
                throw err;
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    consume(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield RNPayments.consumePurchase(productId);
                return Object.assign({ productId }, details);
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    loadOwnedPurchases() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                yield RNPayments.loadOwnedPurchasesFromGoogle();
                const ownedProducts = yield RNPayments.listOwnedProducts();
                const ownedSubscriptions = yield RNPayments.listOwnedSubscriptions();
                return [ownedProducts, ownedSubscriptions];
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    restore() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                yield RNPayments.loadOwnedPurchasesFromGoogle();
                const products = yield RNPayments.listOwnedProducts();
                const subscriptions = yield RNPayments.listOwnedSubscriptions();
                let transactionsRequest = [];
                if (Array.isArray(products) && products.length > 0) {
                    const productTransactions = products.map(p => RNPayments.getPurchaseTransactionDetails(p));
                    transactionsRequest = transactionsRequest.concat(productTransactions);
                }
                if (Array.isArray(subscriptions) && subscriptions.length > 0) {
                    const subscriptionTransactions = subscriptions.map(s => RNPayments.getSubscriptionTransactionDetails(s));
                    transactionsRequest = transactionsRequest.concat(subscriptionTransactions);
                }
                const transactions = yield Promise.all(transactionsRequest);
                return transactions.map(t => ({
                    productId: t.productId,
                    appReceipt: base64_1.default.btoa(JSON.stringify(t)),
                    transactionDate: t.purchaseDate,
                    id: t.purchaseToken
                }));
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
}
exports.AndroidBridge = AndroidBridge;
//# sourceMappingURL=AndroidBridge.js.map