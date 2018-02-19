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
    RNPayments.restorePurchases(callback);
  }),
  name: 'index.ios.js',
};
