import { IBridge } from './Bridge';
import { AppStore, IProduct, ITransactionGoogle, TProductId } from './type';
export declare class AndroidBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    static isAppStoreAvailable(): boolean;
    private static open;
    availableAppStore(): AppStore;
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: TProductId, developerPayload: string): Promise<ITransactionGoogle>;
    subscribe(productId: TProductId, developerPayload: string): Promise<ITransactionGoogle>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<ITransactionGoogle>;
    consume(productId: TProductId): Promise<any>;
    loadOwnedPurchases(): Promise<any[]>;
    restore(): Promise<ITransactionGoogle[]>;
}
