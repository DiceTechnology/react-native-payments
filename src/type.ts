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

export function isTransactionApple(t: ITransaction): t is ITransactionApple {
  return (t as ITransactionApple).appReceipt !== undefined;
}

export function isTransactionGoogle(t: ITransaction): t is ITransactionGoogle {
  return (t as ITransactionGoogle).appReceipt !== undefined;
}

export function isTransactionAmazon(t: ITransaction): t is ITransactionAmazon {
  return (t as ITransactionAmazon).userId !== undefined;
}

export enum AppStore {
  APPLE,
  AMAZON,
  GOOGLE,
  UNKNOWN
}

/**
 * Used internally
 */
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
