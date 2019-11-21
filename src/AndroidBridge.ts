import { NativeEventEmitter, NativeModules } from 'react-native';
import base64 from './utils/base64';
import { IBridge } from './Bridge';
import {
  AppStore,
  IProduct,
  ITransactionGoogle,
  ITransactionNativeGoogle,
  TProductId
} from './type';
import { licenceSkuFilter } from './utils';

const { RNPaymentsGoogleModule: RNPayments } = NativeModules;

export class AndroidBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  public static isAppStoreAvailable(): boolean {
    return RNPayments && !!RNPayments.APP_STORE_AVAILABLE;
  }

  private static async open() {
    await RNPayments.close();
    await RNPayments.open();
  }

  availableAppStore(): AppStore {
    return AndroidBridge.isAppStoreAvailable()
      ? AppStore.GOOGLE
      : AppStore.UNKNOWN;
  }

  async loadProducts(productIds: TProductId[]): Promise<IProduct[]> {
    const validProductIds = productIds.filter(licenceSkuFilter);

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
  ): Promise<ITransactionGoogle> {
    try {
      await AndroidBridge.open();
      let success = await RNPayments.purchase(productId, developerPayload);
      if (success) {
        success = await RNPayments.loadOwnedPurchasesFromGoogle();
      }
      if (success) {
        const details: ITransactionNativeGoogle = await RNPayments.getPurchaseTransactionDetails(
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
  ): Promise<ITransactionGoogle> {
    try {
      await AndroidBridge.open();
      const success = await RNPayments.subscribe(productId, developerPayload);
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details: ITransactionNativeGoogle = await RNPayments.getSubscriptionTransactionDetails(
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
  ): Promise<ITransactionGoogle> {
    try {
      await AndroidBridge.open();
      const success = await RNPayments.updateSubscription(
        oldProductIds,
        productId,
        developerPayload
      );
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details: ITransactionNativeGoogle = await RNPayments.getSubscriptionTransactionDetails(
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
    } catch (err) {
      throw err;
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

  async restore(): Promise<ITransactionGoogle[]> {
    try {
      await AndroidBridge.open();
      await RNPayments.loadOwnedPurchasesFromGoogle();
      const products = await RNPayments.listOwnedProducts();
      const subscriptions = await RNPayments.listOwnedSubscriptions();
      let transactionsRequest: Promise<ITransactionNativeGoogle>[] = [];
      if (Array.isArray(products) && products.length > 0) {
        const productTransactions: Promise<
          ITransactionNativeGoogle
        >[] = products.map(p => RNPayments.getPurchaseTransactionDetails(p));
        transactionsRequest = transactionsRequest.concat(productTransactions);
      }
      if (Array.isArray(subscriptions) && subscriptions.length > 0) {
        const subscriptionTransactions: Promise<
          ITransactionNativeGoogle
        >[] = subscriptions.map(s =>
          RNPayments.getSubscriptionTransactionDetails(s)
        );
        transactionsRequest = transactionsRequest.concat(
          subscriptionTransactions
        );
      }
      const transactions: ITransactionNativeGoogle[] = await Promise.all(
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
}
