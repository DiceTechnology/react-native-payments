import { NativeEventEmitter, NativeModules } from 'react-native';

const { RNPayments } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNPayments);

export default {
  /**
   * @param {[{appleId: string}]} list of products
   * @param {funcion} callback with (error, results)
   */
  loadProducts: (products, callback) => {
    const appleProducts = products.reduce((acc, i) => {
      if (i.appleId != null) {
        acc.push(i.appleId);
      }
      return acc;
    }, []);
    RNPayments.loadProducts(appleProducts, callback);
  },
  /**
   * @param {appleId: string} product which is to be purchased
   * @param {string} the developer payload to be signed by google - ignored by apple
   * @param {funcion} callback with (error, results)
   */
  purchase: (product, developerPayload, callback) => {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  /**
   * @param {appleId: string} product which is to be subscribed to
   * @param {string} the developer payload to be signed by google - ignored by apple
   * @param {funcion} callback with (error, results)
   */
  subscribe(product, developerPayload, callback) {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  /**
   * @param {[{appleId: string}]} list of old products which are to be removed - ignored for apple
   * @param {appleId: string} product which is to be subscribed to
   * @param {funcion} callback with (error, results)
   */
  upgrade: (oldProducts, product, callback) => {
    RNPayments.purchaseProduct(product.appleId, callback);
  },
  /**
   * @param {funcion} callback with (error, results)
   * @returns {[products, subscriptions]} returns an array containing 2 items.
   * The first is an array of products owned. The second is an array of
   * owned subscriptions
   */
  loadOwnedPurchases: (callback) => {
    console.warn('loadOwnedPurchases: Not implemented on iOS');
    callback(null, [[], []]);
  },
  /**
   * @param {funcion} callback with (error, results)
   */
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
