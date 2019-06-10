import { IBridge } from './Bridge';
import { AppStore, IProduct, ITransactionAmazon, TProductId } from './type';
export declare class AmazonBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    static isAppStoreAvailable(): boolean;
    availableAppStore(): AppStore;
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(product: TProductId, developerPayload: string): Promise<ITransactionAmazon>;
    subscribe(product: TProductId, developerPayload: string): Promise<ITransactionAmazon>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<ITransactionAmazon>;
    consume(productId: TProductId): Promise<void>;
    loadOwnedPurchases(): Promise<never[]>;
    restore(): Promise<ITransactionAmazon[]>;
}
