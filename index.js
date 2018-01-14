import { Platform } from 'react-native';

import ReactNativePurchasesWrapper from './src/wrappers/ReactNativePurchases';

export const ReactNativePurchases =
    Platform.OS === 'ios' ? ReactNativePurchasesWrapper : { error: 'Android not implemented' };