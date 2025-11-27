import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationService } from '../services/NotificationService';
import { useNavigation } from '@react-navigation/native';

// WebView는 웹에서 지원되지 않으므로 조건부 import
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    const WebViewModule = require('react-native-webview');
    WebView = WebViewModule.WebView;
  } catch (error) {
    console.log('WebView not available');
  }
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const webViewRef = useRef<any>(null);

  const goToNotificationSettings = () => {
    navigation.navigate('NotificationSettings' as never);
  };

  // WebView에서 메시지 수신 처리
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'NAVIGATE_TO_SETTINGS') {
        goToNotificationSettings();
      }
    } catch (error) {
      console.log('PostMessage 파싱 에러:', error);
    }
  };

  // WebView에 전역 함수 주입
  useEffect(() => {
    if (webViewRef.current) {
      const injectedJS = `
        window.ReactNativeWebView = {
          postMessage: function(message) {
            window.ReactNativeWebView.postMessage(message);
          }
        };
        true;
      `;
      webViewRef.current.injectJavaScript(injectedJS);
    }
  }, []);

  if (Platform.OS === 'web') {
    // 웹에서는 iframe 사용
    return (
      <SafeAreaView style={styles.container}>
        <iframe
          src="http://localhost:3000"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#0a0a0a',
          }}
          title="서평단 알리미"
        />
      </SafeAreaView>
    );
  }

  if (!WebView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>WebView를 로드할 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'http://localhost:3000' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={true}
        userAgent="BookReviewAlerts-App/1.0"
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  fallbackText: {
    color: '#ffffff',
    fontSize: 16,
  },
});