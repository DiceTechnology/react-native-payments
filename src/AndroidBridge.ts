import { NativeEventEmitter, NativeModules } from 'react-native';
import base64 from './utils/base64';
import { IBridge } from './Bridge';
import {
  IProduct,
  ITransaction,
  ITransactionNativeAndroid,
  TProductId
} from './type';

const { RNPayments } = NativeModules;

export class AndroidBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  async loadProducts(productIds: TProductId[]): Promise<IProduct[]> {
    const validProductIds = productIds.filter(
      p => p !== null && p !== undefined
    );

    if (validProductIds.length === 0) {
      return [];
    }

    try {
      await AndroidBridge.open();
      const details = await Promise.all([
        RNPayments.getProductDetails(validProductIds),
        RNPayments.getSubscriptionDetails(validProductIds)
      ]);
      return [].concat.apply([], details);
    } catch (err) {
      throw err;
    } finally {
      await RNPayments.close();
    }
  }

  async purchase(
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction> {
    try {
      await AndroidBridge.open();
      let success = await RNPayments.purchase(productId, developerPayload);
      if (success) {
        success = await RNPayments.loadOwnedPurchasesFromGoogle();
      }
      if (success) {
        const details: ITransactionNativeAndroid = await RNPayments.getPurchaseTransactionDetails(
          productId
        );
        return {
          productId: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          id: details.purchaseToken
        };
      }

      throw new Error('Purchase was unsuccessful, please try again');
    } catch (err) {
      throw err;
    } finally {
      await RNPayments.close();
    }
  }

  async subscribe(
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction> {
    try {
      const success = await RNPayments.subscribe(productId, developerPayload);
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details: ITransactionNativeAndroid = await RNPayments.getSubscriptionTransactionDetails(
          productId
        );
        return {
          productId: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          id: details.purchaseToken
        };
      } else {
        throw new Error('Subscription was unsuccessful, please try again');
      }
    } catch (err) {
      throw err;
    } finally {
      await RNPayments.close();
    }
  }

  async upgrade(
    oldProductIds: TProductId[],
    productId: TProductId,
    developerPayload: string
  ): Promise<ITransaction> {
    try {
      await AndroidBridge.open();
      const success = RNPayments.updateSubscription(
        oldProductIds,
        productId,
        developerPayload
      );
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details: ITransactionNativeAndroid = await RNPayments.getSubscriptionTransactionDetails(
          productId
        );
        return {
          productId: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          id: details.purchaseToken
        };
      }
      throw new Error(
        'Subscription upgrade/downgrade was unsuccessful, please try again'
      );
    } finally {
      await RNPayments.close();
    }
  }

  async consume(productId: TProductId) {
    try {
      const details = await RNPayments.consumePurchase(productId);
      return { productId, ...details };
    } finally {
      await RNPayments.close();
    }
  }

  async loadOwnedPurchases() {
    try {
      await AndroidBridge.open();
      await RNPayments.loadOwnedPurchasesFromGoogle();
      const ownedProducts = await RNPayments.listOwnedProducts();
      const ownedSubscriptions = await RNPayments.listOwnedSubscriptions();
      return [ownedProducts, ownedSubscriptions];
    } finally {
      await RNPayments.close();
    }
  }

  async restore(): Promise<ITransaction[]> {
    try {
      await AndroidBridge.open();
      await RNPayments.loadOwnedPurchasesFromGoogle();
      const products = await RNPayments.listOwnedProducts();
      const subscriptions = await RNPayments.listOwnedSubscriptions();
      let transactionsRequest: Promise<ITransactionNativeAndroid>[] = [];
      if (Array.isArray(products) && products.length > 0) {
        const productTransactions: Promise<
          ITransactionNativeAndroid
        >[] = products.map(p => RNPayments.getPurchaseTransactionDetails(p));
        transactionsRequest = transactionsRequest.concat(productTransactions);
      }
      if (Array.isArray(subscriptions) && subscriptions.length > 0) {
        const subscriptionTransactions: Promise<
          ITransactionNativeAndroid
        >[] = subscriptions.map(s =>
          RNPayments.getSubscriptionTransactionDetails(s)
        );
        transactionsRequest = transactionsRequest.concat(
          subscriptionTransactions
        );
      }
      const transactions: ITransactionNativeAndroid[] = await Promise.all(
        transactionsRequest
      );
      return transactions.map(t => ({
        productId: t.productId,
        appReceipt: base64.btoa(JSON.stringify(t)),
        transactionDate: t.purchaseDate,
        id: t.purchaseToken
      }));
    } finally {
      await RNPayments.close();
    }
  }

  private static async open() {
    await RNPayments.close();
    await RNPayments.open();
  }
}
