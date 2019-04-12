interface ITransactionAndroid {
    productId: string;
    purchaseTime: string;
    purchaseToken: string;
}
declare type TBase64 = string;
declare type TId = string;
declare type TProductId = string;
interface IProduct {
    id: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
}
interface ITransaction {
    id: TId;
    productId: TProductId;
    appReceipt: TBase64;
    transactionDate: number;
}
