export declare type TBase64 = string;
export declare type TId = string;
export declare type TProductId = string;
export interface IProduct {
    id: string;
    description: string;
    title: string;
    priceString: string;
    currencyCode: string;
}
export interface ITransaction {
    id: TId;
    productId: TProductId;
    transactionDate: string;
}
export interface ITransactionApple extends ITransaction {
    appReceipt: TBase64;
}
export interface ITransactionGoogle extends ITransaction {
    appReceipt: TBase64;
}
export interface ITransactionAmazon extends ITransaction {
    userId: string;
}
export declare function isTransactionApple(t: ITransaction): t is ITransactionApple;
export declare function isTransactionGoogle(t: ITransaction): t is ITransactionGoogle;
export declare function isTransactionAmazon(t: ITransaction): t is ITransactionAmazon;
export declare enum AppStore {
    APPLE = 0,
    AMAZON = 1,
    GOOGLE = 2,
    UNKNOWN = 3
}
export interface ITransactionNativeGoogle {
    receiptData: string;
    receiptSignature?: string;
    purchaseDate: any;
    productId: string;
    orderId: string;
    purchaseToken: string;
    purchaseTime: string;
    purchaseState: string;
    developerPayload?: string;
}
