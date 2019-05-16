package com.dicetechnology.rnpayments;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

public class Utils {
    public static AppStore getAppStore(Context context) {

        PackageManager pkgManager = context.getPackageManager();
        String installerPackageName = pkgManager.getInstallerPackageName(context.getPackageName());
        final String AMAZON_FEATURE_FIRE_TV = "amazon.hardware.fire_tv";
        String AMAZON_MODEL = Build.MODEL;


        if (installerPackageName != null && installerPackageName.startsWith("com.amazon")) {
            return AppStore.AMAZON;
        } else if (AMAZON_MODEL.matches("AFTN")) {
            return AppStore.AMAZON;
        } else if (pkgManager.hasSystemFeature(AMAZON_FEATURE_FIRE_TV)) {
            return AppStore.AMAZON;
        } else if ("com.android.vending".equals(installerPackageName)) {
            return AppStore.GOOGLE;
        }

        return AppStore.UNKNOWN;
    }
}
