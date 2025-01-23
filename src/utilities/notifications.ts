import { Notifications, Registered, RegistrationError, NotificationCompletion } from 'react-native-notifications';
import store, { setDeviceToken } from '../redux-store';
import { Platform, PermissionsAndroid, PermissionStatus } from 'react-native';

/********************************
 * Notification Event Listeners *
 ********************************/

const checkNotificationsPermissions = async ():Promise<boolean> => {
  if (Platform.OS === 'android') {
    const existingPermissionCheckResult = await PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS');
    if (!existingPermissionCheckResult) {
      const newPermissionRequestResult:PermissionStatus = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
      if (newPermissionRequestResult === 'granted') return true;
      else return false;
    }
    else return true;
  }
  return true;
}

export const initializeNotifications = async () => {
  // use store.dispatch directly, as 'useAppDispatch' can only be used in function components
  const dispatch = store.dispatch;

  const permission = await checkNotificationsPermissions();
  if (permission) {
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
      dispatch(setDeviceToken(event.deviceToken));
    });
    initializeNotificationCallbacks();
  }

}

export const generateDefaultDeviceName = () => {
  switch (Platform.OS) {
      case "android": {
          return `${Platform.constants.Model}_android ${Platform.constants.Release}`;
          break;
      }
      case "ios": {
          return `${Platform.constants.systemName}_iOS ${Platform.constants.osVersion}`;
          break;
      }
  }
}

const initializeNotificationCallbacks = () => {
  Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
    console.error(event);
  });

  Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion: (response: NotificationCompletion) => void) => {

    //Notifications.postLocalNotification(notification, notification.payload["google.message_id"])

    // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
    completion({alert: true, sound: true, badge: true});
  });

  Notifications.events().registerNotificationOpened((notification: Notification, completion: () => void, action: NotificationActionResponse) => {

    // TODO: when a user taps on the notification, navigate them to the relevant part of the app
    completion();
  });
        
  Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion: (response: NotificationCompletion) => void) => {

    // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
    completion({alert: true, sound: true, badge: true});
  });
}
