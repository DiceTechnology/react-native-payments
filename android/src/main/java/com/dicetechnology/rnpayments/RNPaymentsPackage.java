package com.dicetechnology.rnpayments;

import android.app.Activity;
import android.content.Intent;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RNPaymentsPackage implements ReactPackage {

    RNPayments payments;

    public RNPaymentsPackage(String licenseKey) {
        _licenseKey = licenseKey;
        _licenseKeySetInConstructor = true;
    }

    public RNPaymentsPackage() {
    }

    private String _licenseKey;
    private Boolean _licenseKeySetInConstructor = false;

    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        if (!_licenseKeySetInConstructor) {
            payments = new RNPayments(reactContext);
        } else {
            payments = new RNPayments(reactContext, _licenseKey);
        }
        modules.add(payments);

        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList();
    }


    public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
        if (payments != null) {
            payments.onActivityResult(activity, requestCode, resultCode, intent);
        }
    }
}
