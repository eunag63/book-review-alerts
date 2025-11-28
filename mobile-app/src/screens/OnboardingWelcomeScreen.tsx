import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';

export default function OnboardingWelcomeScreen() {
  const navigation = useNavigation();

  const handleStart = () => {
    navigation.navigate('OnboardingInterest' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Image 
            source={require('../../assets/onboarding.png')} 
            style={styles.welcomeImage}
          />
          <Text style={styles.title}>
            당신의 취향에 맞는{'\n'}서평단을 빠르게{'\n'}찾도록 도와드릴게요
          </Text>
        </View>
        
        <OnboardingButton 
          title="시작하기"
          onPress={handleStart}
          style={styles.startButton}
        />
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
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 24,
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  startButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});