import { AppStore, IProduct, ITransaction, TProductId } from './type';

export interface IBridge {
  loadProducts(productIds: TProductId[]): Promise<IProduct[]>;

  purchase(
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction>;

  subscribe(
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction>;

  upgrade(
    oldProductIds: TProductId[],
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction>;

  loadOwnedPurchases(): Promise<any>;

  restore(): Promise<any>;

  availableAppStore(): AppStore;
}

export class UnimplementedBridge implements IBridge {
  availableAppStore(): AppStore {
    return AppStore.UNKNOWN;
  }

  loadOwnedPurchases(): Promise<any> {
    return Promise.reject('loadOwnedPurchases: NOT IMPLEMENTED');
  }

  loadProducts(productIds: TProductId[]): Promise<IProduct[]> {
    return Promise.reject('loadProducts: NOT IMPLEMENTED');
  }

  purchase(productId: string, developerPayload: string): Promise<ITransaction> {
    return Promise.reject('purchase: NOT IMPLEMENTED');
  }

  restore(): Promise<any> {
    return Promise.reject('restore: NOT IMPLEMENTED');
  }

  subscribe(
    productId: string,
    developerPayload: string
  ): Promise<ITransaction> {
    return Promise.reject('subscribe: NOT IMPLEMENTED');
  }

  upgrade(
    oldProductIds: TProductId[],
    productId: string,
    developerPayload: string
  ): Promise<ITransaction> {
    return Promise.reject('upgrade: NOT IMPLEMENTED');
  }
}
