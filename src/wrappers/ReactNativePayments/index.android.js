import { NativeModules } from 'react-native';
import Q from 'q';

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
      .then(() => {
        return Q.all([
          InAppBillingBridge.getProductDetails(googleProducts),
          InAppBillingBridge.getSubscriptionDetails(googleProducts),
        ]);
      })
      .then((details) => {
        callback(null, [].concat.apply([], details));
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      })
  },
  purchase: (product, developerPayload = null, callback) => {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.purchase(product.googleId, developerPayload))
      .then((success) => {
        if (success) {
          return InAppBillingBridge.loadOwnedPurchasesFromGoogle();
        } else {
          throw new Error('Purchase was unsuccessful, please try again');
        }
      })
      .then(() => InAppBillingBridge.getPurchaseTransactionDetails(product.googleId))
      .then((details) =>{
        const payload = {
          productIdentifier: details.productId,
          appReceipt: btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken,
        };
        callback(null, payload);
        InAppBillingBridge.close();
      })
      .catch(e => {
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
          return InAppBillingBridge.getSubscriptionTransactionDetails(product.googleId);
        } else {
          throw new Error('Subscription was unsuccessful, please try again');
        }
      })
      .then((details) =>{
        const payload = {
          productIdentifier: details.productId,
          appReceipt: btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken,
        };
        callback(null, payload);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  consume: (product, callback) => {
    InAppBillingBridge.close();
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.consumePurchase(product.googleId))
      .then((details) =>{
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  name: 'index.android.js',
};
