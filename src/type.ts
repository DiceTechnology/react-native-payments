export type TBase64 = string;
export type TId = string;
export type TProductId = string;

export interface IProduct {
  id: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface ITransaction {
  id: TId;
  productId: TProductId;
  appReceipt: TBase64;
  transactionDate: string;
}

export interface ITransactionNativeAndroid {
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
