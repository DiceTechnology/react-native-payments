import { NativeEventEmitter, NativeModules } from 'react-native';
import { IBridge } from './Bridge';
import {
  AppStore,
  IProduct,
  ITransactionApple,
  TProductId
} from './type';
import { licenceSkuFilter } from './utils';

const { RNPayments } = NativeModules;

export class IOSBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  public static isAppStoreAvailable(): boolean {
    return !!RNPayments;
  }

  async loadProducts(products: TProductId[]): Promise<IProduct[]> {
    const validProducts = products.filter(licenceSkuFilter);
    return await RNPayments.loadProducts(validProducts);
  }

  availableAppStore(): AppStore {
    return IOSBridge.isAppStoreAvailable() ? AppStore.APPLE : AppStore.UNKNOWN;
  }

  async purchase(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransactionApple> {
    return await RNPayments.purchaseProduct(product);
  }

  async subscribe(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransactionApple> {
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

  async restore(): Promise<ITransactionApple[]> {
    const response = await RNPayments.restore();
    if (Array.isArray(response) && response.length > 0) {
      response.sort((a, b) => b.transactionDate - a.transactionDate);
      return [response[0]];
    }
    return [];
  }
}
