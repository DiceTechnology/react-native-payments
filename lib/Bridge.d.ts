import { AppStore, IProduct, ITransaction, TProductId } from './type';
export interface IBridge {
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    subscribe(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<ITransaction>;
    loadOwnedPurchases(): Promise<any>;
    restore(): Promise<any>;
    availableAppStore(): AppStore;
}
export declare class UnimplementedBridge implements IBridge {
    availableAppStore(): AppStore;
    loadOwnedPurchases(): Promise<any>;
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: string, developerPayload: string): Promise<ITransaction>;
    restore(): Promise<any>;
    subscribe(productId: string, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProductIds: TProductId[], productId: string, developerPayload: string): Promise<ITransaction>;
}
