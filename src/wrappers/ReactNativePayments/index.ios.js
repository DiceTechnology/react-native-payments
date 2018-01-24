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
  purchase: (productId, developerPayload, callback) => {
    RNPayments.purchaseProduct(productId, callback);
  },
  subscribe(productId, developerPayload, callback) {
    RNPayments.purchaseProduct(productId, callback);
  },
  name: 'index.ios.js',
}