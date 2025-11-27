import React from 'react';
import { StyleSheet, View, Platform, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationService } from '../services/NotificationService';

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
  const handleTestNotification = async () => {
    try {
      await NotificationService.sendTestNotification();
      Alert.alert('알림 테스트', '2초 후에 테스트 알림이 표시됩니다!');
    } catch (error) {
      Alert.alert('오류', '알림 테스트에 실패했습니다.');
    }
  };

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
      />
      
      {/* 테스트용 알림 버튼 */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={handleTestNotification}
      >
        <Text style={styles.testButtonText}>🔔 알림 테스트</Text>
      </TouchableOpacity>
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
  testButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#80FD8F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  testButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '600',
  },
});