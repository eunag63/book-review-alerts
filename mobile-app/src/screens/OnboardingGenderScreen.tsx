import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';
import OnboardingProgress from '../components/OnboardingProgress';
import { useOnboarding } from '../contexts/OnboardingContext';

const GENDERS = ['여성 작가', '남성 작가'];

export default function OnboardingGenderScreen() {
  const navigation = useNavigation();
  const { authorGenders, setAuthorGenders } = useOnboarding();

  const toggleGender = (gender: string) => {
    if (authorGenders.includes(gender)) {
      setAuthorGenders(authorGenders.filter(g => g !== gender));
    } else {
      setAuthorGenders([...authorGenders, gender]);
    }
  };

  const handleNext = () => {
    navigation.navigate('OnboardingPublisher' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={3} totalSteps={4} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            선호 작가 성별{'\n'}자유롭게 선택하세요
          </Text>
        </View>

        <View style={styles.gendersContainer}>
          {GENDERS.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                authorGenders.includes(gender) && styles.genderButtonSelected
              ]}
              onPress={() => toggleGender(gender)}
            >
              <Text style={[
                styles.genderText,
                authorGenders.includes(gender) && styles.genderTextSelected
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <OnboardingButton 
          title="다음"
          onPress={handleNext}
          disabled={authorGenders.length === 0}
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
  gendersContainer: {
    flex: 1,
    paddingTop: 20,
    gap: 16,
  },
  genderButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  genderButtonSelected: {
    backgroundColor: 'rgba(128, 253, 143, 0.5)',
    borderColor: '#80FD8F',
  },
  genderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  genderTextSelected: {
    color: '#ffffff',
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});