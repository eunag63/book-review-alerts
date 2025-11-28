import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import OnboardingButton from '../components/OnboardingButton';
import OnboardingProgress from '../components/OnboardingProgress';

const CATEGORIES = {
  문학: ['소설', '시', '그림책', '동화책'],
  비문학: ['에세이', '인문', '요리', '건강', '경제', '경영', '자기계발', '정치', '사회', '역사', '예술', '과학']
};

export default function OnboardingCategoryScreen() {
  const navigation = useNavigation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleNext = () => {
    // TODO: 선택된 카테고리 저장
    navigation.navigate('OnboardingGender' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingProgress currentStep={2} totalSteps={4} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            관심 있는 카테고리{'\n'}편하게 선택해주세요
          </Text>
        </View>

        <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
          {Object.entries(CATEGORIES).map(([type, categories]) => (
            <View key={type} style={styles.categorySection}>
              <Text style={styles.categoryType}>{type}</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryItem,
                      selectedCategories.includes(category) && styles.categoryItemSelected
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategories.includes(category) && styles.categoryTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        
        <OnboardingButton 
          title="다음"
          onPress={handleNext}
          disabled={selectedCategories.length === 0}
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
  categoriesContainer: {
    flex: 1,
    marginBottom: 100,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryType: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(128, 253, 143, 0.5)',
    borderColor: '#80FD8F',
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryTextSelected: {
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