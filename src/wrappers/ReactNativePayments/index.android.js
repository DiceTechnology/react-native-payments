import { NativeModules } from 'react-native';

const { InAppBillingBridge } = NativeModules;


export default {
  loadProducts: (productIds, callback) => {
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.getProductDetails(productIds))
      .then((details) => {
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      })
  },
  purchase: (productId, developerPayload, callback) => {
    InAppBillingBridge.open()
      .then(() => InAppBillingBridge.purchase(productId, developerPayload))
      .then((details) => {
        callback(null, details);
        InAppBillingBridge.close();
      })
      .catch(e => {
        callback(e);
        InAppBillingBridge.close();
      });
  },
  subscribe(productId, developerPayload, callback) {
    return InAppBillingBridge.subscribe(productId, developerPayload);
    InAppBillingBridge.open()
    .then(() => InAppBillingBridge.subscribe(productId, developerPayload))
    .then((details) => {
      callback(null, details);
      InAppBillingBridge.close();
    })
    .catch(e => {
      callback(e);
      InAppBillingBridge.close();
    });
  },
};