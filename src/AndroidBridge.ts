import { NativeEventEmitter, NativeModules } from 'react-native';
import base64 from './utils/base64';
import { IBridge } from './Bridge';

const { RNPayments } = NativeModules;

export class AndroidBridge implements IBridge {
  public eventEmitter = new NativeEventEmitter(RNPayments);

  async loadProducts(products: IProduct[]) {
    const googleProducts = products.reduce(
      (acc, i) => {
        if (i.googleId != null) {
          acc.push(i.googleId);
        }
        return acc;
      },
      [] as string[]
    );

    if (googleProducts.length === 0) {
      return [];
    }

    try {
      await AndroidBridge.open();
      await RNPayments.open();
      const details = await Promise.all([
        RNPayments.getProductDetails(googleProducts),
        RNPayments.getSubscriptionDetails(googleProducts)
      ]);
      return [].concat.apply([], details);
    } catch (err) {
      throw err;
    } finally {
      await RNPayments.close();
    }
  }

  async purchase(product: IProduct, developerPayload: string) {
    try {
      await AndroidBridge.open();
      const success = await RNPayments.purchase(
        product.googleId,
        developerPayload
      );
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details = await RNPayments.loadOwnedPurchasesFromGoogle();
        return {
          productIdentifier: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken
        };
      } else {
        throw new Error('Purchase was unsuccessful, please try again');
      }
    } catch (err) {
      throw err;
    } finally {
      await RNPayments.close();
    }
  }

  async subscribe(product: IProduct, developerPayload: string) {
    try {
      const success = await RNPayments.subscribe(
        product.googleId,
        developerPayload
      );
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details = await RNPayments.getSubscriptionTransactionDetails(
          product.googleId
        );
        const payload = {
          productIdentifier: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken
        };
        return payload;
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
    oldProducts: IProduct[],
    product: IProduct,
    developerPayload: string
  ) {
    try {
      await AndroidBridge.open();
      const success = RNPayments.updateSubscription(
        oldProducts.map(p => p.googleId),
        product.googleId,
        developerPayload
      );
      if (success) {
        await RNPayments.loadOwnedPurchasesFromGoogle();
        const details = await RNPayments.getSubscriptionTransactionDetails(
          product.googleId
        );
        const payload = {
          productIdentifier: details.productId,
          appReceipt: base64.btoa(JSON.stringify(details)),
          transactionDate: details.purchaseTime,
          transactionIdentifier: details.purchaseToken
        };
        return payload as any;
      }
      throw new Error(
        'Subscription upgrade/downgrade was unsuccessful, please try again'
      );
    } finally {
      await RNPayments.close();
    }
  }

  async consume(product: IProduct) {
    try {
      const details = await RNPayments.consumePurchase(product.googleId);
      return { product, ...details };
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
      const ownedLists = [ownedProducts, ownedSubscriptions];
      return ownedLists;
    } finally {
      await RNPayments.close();
    }
  }

  async restore() {
    try {
      await AndroidBridge.open();
      await RNPayments.loadOwnedPurchasesFromGoogle();
      const products = await RNPayments.listOwnedProducts();
      const subscriptions = await RNPayments.listOwnedSubscriptions();
      let transactionsRequest: Promise<ITransactionAndroid>[] = [];
      if (Array.isArray(products) && products.length > 0) {
        const productTransactions = products.map(p =>
          RNPayments.getPurchaseTransactionDetails(p)
        );
        transactionsRequest = transactionsRequest.concat(productTransactions);
      }
      if (Array.isArray(subscriptions) && subscriptions.length > 0) {
        const subscriptionTransactions = subscriptions.map(s =>
          RNPayments.getSubscriptionTransactionDetails(s)
        );
        transactionsRequest = transactionsRequest.concat(
          subscriptionTransactions
        );
      }
      const transactions: ITransactionAndroid[] = await Promise.all(
        transactionsRequest
      );
      const payload = transactions.map(t => ({
        productIdentifier: t.productId,
        appReceipt: base64.btoa(JSON.stringify(t)),
        transactionDate: t.purchaseTime,
        transactionIdentifier: t.purchaseToken
      }));
      return payload;
    } finally {
      await RNPayments.close();
    }
  }

  private static async open() {
    await RNPayments.close();
    await RNPayments.open();
  }
}
