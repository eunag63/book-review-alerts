import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';

interface NotificationSettings {
  genres: string[];           // ['문학', '비문학']
  authorGenders: string[];    // ['여성 작가', '남성 작가']  
  nationalities: string[];    // ['한국', '일본', '미국' 등]
  publishers: string[];       // ['문학동네', '민음사' 등]
}

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    genres: [],
    authorGenders: [],
    nationalities: [],
    publishers: []
  });

  // 사용 가능한 옵션들 (실제로는 API에서 가져와야 함)
  const availableGenres = ['문학', '비문학'];
  const availableAuthorGenders = ['여성 작가', '남성 작가'];
  const [availableNationalities, setAvailableNationalities] = useState<string[]>(['한국', '일본', '미국', '영국', '중국']);
  const [availablePublishers, setAvailablePublishers] = useState<string[]>(['문학동네', '민음사', '창비', '열린책들', '김영사']);

  // 설정 토글 함수
  const toggleGenre = (genre: string) => {
    setSettings(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) 
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const toggleAuthorGender = (gender: string) => {
    setSettings(prev => ({
      ...prev,
      authorGenders: prev.authorGenders.includes(gender)
        ? prev.authorGenders.filter(g => g !== gender)
        : [...prev.authorGenders, gender]
    }));
  };

  const toggleNationality = (nationality: string) => {
    setSettings(prev => ({
      ...prev,
      nationalities: prev.nationalities.includes(nationality)
        ? prev.nationalities.filter(n => n !== nationality)
        : [...prev.nationalities, nationality]
    }));
  };

  const togglePublisher = (publisher: string) => {
    setSettings(prev => ({
      ...prev,
      publishers: prev.publishers.includes(publisher)
        ? prev.publishers.filter(p => p !== publisher)
        : [...prev.publishers, publisher]
    }));
  };

  // 설정 저장
  const saveSettings = () => {
    // TODO: Supabase에 저장하기
    console.log('알림 설정 저장:', settings);
    Alert.alert('저장 완료', '알림 설정이 저장되었습니다.');
  };

  // 전체 선택/해제
  const toggleAllGenres = () => {
    const allSelected = availableGenres.every(genre => settings.genres.includes(genre));
    setSettings(prev => ({
      ...prev,
      genres: allSelected ? [] : [...availableGenres]
    }));
  };

  const toggleAllNationalities = () => {
    const allSelected = availableNationalities.every(nationality => settings.nationalities.includes(nationality));
    setSettings(prev => ({
      ...prev,
      nationalities: allSelected ? [] : [...availableNationalities]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>📱 알림 설정</Text>
        <Text style={styles.subtitle}>관심있는 서평단 조건을 설정하세요</Text>

        {/* 장르 설정 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 장르</Text>
            <TouchableOpacity onPress={toggleAllGenres}>
              <Text style={styles.toggleAllText}>전체 {
                availableGenres.every(genre => settings.genres.includes(genre)) ? '해제' : '선택'
              }</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            {availableGenres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.optionButton,
                  settings.genres.includes(genre) && styles.optionButtonSelected
                ]}
                onPress={() => toggleGenre(genre)}
              >
                <Text style={[
                  styles.optionText,
                  settings.genres.includes(genre) && styles.optionTextSelected
                ]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 작가 성별 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 작가 성별</Text>
          <View style={styles.optionsContainer}>
            {availableAuthorGenders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  settings.authorGenders.includes(gender) && styles.optionButtonSelected
                ]}
                onPress={() => toggleAuthorGender(gender)}
              >
                <Text style={[
                  styles.optionText,
                  settings.authorGenders.includes(gender) && styles.optionTextSelected
                ]}>
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 국가 설정 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌍 국가</Text>
            <TouchableOpacity onPress={toggleAllNationalities}>
              <Text style={styles.toggleAllText}>전체 {
                availableNationalities.every(nationality => settings.nationalities.includes(nationality)) ? '해제' : '선택'
              }</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            {availableNationalities.map((nationality) => (
              <TouchableOpacity
                key={nationality}
                style={[
                  styles.optionButton,
                  settings.nationalities.includes(nationality) && styles.optionButtonSelected
                ]}
                onPress={() => toggleNationality(nationality)}
              >
                <Text style={[
                  styles.optionText,
                  settings.nationalities.includes(nationality) && styles.optionTextSelected
                ]}>
                  {nationality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 출판사 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 출판사</Text>
          <View style={styles.optionsContainer}>
            {availablePublishers.map((publisher) => (
              <TouchableOpacity
                key={publisher}
                style={[
                  styles.optionButton,
                  settings.publishers.includes(publisher) && styles.optionButtonSelected
                ]}
                onPress={() => togglePublisher(publisher)}
              >
                <Text style={[
                  styles.optionText,
                  settings.publishers.includes(publisher) && styles.optionTextSelected
                ]}>
                  {publisher}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>💾 설정 저장</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 30,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'semibold',
    color: '#ffffff',
    marginBottom: 16,
  },
  toggleAllText: {
    color: '#80FD8F',
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#0a0a0a',
  },
  optionButtonSelected: {
    backgroundColor: '#80FD8F',
    borderColor: '#80FD8F',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#0a0a0a',
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