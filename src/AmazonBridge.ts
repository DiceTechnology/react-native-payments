import { NativeEventEmitter, NativeModules } from 'react-native';
import { IBridge } from './Bridge';
import { AppStore, IProduct, ITransactionAmazon, TProductId } from './type';

const { RNPaymentsAmazonModule: RNPayments } = NativeModules;

export class AmazonBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  public static isAppStoreAvailable(): boolean {
    return RNPayments && !!RNPayments.APP_STORE_AVAILABLE;
  }

  availableAppStore(): AppStore {
    return AmazonBridge.isAppStoreAvailable()
      ? AppStore.AMAZON
      : AppStore.UNKNOWN;
  }

  async loadProducts(productIds: TProductId[]): Promise<IProduct[]> {
    const validProducts = productIds.filter(p => p !== null && p !== undefined);
    return await RNPayments.loadProducts(validProducts);
  }

  async purchase(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransactionAmazon> {
    return await RNPayments.purchaseProduct(product);
  }

  async subscribe(
    product: TProductId,
    developerPayload: string
  ): Promise<ITransactionAmazon> {
    return await RNPayments.purchaseProduct(product);
  }

  async upgrade(
    oldProductIds: TProductId[],
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransactionAmazon> {
    throw new Error('Subscription upgrade/downgrade not implemented');
  }

  async consume(productId: TProductId) {}

  async loadOwnedPurchases() {
    console.warn('loadOwnedPurchases: Not implemented on Amazon');
    return [];
  }

  async restore(): Promise<ITransactionAmazon[]> {
    return RNPayments.restore();
  }
}
