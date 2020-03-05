package com.dicetechnology.rnpayments;

import android.app.Activity;
import android.content.Intent;

import com.anjlab.android.iab.v3.BillingProcessor;
import com.anjlab.android.iab.v3.PurchaseData;
import com.anjlab.android.iab.v3.SkuDetails;
import com.anjlab.android.iab.v3.TransactionDetails;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;

public class RNPaymentsGoogleModule extends ReactContextBaseJavaModule implements ActivityEventListener, BillingProcessor.IBillingHandler {

    public static final int PURCHASE_FLOW_REQUEST_CODE = 32459;

    ReactApplicationContext reactContext;
    String LICENSE_KEY = null;
    BillingProcessor bp;
    private HashMap<String, Promise> mPromiseCache = new HashMap<>();

    public RNPaymentsGoogleModule(ReactApplicationContext reactContext, String licenseKey) {
        super(reactContext);
        this.reactContext = reactContext;
        LICENSE_KEY = licenseKey;

        reactContext.addActivityEventListener(this);
    }

    public RNPaymentsGoogleModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        int keyResourceId = this.reactContext
                .getResources()
                .getIdentifier("RNB_GOOGLE_PLAY_LICENSE_KEY", "string", this.reactContext.getPackageName());
        LICENSE_KEY = this.reactContext.getString(keyResourceId);

        reactContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "RNPaymentsGoogleModule";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> map = new HashMap<>();
        map.put("APP_STORE_AVAILABLE", Utils.getAppStore(getReactApplicationContext()) == AppStore.GOOGLE);
        return map;
    }

    @Override
    public void onBillingInitialized() {
        resolvePromise(PromiseConstants.OPEN, true);
    }

    @ReactMethod
    public void open(final Promise promise) {
        if (isIabServiceAvailable()) {
            if (bp == null) {
                clearPromises();
                if (putPromise(PromiseConstants.OPEN, promise)) {
                    try {
                        bp = new BillingProcessor(reactContext, LICENSE_KEY, this);
                    } catch (Exception ex) {
                        rejectPromise(PromiseConstants.OPEN, "Failure on open: " + ex.getMessage());
                    }
                } else {
                    promise.reject("EUNSPECIFIED", "Previous open operation is not resolved.");
                }
            } else {
                promise.reject("EUNSPECIFIED", "Channel is already open. Call close() on InAppBilling to be able to open().");
            }
        } else {
            promise.reject("EUNSPECIFIED", "InAppBilling is not available. InAppBilling will not work/test on an emulator, only a physical Android device.");
        }
    }

    @ReactMethod
    public void close(final Promise promise) {
        if (bp != null) {
            bp.release();
            bp = null;
        }

        clearPromises();
        promise.resolve(true);
    }

    @ReactMethod
    public void loadOwnedPurchasesFromGoogle(final Promise promise) {
        if (bp != null) {
            bp.loadOwnedPurchasesFromGoogle();
            promise.resolve(true);
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @Override
    public void onProductPurchased(String productId, TransactionDetails details) {
        if (details != null && productId.equals(details.purchaseInfo.purchaseData.productId)) {
            try {
                WritableMap map = mapTransactionDetails(details);
                resolvePromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, map);
            } catch (Exception ex) {
                rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Failure on purchase or subscribe callback: " + ex.getMessage());
            }
        } else {
            rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Failure on purchase or subscribe callback. Details were empty.");
        }
    }

    @Override
    public void onBillingError(int errorCode, Throwable error) {
        if (hasPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE))
            rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Purchase or subscribe failed with error: " + errorCode);
    }

    @ReactMethod
    public void purchase(final String productId, final String developerPayload, final Promise promise) {
        if (bp != null) {
            if (putPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, promise)) {
                boolean purchaseProcessStarted = bp.purchase(getCurrentActivity(), productId, developerPayload);
                if (!purchaseProcessStarted)
                    rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Could not start purchase process.");
            } else {
                promise.reject("EUNSPECIFIED", "Previous purchase or subscribe operation is not resolved.");
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void consumePurchase(final String productId, final Promise promise) {
        if (bp != null) {
            try {
                boolean consumed = bp.consumePurchase(productId);
                if (consumed)
                    promise.resolve(true);
                else
                    promise.reject("EUNSPECIFIED", "Could not consume purchase");
            } catch (Exception ex) {
                promise.reject("EUNSPECIFIED", "Failure on consume: " + ex.getMessage());
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void subscribe(final String productId, final String developerPayload, final Promise promise) {
        if (bp != null) {
            if (putPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, promise)) {
                boolean subscribeProcessStarted = bp.subscribe(getCurrentActivity(), productId, developerPayload);
                if (!subscribeProcessStarted)
                    rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Could not start subscribe process.");
            } else {
                promise.reject("EUNSPECIFIED", "Previous subscribe or purchase operation is not resolved.");
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void updateSubscription(final ReadableArray oldProductIds, final String productId, final String developerPayload, final Promise promise) {
        if (bp != null) {
            if (putPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, promise)) {
                ArrayList<String> oldProductIdList = new ArrayList<>();
                for (int i = 0; i < oldProductIds.size(); i++) {
                    oldProductIdList.add(oldProductIds.getString(i));
                }

                boolean updateProcessStarted = bp.updateSubscription(getCurrentActivity(), oldProductIdList, productId, developerPayload);

                if (!updateProcessStarted)
                    rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "Could not start updateSubscription process.");
            } else {
                promise.reject("EUNSPECIFIED", "Previous subscribe or purchase operation is not resolved.");
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void isSubscribed(final String productId, final Promise promise) {
        if (bp != null) {
            boolean subscribed = bp.isSubscribed(productId);
            promise.resolve(subscribed);
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void isPurchased(final String productId, final Promise promise) {
        if (bp != null) {
            boolean purchased = bp.isPurchased(productId);
            promise.resolve(purchased);
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void listOwnedProducts(final Promise promise) {
        if (bp != null) {
            List<String> purchasedProductIds = bp.listOwnedProducts();
            WritableArray arr = Arguments.createArray();

            for (int i = 0; i < purchasedProductIds.size(); i++) {
                arr.pushString(purchasedProductIds.get(i));
            }

            promise.resolve(arr);
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void listOwnedSubscriptions(final Promise promise) {
        if (bp != null) {
            List<String> ownedSubscriptionsIds = bp.listOwnedSubscriptions();
            WritableArray arr = Arguments.createArray();

            for (int i = 0; i < ownedSubscriptionsIds.size(); i++) {
                arr.pushString(ownedSubscriptionsIds.get(i));
            }

            promise.resolve(arr);
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void getProductDetails(final ReadableArray productIds, final Promise promise) {
        if (bp != null) {
            try {
                ArrayList<String> productIdList = new ArrayList<>();
                for (int i = 0; i < productIds.size(); i++) {
                    productIdList.add(productIds.getString(i));
                }

                List<SkuDetails> details = bp.getPurchaseListingDetails(productIdList);

                if (details != null) {
                    WritableArray arr = Arguments.createArray();
                    for (SkuDetails detail : details) {
                        if (detail != null) {
                            WritableMap map = Arguments.createMap();

                            map.putString("id", detail.productId);
                            map.putString("title", detail.title);
                            map.putString("description", detail.description);
                            map.putString("currencyCode", detail.currency);
                            map.putString("priceString", detail.priceText);
                            map.putBoolean("isSubscription", detail.isSubscription);
                            arr.pushMap(map);
                        }
                    }

                    promise.resolve(arr);
                } else {
                    promise.reject("EUNSPECIFIED", "Details was not found.");
                }
            } catch (Exception ex) {
                promise.reject("EUNSPECIFIED", "Failure on getting product details: " + ex.getMessage());
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void getSubscriptionDetails(final ReadableArray productIds, final Promise promise) {
        if (bp != null) {
            try {
                ArrayList<String> productIdList = new ArrayList<>();
                for (int i = 0; i < productIds.size(); i++) {
                    productIdList.add(productIds.getString(i));
                }

                List<SkuDetails> details = bp.getSubscriptionListingDetails(productIdList);

                if (details != null) {
                    WritableArray arr = Arguments.createArray();
                    for (SkuDetails detail : details) {
                        if (detail != null) {
                            WritableMap map = Arguments.createMap();

                            map.putString("id", detail.productId);
                            map.putString("title", detail.title);
                            map.putString("description", detail.description);
                            map.putString("currencyCode", detail.currency);
                            map.putString("priceString", detail.priceText);
                            map.putBoolean("isSubscription", detail.isSubscription);
                            map.putString("subscriptionPeriod", detail.subscriptionPeriod);
                            if (detail.subscriptionFreeTrialPeriod != null)
                                map.putString("subscriptionFreeTrialPeriod", detail.subscriptionFreeTrialPeriod);
                            map.putBoolean("haveTrialPeriod", detail.haveTrialPeriod);
                            map.putDouble("introductoryPrice", detail.introductoryPriceValue);
                            if (detail.introductoryPriceText != null)
                                map.putString("introductoryPriceText", detail.introductoryPriceText);
                            if (detail.introductoryPricePeriod != null)
                                map.putString("introductoryPricePeriod", detail.introductoryPricePeriod);
                            map.putBoolean("haveIntroductoryPeriod", detail.haveIntroductoryPeriod);
                            map.putInt("introductoryPriceCycles", detail.introductoryPriceCycles);
                            arr.pushMap(map);
                        }
                    }

                    promise.resolve(arr);
                } else {
                    promise.reject("EUNSPECIFIED", "Details was not found.");
                }
            } catch (Exception ex) {
                promise.reject("EUNSPECIFIED", "Failure on getting product details: " + ex.getMessage());
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void getPurchaseTransactionDetails(final String productId, final Promise promise) {
        if (bp != null) {
            TransactionDetails details = bp.getPurchaseTransactionDetails(productId);
            if (details != null && productId.equals(details.purchaseInfo.purchaseData.productId)) {
                WritableMap map = mapTransactionDetails(details);
                promise.resolve(map);
            } else {
                promise.reject("EUNSPECIFIED", "Could not find transaction details for productId.");
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    @ReactMethod
    public void getSubscriptionTransactionDetails(final String productId, final Promise promise) {
        if (bp != null) {
            TransactionDetails details = bp.getSubscriptionTransactionDetails(productId);
            if (details != null && productId.equals(details.purchaseInfo.purchaseData.productId)) {
                WritableMap map = mapTransactionDetails(details);
                promise.resolve(map);
            } else {
                promise.reject("EUNSPECIFIED", "Could not find transaction details for productId.");
            }
        } else {
            promise.reject("EUNSPECIFIED", "Channel is not opened. Call open() on InAppBilling.");
        }
    }

    private WritableMap mapTransactionDetails(TransactionDetails details) {
        WritableMap map = Arguments.createMap();

        map.putString("receiptData", details.purchaseInfo.responseData.toString());

        if (details.purchaseInfo.signature != null)
            map.putString("receiptSignature", details.purchaseInfo.signature.toString());

        PurchaseData purchaseData = details.purchaseInfo.purchaseData;

        map.putString("productId", purchaseData.productId);
        map.putString("orderId", purchaseData.orderId);
        map.putString("purchaseToken", purchaseData.purchaseToken);
        map.putString("purchaseTime", purchaseData.purchaseTime == null
                ? "" : purchaseData.purchaseTime.toString());
        map.putString("purchaseState", purchaseData.purchaseState == null
                ? "" : purchaseData.purchaseState.toString());


        if (purchaseData.developerPayload != null)
            map.putString("developerPayload", purchaseData.developerPayload);

        return map;
    }

    @Override
    public void onPurchaseHistoryRestored() {
        /*
         * Called when purchase history was restored and the list of all owned PRODUCT ID's
         * was loaded from Google Play
         */
    }

    private Boolean isIabServiceAvailable() {
        return BillingProcessor.isIabServiceAvailable(reactContext);
    }

    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        onActivityResult(requestCode, resultCode, data);
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != PromiseConstants.PURCHASE_FLOW_REQUEST_CODE) {
            return;
        }

        int responseCode = data.getIntExtra(PromiseConstants.RESPONSE_CODE, PromiseConstants.BILLING_RESPONSE_RESULT_OK);
        if (resultCode == Activity.RESULT_OK && responseCode == PromiseConstants.BILLING_RESPONSE_RESULT_OK) {
            resolvePromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, true);
        } else {
            rejectPromise(PromiseConstants.PURCHASE_OR_SUBSCRIBE, "An error has occured. Code " + requestCode);
        }
    }

    public void onNewIntent(Intent intent) {

    }

    private synchronized void resolvePromise(String key, Object value) {
        if (mPromiseCache.containsKey(key)) {
            Promise promise = mPromiseCache.get(key);
            promise.resolve(value);
            mPromiseCache.remove(key);
        }
    }

    private synchronized void rejectPromise(String key, String reason) {
        if (mPromiseCache.containsKey(key)) {
            Promise promise = mPromiseCache.get(key);
            promise.reject("EUNSPECIFIED", reason);
            mPromiseCache.remove(key);
        }
    }

    private synchronized Boolean putPromise(String key, Promise promise) {
        if (!mPromiseCache.containsKey(key)) {
            mPromiseCache.put(key, promise);
            return true;
        }
        return false;
    }

    private synchronized Boolean hasPromise(String key) {
        return mPromiseCache.containsKey(key);
    }

    private synchronized void clearPromises() {
        mPromiseCache.clear();
    }
}
