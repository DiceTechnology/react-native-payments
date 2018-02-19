import { NativeModules } from 'react-native';

const { RNPayments } = NativeModules;

export default {
  loadProducts: (products, callback) => {
    const appleProducts = products.reduce((acc, i) => {
      if (i.appleId != null) {
        acc.push(i.appleId);
      }
      return acc;
    }, []);
    RNPayments.loadProducts(appleProducts, callback);
  },
  purchase: (product, developerPayload, callback) => {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  subscribe(product, developerPayload, callback) {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  restore: ((callback) => {
    RNPayments.restorePurchases((err, response) => {
      if (err) {
        callback(err);
      } else {
        if (Array.isArray(response) && response.length > 0) {
          response.sort((a, b) => b.transactionDate - a.transactionDate);
          callback(null, response[0]);
        } else {
          callback(null, []);
        }
      }
    });
  }),
  name: 'index.ios.js',
};
