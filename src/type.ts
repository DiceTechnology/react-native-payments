interface ITransactionAndroid {
  productId: string;
  purchaseTime: string;
  purchaseToken: string;
}

type TBase64 = string;
type TId = string;
type TProductId = string;

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
