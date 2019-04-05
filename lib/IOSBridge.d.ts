import { IBridge } from './Bridge';
export declare class IOSBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    loadProducts(products: IProduct[]): Promise<any>;
    purchase(product: IProduct, developerPayload: string): Promise<any>;
    subscribe(product: IProduct, developerPayload: string): Promise<any>;
    upgrade(oldProducts: IProduct[], product: IProduct, developerPayload: string): Promise<any>;
    loadOwnedPurchases(): Promise<never[]>;
    restore(): Promise<any[]>;
}
