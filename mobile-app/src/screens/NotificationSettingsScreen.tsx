import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { UserSettingsService } from '../services/UserSettingsService';
import { NotificationService } from '../services/NotificationService';

const INTERESTS = ['문학', '비문학'];

const CATEGORIES = {
  문학: ['소설', '시', '그림책', '동화책'],
  비문학: ['에세이', '인문', '요리', '건강', '경제', '경영', '자기계발', '정치', '사회', '역사', '예술', '과학']
};

const AUTHOR_GENDERS = ['여성 작가', '남성 작가'];

const PUBLISHERS = {
  '종합 출판사': ['시공사', '위즈덤하우스', '창비', '다산북스', '알에이치코리아', '바람의아이들'],
  '문학 출판사': ['김영사', '민음사', '문학과 지성사', '문학동네', '자음과 모음', '한길사', '열린책들'],
  '아동 출판사': ['웅진씽크빅']
};

export default function NotificationSettingsScreen() {
  const [interests, setInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authorGenders, setAuthorGenders] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userSettings = await UserSettingsService.getSettings();
      if (userSettings) {
        setInterests(userSettings.interests);
        setCategories(userSettings.categories);
        setAuthorGenders(userSettings.authorGenders);
        setPublishers(userSettings.publishers);
      }
    } catch (error) {
      console.error('사용자 설정 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(c => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const toggleAuthorGender = (gender: string) => {
    if (authorGenders.includes(gender)) {
      setAuthorGenders(authorGenders.filter(g => g !== gender));
    } else {
      setAuthorGenders([...authorGenders, gender]);
    }
  };

  const togglePublisher = (publisher: string) => {
    if (publishers.includes(publisher)) {
      setPublishers(publishers.filter(p => p !== publisher));
    } else {
      setPublishers([...publishers, publisher]);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = { interests, categories, authorGenders, publishers };
      
      // AsyncStorage에 저장
      await UserSettingsService.saveSettings(settings);
      
      // Firebase 토픽 구독 업데이트
      await NotificationService.updateTopicSubscriptions(settings);
      
      Alert.alert('저장 완료', '알림 설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      Alert.alert('저장 실패', '설정을 저장하는 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>알림 설정</Text>
        <Text style={styles.subtitle}>관심있는 서평단 조건을 설정하세요</Text>

        {/* 관심 분야 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>관심 분야</Text>
          <View style={styles.optionsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.optionButton,
                  interests.includes(interest) && styles.optionButtonSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.optionText,
                  interests.includes(interest) && styles.optionTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 카테고리 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          {Object.entries(CATEGORIES).map(([type, categoryList]) => (
            <View key={type} style={styles.categorySection}>
              <Text style={styles.categoryType}>{type}</Text>
              <View style={styles.optionsContainer}>
                {categoryList.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionButton,
                      categories.includes(category) && styles.optionButtonSelected
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.optionText,
                      categories.includes(category) && styles.optionTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 작가 성별 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>작가 성별</Text>
          <View style={styles.optionsContainer}>
            {AUTHOR_GENDERS.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  authorGenders.includes(gender) && styles.optionButtonSelected
                ]}
                onPress={() => toggleAuthorGender(gender)}
              >
                <Text style={[
                  styles.optionText,
                  authorGenders.includes(gender) && styles.optionTextSelected
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 출판사 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>출판사</Text>
          {Object.entries(PUBLISHERS).map(([type, publisherList]) => (
            <View key={type} style={styles.categorySection}>
              <Text style={styles.categoryType}>{type}</Text>
              <View style={styles.optionsContainer}>
                {publisherList.map((publisher) => (
                  <TouchableOpacity
                    key={publisher}
                    style={[
                      styles.optionButton,
                      publishers.includes(publisher) && styles.optionButtonSelected
                    ]}
                    onPress={() => togglePublisher(publisher)}
                  >
                    <Text style={[
                      styles.optionText,
                      publishers.includes(publisher) && styles.optionTextSelected
                    ]}>
                      {publisher}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>설정 저장</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 30,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(128, 253, 143, 0.5)',
    borderColor: '#80FD8F',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#80FD8F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    height: 40,
  },
});