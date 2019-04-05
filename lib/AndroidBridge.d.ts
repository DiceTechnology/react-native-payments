import { IBridge } from './Bridge';
export declare class AndroidBridge implements IBridge {
    eventEmitter: import("react-native").EventEmitter;
    loadProducts(products: IProduct[]): Promise<any>;
    purchase(product: IProduct, developerPayload: string): Promise<{
        productIdentifier: any;
        appReceipt: string;
        transactionDate: any;
        transactionIdentifier: any;
    }>;
    subscribe(product: IProduct, developerPayload: string): Promise<{
        productIdentifier: any;
        appReceipt: string;
        transactionDate: any;
        transactionIdentifier: any;
    }>;
    upgrade(oldProducts: IProduct[], product: IProduct, developerPayload: string): Promise<any>;
    consume(product: IProduct): Promise<any>;
    loadOwnedPurchases(): Promise<any[]>;
    restore(): Promise<{
        productIdentifier: string;
        appReceipt: string;
        transactionDate: string;
        transactionIdentifier: string;
    }[]>;
    private static open;
}
