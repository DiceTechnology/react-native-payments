package com.dicetechnology.rnpayments;

import android.content.Context;
import android.support.annotation.NonNull;

import com.amazon.device.iap.PurchasingListener;
import com.amazon.device.iap.PurchasingService;
import com.amazon.device.iap.model.FulfillmentResult;
import com.amazon.device.iap.model.Product;
import com.amazon.device.iap.model.ProductDataResponse;
import com.amazon.device.iap.model.ProductType;
import com.amazon.device.iap.model.PurchaseResponse;
import com.amazon.device.iap.model.PurchaseUpdatesResponse;
import com.amazon.device.iap.model.Receipt;
import com.amazon.device.iap.model.UserData;
import com.amazon.device.iap.model.UserDataResponse;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.text.NumberFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;

public class RNPaymentsAmazonModule extends ReactContextBaseJavaModule {
    WritableArray purchasedProductsMap = Arguments.createArray();

    // Promises: passed in from React layer. Resolved / rejected depending on response in listener
    private HashMap<String, List<Promise>> mPromiseCache = new HashMap<>();
    private PurchasingListener purchasingListener = new PurchasingListener() {
        public void onProductDataResponse(ProductDataResponse productDataResponse) {
            final ProductDataResponse.RequestStatus status = productDataResponse.getRequestStatus();

            switch (status) {
                case SUCCESSFUL:
                    final Map<String, Product> productData = productDataResponse.getProductData();
                    final Set<String> unavailableSkus = productDataResponse.getUnavailableSkus();
                    WritableArray maps = Arguments.createArray();
                    try {
                        for (Map.Entry<String, Product> skuDetails : productData.entrySet()) {
                            Product product = skuDetails.getValue();
                            ProductType productType = product.getProductType();
                            NumberFormat format = NumberFormat.getCurrencyInstance();

                            Number number;
                            try {
                                number = format.parse(product.getPrice());
                            } catch (ParseException e) {
                                rejectPromises(PromiseConstants.LOAD_PRODUCTS, "Pricing Parsing error in onProductDataResponse: ", e.getMessage(), e);
                                return;
                            }
                            WritableMap map = Arguments.createMap();

                            map.putString("id", product.getSku());
                            map.putString("title", product.getTitle());
                            map.putString("description", product.getDescription());
                            map.putDouble("price", number.doubleValue());
                            map.putString("priceString", product.getPrice());
                            map.putNull("currency");
                            maps.pushMap(map);
                        }
                        resolvePromises(PromiseConstants.LOAD_PRODUCTS, maps);
                    } catch (Exception e) {
                        rejectPromises(PromiseConstants.LOAD_PRODUCTS, "PARSE_ERROR IN onProductDataResponse", e.getMessage(), e);
                    }
                    break;
                case FAILED:
                    rejectPromises(PromiseConstants.LOAD_PRODUCTS, "RESPONSE FAILURE IN onProductDataResponse", null, null);
                    break;
                case NOT_SUPPORTED:
                    rejectPromises(PromiseConstants.LOAD_PRODUCTS, "OPERATION NOT SUPPORTED IN onProductDataResponse", null, null);
                    break;
            }
        }

        public void onPurchaseResponse(PurchaseResponse purchaseResponse) {
            final PurchaseResponse.RequestStatus status = purchaseResponse.getRequestStatus();
            switch (status) {
                case SUCCESSFUL:
                    Receipt receipt = purchaseResponse.getReceipt();
                    // NOTE: In many cases, you would want to notifyFullfilment here. I've left this out in case of
                    // any need to handle things in the UI / React layer prior to notifying fullfilment. The function remains
                    // Available as a React Function and can be called at any time
                    Date date = receipt.getPurchaseDate();
                    try {
                        WritableMap map = getPurchaseData(
                                receipt.getSku(),
                                receipt.getReceiptId(),
                                purchaseResponse.getUserData().getUserId(),
                                receipt.getPurchaseDate()
                        );
                        resolvePromises(PromiseConstants.PURCHASE_PRODUCT, map);
                        PurchasingService.notifyFulfillment(receipt.getReceiptId(), FulfillmentResult.FULFILLED);
                    } catch (Exception e) {
                        rejectPromises(PromiseConstants.PURCHASE_PRODUCT, "JSON_PARSE_ERROR_ON_BILLING_RESPONSE", e.getMessage(), e);
                        PurchasingService.notifyFulfillment(receipt.getReceiptId(), FulfillmentResult.UNAVAILABLE);
                    }
                    break;
                case FAILED:
                    rejectPromises(PromiseConstants.PURCHASE_PRODUCT, "PURCHASE ITEM FAILURE", null, null);
                    break;
            }
        }

        public void onPurchaseUpdatesResponse(PurchaseUpdatesResponse purchaseUpdatesResponse) {
            final PurchaseUpdatesResponse.RequestStatus status = purchaseUpdatesResponse.getRequestStatus();

            switch (status) {
                case SUCCESSFUL:

                    try {
                        List<Receipt> receipts = purchaseUpdatesResponse.getReceipts();
                        for (Receipt receipt : receipts) {
                            Date date = receipt.getPurchaseDate();
                            WritableMap map = getPurchaseData(
                                    receipt.getSku(),
                                    receipt.getReceiptId(),
                                    purchaseUpdatesResponse.getUserData().getUserId(),
                                    receipt.getPurchaseDate()
                            );
                            purchasedProductsMap.pushMap(map);
                        }
                        if (purchaseUpdatesResponse.hasMore()) {
                            // keep requesting the purchase updates
                            PurchasingService.getPurchaseUpdates(false);
                        } else {
                            resolvePromises(PromiseConstants.GET_PURCHASE_UPDATES, purchasedProductsMap);
                        }
                    } catch (Exception e) {
                        rejectPromises(PromiseConstants.GET_PURCHASE_UPDATES, "BILLING_RESPONSE_JSON_PARSE_ERROR", e.getMessage(), e);
                    }
                    break;
                case FAILED:
                    rejectPromises(PromiseConstants.GET_PURCHASE_UPDATES, "FAILED IN onPurchaseUpdatesResponse: ", null, null);
                    break;
                case NOT_SUPPORTED:
                    rejectPromises(PromiseConstants.GET_PURCHASE_UPDATES, "onPurchaseUpdatesResponse NOT_SUPPORTED", "Should retry request", null);
                    break;
            }
        }

        public void onUserDataResponse(UserDataResponse userDataResponse) {
            final UserDataResponse.RequestStatus status = userDataResponse.getRequestStatus();
            switch (status) {
                case SUCCESSFUL:
                    try {
                        UserData userData = userDataResponse.getUserData();

                        WritableMap map = Arguments.createMap();
                        map.putString("userId", userData.getUserId());
                        map.putString("marketplace", userData.getMarketplace());

                        resolvePromises(PromiseConstants.GET_USER_DATA, map);
                    } catch (Exception e) {
                        // TODO: If above works w/o error may not need the below catch block
                        rejectPromises(PromiseConstants.GET_USER_DATA, "USER_DATA_RESPONSE_JSON_PARSE_ERROR", e.getMessage(), e);
                    }
                    break;
                case FAILED:
                    rejectPromises(PromiseConstants.GET_USER_DATA, "FAILED IN onUserDataResponse: ", null, null);
                    break;
                case NOT_SUPPORTED:
                    rejectPromises(PromiseConstants.GET_PURCHASE_UPDATES, "onUserDataResponse NOT_SUPPORTED", "Should retry request", null);
                    break;
            }
        }
    };

