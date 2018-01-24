import { NativeModules } from 'react-native';

const { RNPayments } = NativeModules;

export default {
  loadProducts: RNPayments.loadProducts,
  purchase: (productId, developerPayload, callback) => {
    RNPayments.purchaseProduct(productId, callback);
  },
  subscribe(productId, developerPayload, callback) {
    RNPayments.purchaseProduct(productId, callback);
  },
}