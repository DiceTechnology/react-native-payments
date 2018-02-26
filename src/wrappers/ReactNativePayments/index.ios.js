import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPayments } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPayments);

export default {
  // callback(error, result)
  loadProducts: (products, callback) => {
    const appleProducts = products.reduce((acc, i) => {
      if (i.appleId != null) {
        acc.push(i.appleId);
      }
      return acc;
    }, []);
    RNPayments.loadProducts(appleProducts, callback);
  },
  // callback(error, result)
  purchase: (product, developerPayload, callback) => {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  // callback(error, result)
  subscribe(product, developerPayload, callback) {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  // callback(error, result)
  restore: (callback) => {
    RNPayments.restorePurchases((err, response) => {
      if (err) {
        callback(err);
      } else if (Array.isArray(response) && response.length > 0) {
        response.sort((a, b) => b.transactionDate - a.transactionDate);
        callback(null, [response[0]]);
      } else {
        callback(null, []);
      }
    });
  },
  eventEmitter,
  name: 'index.ios.js',
};
