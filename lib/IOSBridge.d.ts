import { IBridge } from './Bridge';
import { IProduct, ITransaction, TProductId } from './type';
export declare class IOSBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    loadProducts(products: TProductId[]): Promise<IProduct[]>;
    purchase(product: TProductId, developerPayload: string): Promise<ITransaction>;
    subscribe(product: TProductId, developerPayload: string): Promise<ITransaction>;
    upgrade(oldProducts: TProductId[], product: TProductId, developerPayload: string): Promise<any>;
    loadOwnedPurchases(): Promise<never[]>;
    restore(): Promise<any[]>;
}
