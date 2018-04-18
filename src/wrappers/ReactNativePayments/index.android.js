import { NativeModules } from 'react-native';
import Q from 'q';
import base64 from '../../utils/base64';

const { InAppBillingBridge } = NativeModules;

function inAppBillingSafeOpen() {
  return InAppBillingBridge.close().then(() => InAppBillingBridge.open());
}

export default {
  /**
   * @param {[{googleId: string}]} list of products
   * @param {funcion} callback with (error, results)
   */
  loadProducts: (products, callback) => {
    const googleProducts = products.reduce((acc, i) => {
      if (i.googleId != null) {
        acc.push(i.googleId);
      }
      return acc;
    }, []);

    if (googleProducts.length === 0) {
      callback(null, []);
      return;
    }

    inAppBillingSafeOpen()
      .then(() =>
        Q.all([
          InAppBillingBridge.getProductDetails(googleProducts),
          InAppBillingBridge.getSubscriptionDetails(googleProducts),
        ]))
      .then((details) => {
        callback(null, [].concat.apply([], details));
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {googleId: string} product which is to be purchased
   * @param {string} the developer payload to be signed by google
   * @param {funcion} callback with (error, results)
   */
  purchase: (product, developerPayload, callback) => {
    inAppBillingSafeOpen()
      .then(() => InAppBillingBridge.purchase(product.googleId, developerPayload))
      .then((success) => {
        if (success) {
          return InAppBillingBridge.loadOwnedPurchasesFromGoogle();
        }
        throw new Error('Purchase was unsuccessful, please try again');
      })
      .then(() => InAppBillingBridge.getPurchaseTransactionDetails(product.googleId))
      .then((details) => {
        const payload = {
          productIdentifier: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken,
        };
        callback(null, payload);
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {googleId: string} product which is to be subscribed to
   * @param {string} the developer payload to be signed by google
   * @param {funcion} callback with (error, results)
   */
  subscribe(product, developerPayload, callback) {
    inAppBillingSafeOpen()
      .then(() => InAppBillingBridge.subscribe(product.googleId, developerPayload))
      .then((success) => {
        if (success) {
          return InAppBillingBridge.loadOwnedPurchasesFromGoogle();
        }
        throw new Error('Subscription was unsuccessful, please try again');
      })
      .then(() => InAppBillingBridge.getSubscriptionTransactionDetails(product.googleId))
      .then((details) => {
        const payload = {
          productIdentifier: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken,
        };
        callback(null, payload);
        InAppBillingBridge.close();
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {[{googleId: string}]} list of old products which are to be removed
   * @param {googleId: string} product which is to be subscribed to
   * @param {funcion} callback with (error, results)
   */
  upgrade: (oldProducts, product, developerPayload, callback) => {
    inAppBillingSafeOpen()
      .then(() =>
        InAppBillingBridge.updateSubscription(
          oldProducts.map(p => p.googleId),
          product.googleId,
          developerPayload,
        ))
      .then((success) => {
        if (success) {
          return InAppBillingBridge.loadOwnedPurchasesFromGoogle();
        }
        throw new Error('Subscription was unsuccessful, please try again');
      })
      .then(() => InAppBillingBridge.getSubscriptionTransactionDetails(product.googleId))

      .then((details) => {
        callback(null, { product, ...details });
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {googleId: string} product which is to be consumed
   * @param {funcion} callback with (error, results)
   */
  consume: (product, callback) => {
    inAppBillingSafeOpen()
      .then(() => InAppBillingBridge.consumePurchase(product.googleId))
      .then((details) => {
        callback(null, { product, ...details });
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {funcion} callback with (error, results)
   * @returns {[products, subscriptions]} returns an array containing 2 items.
   * The first is an array of products owned. The second is an array of
   * owned subscriptions
   */
  loadOwnedPurchases: (callback) => {
    inAppBillingSafeOpen()
      .then(() => InAppBillingBridge.loadOwnedPurchasesFromGoogle())
      .then(() =>
        Q.all([
          InAppBillingBridge.listOwnedProducts(),
          InAppBillingBridge.listOwnedSubscriptions(),
        ]))
      .then(ownedLists => callback(null, ownedLists))
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  /**
   * @param {funcion} callback with (error, results)
   */
  restore: (callback) => {
    inAppBillingSafeOpen()
      .then(() => InAppBillingBridge.loadOwnedPurchasesFromGoogle())
      .then(() =>
        Q.all([
          InAppBillingBridge.listOwnedProducts(),
          InAppBillingBridge.listOwnedSubscriptions(),
        ]))
      .then((ownedLists) => {
        const [products, subscriptions] = ownedLists;
        let transactions = [];
        if (Array.isArray(products) && products.length > 0) {
          const productTransactions = products.map(p =>
            InAppBillingBridge.getPurchaseTransactionDetails(p));
          transactions = transactions.concat(productTransactions);
        }
        if (Array.isArray(subscriptions) && subscriptions.length > 0) {
          const subscriptionTransactions = subscriptions.map(s =>
            InAppBillingBridge.getSubscriptionTransactionDetails(s));
          transactions = transactions.concat(subscriptionTransactions);
        }
        return Q.all(transactions);
      })
      .then((transactions) => {
        const payload = transactions.map(t => ({
          productIdentifier: t.productId,
          appReceipt: base64.btoa(JSON.stringify(t)),
          transactionDate: t.purchaseTime,
          transactionIdentifier: t.purchaseToken,
        }));
        callback(null, payload);
      })
      .catch(callback)
      .finally(() => InAppBillingBridge.close());
  },
  eventEmitter: {
    addListener: () => {
      console.warn('eventEmitter.addListener: Not implemented on Android');
    },
    remove: () => {
      console.warn('eventEmitter.addListener: Not implemented on Android');
    },
  },
  name: 'index.android.js',
};
