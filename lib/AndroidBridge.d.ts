import { IBridge } from './Bridge';
export declare class AndroidBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    loadProducts(productIds: TProductId[]): Promise<IProduct[]>;
    purchase(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    subscribe(productId: TProductId, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProductIds: TProductId[], productId: TProductId, developerPayload: string): Promise<any>;
    consume(productId: TProductId): Promise<any>;
    loadOwnedPurchases(): Promise<any[]>;
    restore(): Promise<{
        productIdentifier: string;
        appReceipt: string;
        transactionDate: string;
        transactionIdentifier: string;
    }[]>;
    private static open;
}
