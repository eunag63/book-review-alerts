import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function OnboardingCompleteScreen() {
  const navigation = useNavigation();
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  const { saveAllSettings } = useOnboarding();

  useEffect(() => {
    // 2초 후 두 번째 메시지 표시
    const timer = setTimeout(() => {
      setShowSecondMessage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = async () => {
    await saveAllSettings();
    navigation.navigate('Home' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Image 
            source={require('../../assets/onboarding.png')} 
            style={styles.completeImage}
          />
          {!showSecondMessage ? (
            <Text style={styles.firstMessage}>
              더 많은 알림과 수정은{'\n'}설정 페이지에서 가능해요!
            </Text>
          ) : (
            <Text style={styles.secondMessage}>
              이제 서평단을{'\n'}보러갈까요?
            </Text>
          )}
        </View>

        {showSecondMessage && (
          <OnboardingButton 
            title="확인"
            onPress={handleConfirm}
            style={styles.confirmButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  firstMessage: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 24,
  },
  secondMessage: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 24,
  },
  completeImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  confirmButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});