    public RNPaymentsAmazonModule(ReactApplicationContext reactContext) {
        super(reactContext);
        registerListener(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNPaymentsAmazonModule";
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> map = new HashMap<>();
        map.put("APP_STORE_AVAILABLE", Utils.getAppStore(getReactApplicationContext()) == AppStore.AMAZON);
        return map;
    }

    // Amazon supports skus up to 100 - needs pagination if more is to be loaded
    @ReactMethod
    public void loadProducts(ReadableArray skus, Promise promise) {
        Set<String> set = new HashSet<>();
        for (int i = 0; i < skus.size(); i++) {
            set.add(skus.getString(i));
        }
        if (set.size() == 0) {
            promise.resolve(Arguments.createArray());
        } else {
            putPromise(PromiseConstants.LOAD_PRODUCTS, promise);
            PurchasingService.getProductData(set);
        }
    }

    @ReactMethod
    public void restore(Promise promise) {
        putPromise(PromiseConstants.GET_PURCHASE_UPDATES, promise);
        purchasedProductsMap = Arguments.createArray(); // clear all of the purchased products
        // get the entire history of the user's purchase
        PurchasingService.getPurchaseUpdates(true);
    }

    @ReactMethod
    public void getUserData(Promise promise) {
        putPromise(PromiseConstants.GET_USER_DATA, promise);
        PurchasingService.getUserData();
    }

    @ReactMethod
    public void notifyFulfillment(String receiptId, FulfillmentResult result) {
        PurchasingService.notifyFulfillment(receiptId, result);
    }

    @ReactMethod
    public void purchaseProduct(String sku, Promise promise) {
        putPromise(PromiseConstants.PURCHASE_PRODUCT, promise);
        PurchasingService.purchase(sku);
    }

    private void registerListener(Context context) {
        PurchasingService.registerListener(context, purchasingListener);
    }

    private WritableMap getPurchaseData(
            String productId,
            String receiptId,
            String userId,
            Date transactionDate
    ) {
        WritableMap map = Arguments.createMap();
        map.putString("id", receiptId);
        map.putString("productId", productId);
        map.putString("userId", userId);
        map.putString("transactionDate", transactionDate != null ? transactionDate.toString() : "");
        return map;
    }

    private synchronized void putPromise(String key, Promise promise) {
        List<Promise> list;
        if (mPromiseCache.containsKey(key)) {
            list = mPromiseCache.get(key);
        } else {
            list = new ArrayList<>();
            mPromiseCache.put(key, list);
        }

        list.add(promise);
    }

    private synchronized void resolvePromises(String key, Object value) {
        if (mPromiseCache.containsKey(key)) {
            List<Promise> list = mPromiseCache.get(key);
            for (Promise promise : list) {
                promise.resolve(value);
            }
            mPromiseCache.remove(key);
        }
    }

    private synchronized void rejectPromises(String key, String code, String message, Exception err) {
        if (mPromiseCache.containsKey(key)) {
            List<Promise> list = mPromiseCache.get(key);
            for (Promise promise : list) {
                promise.reject(code, message, err);
            }
            mPromiseCache.remove(key);
        }
    }
}