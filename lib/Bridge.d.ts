import { IProduct, ITransaction, TProductId } from './type';
export interface IBridge {
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    subscribe(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<ITransaction>;
    loadOwnedPurchases(): Promise<any>;
    restore(): Promise<any>;
}
