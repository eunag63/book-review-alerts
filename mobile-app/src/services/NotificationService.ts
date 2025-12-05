import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';

export class NotificationService {
  // Firebase 푸시 알림 권한 요청
  static async requestPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('안드로이드 알림 권한이 거부되었습니다.');
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Firebase 알림 권한 승인됨:', authStatus);
      } else {
        console.log('Firebase 알림 권한 거부됨');
      }
      
      return enabled;
    } catch (error) {
      console.error('알림 권한 요청 실패:', error);
      return false;
    }
  }

  // FCM 토큰 발급 (백그라운드 알림용)
  static async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM 토큰:', token);
      return token;
    } catch (error) {
      console.error('FCM 토큰 발급 실패:', error);
      return null;
    }
  }

  // 토픽 구독 (사용자 관심 분야에 따라)
  static async subscribeToTopic(topic: string) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`토픽 구독 완료: ${topic}`);
    } catch (error) {
      console.error(`토픽 구독 실패 (${topic}):`, error);
    }
  }

  // 토픽 구독 취소
  static async unsubscribeFromTopic(topic: string) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`토픽 구독 취소: ${topic}`);
    } catch (error) {
      console.error(`토픽 구독 취소 실패 (${topic}):`, error);
    }
  }

  // 사용자 설정에 따른 토픽 관리
  static async updateTopicSubscriptions(userSettings: {
    interests: string[];
    categories: string[];
    authorGenders: string[];
    publishers: string[];
  }) {
    try {
      // 기존 토픽들을 모두 구독 취소 (새로 설정하기 위해)
      const allTopics = [
        'literature', 'non-fiction',
        'novel', 'poem', 'picture-book', 'fairy-tale',
        'essay', 'humanities', 'cooking', 'health', 'economy', 'business',
        'self-development', 'politics', 'society', 'history', 'art', 'science',
        'female-author', 'male-author',
        'sigongsa', 'wisdomhouse', 'changbi', 'dasanbooks', 'rhkorea', 'windchildren',
        'gimyoungsa', 'minumsa', 'literature-mind', 'moonhak-dongne', 
        'jaeum-moeum', 'hangilsa', 'open-books', 'woongjin'
      ];

      // 관심 분야별 토픽 구독
      for (const interest of userSettings.interests) {
        const topic = interest === '문학' ? 'literature' : 'non-fiction';
        await this.subscribeToTopic(topic);
      }

      // 카테고리별 토픽 구독
      const categoryTopicMap: { [key: string]: string } = {
        '소설': 'novel', '시': 'poem', '그림책': 'picture-book', '동화책': 'fairy-tale',
        '에세이': 'essay', '인문': 'humanities', '요리': 'cooking', '건강': 'health',
        '경제': 'economy', '경영': 'business', '자기계발': 'self-development',
        '정치': 'politics', '사회': 'society', '역사': 'history', '예술': 'art', '과학': 'science'
      };

      for (const category of userSettings.categories) {
        const topic = categoryTopicMap[category];
        if (topic) {
          await this.subscribeToTopic(topic);
        }
      }

      // 작가 성별별 토픽 구독
      for (const gender of userSettings.authorGenders) {
        const topic = gender === '여성 작가' ? 'female-author' : 'male-author';
        await this.subscribeToTopic(topic);
      }

      // 출판사별 토픽 구독
      const publisherTopicMap: { [key: string]: string } = {
        '시공사': 'sigongsa', '위즈덤하우스': 'wisdomhouse', '창비': 'changbi',
        '다산북스': 'dasanbooks', '알에이치코리아': 'rhkorea', '바람의아이들': 'windchildren',
        '김영사': 'gimyoungsa', '민음사': 'minumsa', '문학과 지성사': 'literature-mind',
        '문학동네': 'moonhak-dongne', '자음과 모음': 'jaeum-moeum', '한길사': 'hangilsa',
        '열린책들': 'open-books', '웅진씽크빅': 'woongjin'
      };

      for (const publisher of userSettings.publishers) {
        const topic = publisherTopicMap[publisher];
        if (topic) {
          await this.subscribeToTopic(topic);
        }
      }

    } catch (error) {
      console.error('토픽 구독 업데이트 실패:', error);
    }
  }

  // 알림 수신 리스너 (포그라운드)
  static addForegroundMessageListener(callback: (message: any) => void) {
    return messaging().onMessage(callback);
  }

  // 백그라운드/종료 상태에서 알림 클릭 처리
  static addBackgroundMessageListener(callback: (message: any) => void) {
    return messaging().onNotificationOpenedApp(callback);
  }

  // 앱이 종료된 상태에서 알림으로 열렸을 때
  static async getInitialNotification() {
    return messaging().getInitialNotification();
  }
}