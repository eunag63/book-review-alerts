import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 알림 기본 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  // 푸시 알림 권한 요청 및 토큰 발급
  static async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#80FD8F',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('푸시 알림 권한이 필요합니다!');
        return;
      }
      
      // Expo 푸시 토큰 발급
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
        console.log('푸시 토큰:', token);
      } catch (error) {
        console.log('토큰 발급 실패:', error);
      }
    } else {
      alert('실제 기기에서만 푸시 알림을 사용할 수 있습니다.');
    }

    return token;
  }

  // 로컬 테스트 알림 발송
  static async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 새로운 서평단 등록!",
        body: "관심있는 서평단이 등록되었습니다. 지금 확인해보세요!",
        data: { url: 'book-review-alerts://home' },
      },
      trigger: { seconds: 2 },
    });
  }

  // 알림 클릭 처리
  static addNotificationReceivedListener(callback: (notification: any) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // 알림 응답 처리 (사용자가 알림 클릭했을 때)
  static addNotificationResponseReceivedListener(callback: (response: any) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}