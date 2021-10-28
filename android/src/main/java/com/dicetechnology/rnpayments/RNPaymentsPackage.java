package com.dicetechnology.rnpayments;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class RNPaymentsPackage implements ReactPackage {

    private RNPaymentsGoogleModule mPayments;
    private String _licenseKey;
    private Boolean _licenseKeySetInConstructor = false;

    public RNPaymentsPackage(String licenseKey) {
        _licenseKey = licenseKey;
        _licenseKeySetInConstructor = true;
    }
    public RNPaymentsPackage() {
    }

    @Override
    public List<NativeModule> createNativeModules(
        ReactApplicationContext reactContext
    ) {
        List<NativeModule> modules = new ArrayList<>();

        modules.add(new RNPaymentsAmazonModule(reactContext));
        if (!_licenseKeySetInConstructor) {
            mPayments = new RNPaymentsGoogleModule(reactContext);
        } else {
            mPayments = new RNPaymentsGoogleModule(reactContext, _licenseKey);
        }
        modules.add(mPayments);

        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    // Deprecated from RN 0.47
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
        if (mPayments != null) {
            mPayments.onActivityResult(activity, requestCode, resultCode, intent);
        }
    }
}
