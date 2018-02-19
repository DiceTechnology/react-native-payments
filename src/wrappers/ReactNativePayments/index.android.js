import { NativeModules } from 'react-native';
import Q from 'q';
import base64 from '../../utils/base64';

const { InAppBillingBridge } = NativeModules;


export default {
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

    InAppBillingBridge.close();
    InAppBillingBridge.open()
      .then(() => Q.all([
        InAppBillingBridge.getProductDetails(googleProducts),
        InAppBillingBridge.getSubscriptionDetails(googleProducts),
      ]))
      .then((details) => {
        callback(null, [].concat.apply([], details));
        InAppBillingBridge.close();
      })
      .catch((e) => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  purchase: (product, developerPayload = null, callback) => {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
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
        InAppBillingBridge.close();
      })
      .catch((e) => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  subscribe(product, developerPayload = null, callback) {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
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
      .catch((e) => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  consume: (product, callback) => {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.consumePurchase(product.googleId))
      .then((details) => {
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch((e) => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  restore: ((callback) => {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.loadOwnedPurchasesFromGoogle())
      .then(() => Q.all([
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
        }))
        callback(null, payload);
        InAppBillingBridge.close();
      })
      .catch((e) => {
        callback(e);
        InAppBillingBridge.close();
      });
  }),
  name: 'index.android.js',
};
