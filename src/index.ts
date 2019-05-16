import { Platform } from 'react-native';
import { IBridge } from './Bridge';
import { IOSBridge } from './IOSBridge';
import { AndroidBridge } from './AndroidBridge';
import { AmazonBridge } from './AmazonBridge';

export const bridge: IBridge = Platform.select({
  ios: new IOSBridge() as IBridge,
  android: (AmazonBridge.isAppStoreAvailable()
    ? new AmazonBridge()
    : new AndroidBridge()) as IBridge
});
