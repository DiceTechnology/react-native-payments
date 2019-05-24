import { Platform } from 'react-native';
import { IBridge, UnimplementedBridge } from './Bridge';

let bridge: IBridge = new UnimplementedBridge();
if (Platform.OS === 'android') {
  const { AndroidBridge } = require('./AndroidBridge');
  const { AmazonBridge } = require('./AmazonBridge');
  bridge = (AmazonBridge.isAppStoreAvailable()
    ? new AmazonBridge()
    : new AndroidBridge()) as IBridge;
} else if (Platform.OS === 'ios') {
  const { IOSBridge } = require('./IOSBridge');
  bridge = new IOSBridge() as IBridge;
}

export { bridge };
