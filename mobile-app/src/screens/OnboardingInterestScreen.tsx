import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';
import OnboardingProgress from '../components/OnboardingProgress';

const INTERESTS = ['문학', '비문학'];

export default function OnboardingInterestScreen() {
  const navigation = useNavigation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleNext = () => {
    // TODO: 선택된 관심 분야 저장
    navigation.navigate('Home' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={1} totalSteps={4} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            관심 분야 선택{'\n'}둘 다 선택할 수 있어요
          </Text>
        </View>

        <View style={styles.interestsContainer}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests.includes(interest) && styles.interestButtonSelected
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.interestText,
                selectedInterests.includes(interest) && styles.interestTextSelected
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <OnboardingButton 
          title="다음"
          onPress={handleNext}
          disabled={selectedInterests.length === 0}
          style={styles.nextButton}
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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 50,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 28,
  },
  interestsContainer: {
    flex: 1,
    paddingTop: 20,
    gap: 16,
  },
  interestButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  interestButtonSelected: {
    backgroundColor: 'rgba(128, 253, 143, 0.5)',
    borderColor: '#80FD8F',
  },
  interestText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  interestTextSelected: {
    color: '#ffffff',
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});