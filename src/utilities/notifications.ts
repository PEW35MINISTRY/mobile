import { Notifications, Registered, RegistrationError, NotificationCompletion } from 'react-native-notifications';
import store from '../redux-store';

/********************************
 * Notification Event Listeners *
 ********************************/

Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
    console.error(event);
});

Notifications.events().registerNotificationReceivedForeground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
  console.log("Notification Received - Foreground", notification.payload);

  // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
  completion({alert: true, sound: true, badge: true});
});

Notifications.events().registerNotificationOpened((notification: Notification, completion: () => void, action: NotificationActionResponse) => {
  console.log("Notification opened by device user", notification.payload);
  completion();
});
      
Notifications.events().registerNotificationReceivedBackground((notification: Notification, completion: (response: NotificationCompletion) => void) => {
  console.log("Notification Received - Background", notification.payload);
  console.log(notification.payload["google.message_id"]);

  Notifications.postLocalNotification(notification, notification.payload["google.message_id"])

  // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
  completion({alert: true, sound: true, badge: true});
});