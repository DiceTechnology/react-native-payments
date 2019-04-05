import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { IBridge } from './Bridge';
import { IOSBridge } from './IOSBridge';
import { AndroidBridge } from './AndroidBridge';

const { RNPayments } = NativeModules;

export const eventEmitter = new NativeEventEmitter(RNPayments);

export const bridge: IBridge = Platform.select({
  ios: new IOSBridge() as IBridge,
  android: new AndroidBridge() as IBridge
});
