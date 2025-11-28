import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import OnboardingWelcomeScreen from './src/screens/OnboardingWelcomeScreen';
import OnboardingInterestScreen from './src/screens/OnboardingInterestScreen';
import OnboardingCategoryScreen from './src/screens/OnboardingCategoryScreen';
import OnboardingGenderScreen from './src/screens/OnboardingGenderScreen';
import OnboardingPublisherScreen from './src/screens/OnboardingPublisherScreen';
import OnboardingCompleteScreen from './src/screens/OnboardingCompleteScreen';
import { NotificationService } from './src/services/NotificationService';
import { OnboardingProvider } from './src/contexts/OnboardingContext';

const Stack = createStackNavigator();

export default function App() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // 앱 시작할 때 푸시 알림 권한 요청
    NotificationService.registerForPushNotificationsAsync();

    // 알림 수신 리스너
    notificationListener.current = NotificationService.addNotificationReceivedListener((notification: any) => {
      console.log('알림 수신:', notification);
    });

    // 알림 클릭 리스너
    responseListener.current = NotificationService.addNotificationResponseReceivedListener((response: any) => {
      console.log('알림 클릭:', response);
      // 나중에 여기서 특정 페이지로 이동 처리
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="OnboardingWelcome" 
            component={OnboardingWelcomeScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="OnboardingInterest" 
            component={OnboardingInterestScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="OnboardingCategory" 
            component={OnboardingCategoryScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="OnboardingGender" 
            component={OnboardingGenderScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="OnboardingPublisher" 
            component={OnboardingPublisherScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="OnboardingComplete" 
            component={OnboardingCompleteScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="NotificationSettings" 
            component={NotificationSettingsScreen} 
            options={{ 
              title: '알림 설정',
              headerStyle: { backgroundColor: '#0a0a0a' },
              headerTintColor: '#80FD8F',
              headerTitleStyle: { color: '#ffffff' },
            }} 
          />
        </Stack.Navigator>
        </NavigationContainer>
      </OnboardingProvider>
      <StatusBar style="light" backgroundColor="#0a0a0a" />
    </SafeAreaProvider>
  );
}
