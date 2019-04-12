import { NativeEventEmitter, NativeModules } from 'react-native';
import { IBridge } from './Bridge';
import { IProduct, ITransaction, TProductId } from './type';

const { RNPayments } = NativeModules;

export class IOSBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  async loadProducts(products: TProductId[]): Promise<IProduct[]> {
    const validProducts = products.filter(p => p !== null && p !== undefined);
    return await RNPayments.loadProducts(validProducts);
  }

  async purchase(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransaction> {
    return await RNPayments.purchaseProduct(product);
  }

  async subscribe(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransaction> {
    return await RNPayments.purchaseProduct(product);
  }

  async upgrade(
    oldProducts: TProductId[],
    product: TProductId,
    developerPayload: string
  ) {
    return await RNPayments.purchaseProduct(product);
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
