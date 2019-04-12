import { IBridge } from './Bridge';
import { IProduct, ITransaction, TProductId } from './type';
export declare class AndroidBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    subscribe(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<ITransaction>;
    consume(productId: TProductId): Promise<any>;
    loadOwnedPurchases(): Promise<any[]>;
    restore(): Promise<ITransaction[]>;
    private static open;
}
