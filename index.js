import { Platform } from 'react-native';

import ReactNativePaymentsWrapper from './src/wrappers/ReactNativePayments';

export const ReactNativePayments =
    Platform.OS === 'ios' ? ReactNativePaymentsWrapper : { error: 'Android not implemented' };
