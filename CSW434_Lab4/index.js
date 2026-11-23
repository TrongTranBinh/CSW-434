import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  // The background callback may perform short async data processing.
  // Never update UI or place server credentials here.
  console.log('Background FCM message:', remoteMessage.messageId);
});
AppRegistry.registerComponent(appName, () => App);
