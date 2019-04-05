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
const { RNPayments } = react_native_1.NativeModules;
class AndroidBridge {
    constructor() {
        this.eventEmitter = new react_native_1.NativeEventEmitter(RNPayments);
    }
    loadProducts(products) {
        return __awaiter(this, void 0, void 0, function* () {
            const googleProducts = products.reduce((acc, i) => {
                if (i.googleId != null) {
                    acc.push(i.googleId);
                }
                return acc;
            }, []);
            if (googleProducts.length === 0) {
                return [];
            }
            try {
                yield AndroidBridge.open();
                yield RNPayments.open();
                const details = yield Promise.all([
                    RNPayments.getProductDetails(googleProducts),
                    RNPayments.getSubscriptionDetails(googleProducts)
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
    purchase(product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                const success = yield RNPayments.purchase(product.googleId, developerPayload);
                if (success) {
                    yield RNPayments.loadOwnedPurchasesFromGoogle();
                    const details = yield RNPayments.loadOwnedPurchasesFromGoogle();
                    return {
                        productIdentifier: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        transactionIdentifier: details.purchaseToken
                    };
                }
                else {
                    throw new Error('Purchase was unsuccessful, please try again');
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
    subscribe(product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const success = yield RNPayments.subscribe(product.googleId, developerPayload);
                if (success) {
                    yield RNPayments.loadOwnedPurchasesFromGoogle();
                    const details = yield RNPayments.getSubscriptionTransactionDetails(product.googleId);
                    const payload = {
                        productIdentifier: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        transactionIdentifier: details.purchaseToken
                    };
                    return payload;
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
    upgrade(oldProducts, product, developerPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield AndroidBridge.open();
                const success = RNPayments.updateSubscription(oldProducts.map(p => p.googleId), product.googleId, developerPayload);
                if (success) {
                    yield RNPayments.loadOwnedPurchasesFromGoogle();
                    const details = yield RNPayments.getSubscriptionTransactionDetails(product.googleId);
                    const payload = {
                        productIdentifier: details.productId,
                        appReceipt: base64_1.default.btoa(JSON.stringify(details)),
                        transactionDate: details.purchaseTime,
                        transactionIdentifier: details.purchaseToken
                    };
                    return payload;
                }
                throw new Error('Subscription upgrade/downgrade was unsuccessful, please try again');
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    consume(product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield RNPayments.consumePurchase(product.googleId);
                return Object.assign({ product }, details);
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
                const ownedLists = [ownedProducts, ownedSubscriptions];
                return ownedLists;
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
                const payload = transactions.map(t => ({
                    productIdentifier: t.productId,
                    appReceipt: base64_1.default.btoa(JSON.stringify(t)),
                    transactionDate: t.purchaseTime,
                    transactionIdentifier: t.purchaseToken
                }));
                return payload;
            }
            finally {
                yield RNPayments.close();
            }
        });
    }
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield RNPayments.close();
            yield RNPayments.open();
        });
    }
}
exports.AndroidBridge = AndroidBridge;
//# sourceMappingURL=AndroidBridge.js.map