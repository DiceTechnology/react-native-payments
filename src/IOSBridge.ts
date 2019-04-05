import { NativeEventEmitter, NativeModules } from 'react-native';
import { IBridge } from './Bridge';

const { RNPayments } = NativeModules;

export class IOSBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  async loadProducts(products: IProduct[]) {
    const appleProducts = products.reduce(
      (acc, i) => {
        if (i.appleId != null) {
          acc.push(i.appleId);
        }
        return acc;
      },
      [] as string[]
    );
    return await RNPayments.loadProducts(appleProducts);
  }

  async purchase(product: IProduct, developerPayload: string) {
    return await RNPayments.purchaseProduct(product.appleId);
  }

  async subscribe(product: IProduct, developerPayload: string) {
    return await RNPayments.purchaseProduct(product.appleId);
  }

  async upgrade(
    oldProducts: IProduct[],
    product: IProduct,
    developerPayload: string
  ) {
    return await RNPayments.purchaseProduct(product.appleId);
  }

  async loadOwnedPurchases() {
    console.warn('loadOwnedPurchases: Not implemented on iOS');
    return [];
  }

  async restore() {
    const response = await RNPayments.restorePurchases();
    if (Array.isArray(response) && response.length > 0) {
      response.sort((a, b) => b.transactionDate - a.transactionDate);
      return [response[0]];
    }
    return [];
  }
}
