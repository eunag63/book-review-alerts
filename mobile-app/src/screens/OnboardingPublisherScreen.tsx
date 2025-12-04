import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';
import OnboardingProgress from '../components/OnboardingProgress';
import { useOnboarding } from '../contexts/OnboardingContext';

const PUBLISHERS = {
  '종합 출판사': ['시공사', '위즈덤하우스', '창비', '다산북스', '알에이치코리아', '바람의아이들'],
  '문학 출판사': ['김영사', '민음사', '문학과 지성사', '문학동네', '자음과 모음', '한길사', '열린책들'],
  '아동 출판사': ['웅진씽크빅']
};

export default function OnboardingPublisherScreen() {
  const navigation = useNavigation();
  const { publishers, setPublishers } = useOnboarding();

  const togglePublisher = (publisher: string) => {
    if (publishers.includes(publisher)) {
      setPublishers(publishers.filter(p => p !== publisher));
    } else {
      setPublishers([...publishers, publisher]);
    }
  };

  const handleNext = () => {
    navigation.navigate('OnboardingComplete' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={4} totalSteps={4} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            관심 있는 출판사{'\n'}원하는 만큼 선택하세요
          </Text>
        </View>

        <ScrollView style={styles.publishersContainer} showsVerticalScrollIndicator={false}>
          {Object.entries(PUBLISHERS).map(([type, publisherList]) => (
            <View key={type} style={styles.publisherSection}>
              <Text style={styles.publisherType}>{type}</Text>
              <View style={styles.publisherGrid}>
                {publisherList.map((publisher) => (
                  <TouchableOpacity
                    key={publisher}
                    style={[
                      styles.publisherItem,
                      publishers.includes(publisher) && styles.publisherItemSelected
                    ]}
                    onPress={() => togglePublisher(publisher)}
                  >
                    <Text style={[
                      styles.publisherText,
                      publishers.includes(publisher) && styles.publisherTextSelected
                    ]}>
                      {publisher}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        
        <OnboardingButton 
          title="완료"
          onPress={handleNext}
          disabled={publishers.length === 0}
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
    paddingBottom: 30,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 28,
  },
  publishersContainer: {
    flex: 1,
    marginBottom: 100,
  },
  publisherSection: {
    marginBottom: 30,
  },
  publisherType: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  publisherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  publisherItem: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  publisherItemSelected: {
    backgroundColor: 'rgba(128, 253, 143, 0.5)',
    borderColor: '#80FD8F',
  },
  publisherText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  publisherTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  nextButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});