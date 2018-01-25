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

    InAppBillingBridge.open()
      .then(() => {
        return Q.all([
          InAppBillingBridge.getProductDetails(googleProducts),
          InAppBillingBridge.getSubscriptionDetails(googleProducts),
        ]);
      })
      .then((details) => {
        console.log(arguments);
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      })
  },
  purchase: (product, callback, developerPayload = null) => {
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.purchase(product.googleId, developerPayload))
      .then((details) => {
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  subscribe(product, callback, developerPayload = null) {
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.subscribe(product.googleId, developerPayload))
      .then((details) => {
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