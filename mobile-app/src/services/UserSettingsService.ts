import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserSettings {
  interests: string[];
  categories: string[];
  authorGenders: string[];
  publishers: string[];
}

const STORAGE_KEY = '@user_settings';

export const UserSettingsService = {
  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      console.log('사용자 설정 저장됨:', settings);
    } catch (error) {
      console.error('사용자 설정 저장 실패:', error);
    }
  },

  async getSettings(): Promise<UserSettings | null> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        console.log('사용자 설정 로드됨:', settings);
        return settings;
      }
      return null;
    } catch (error) {
      console.error('사용자 설정 로드 실패:', error);
      return null;
    }
  },

  async clearSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('사용자 설정 삭제됨');
    } catch (error) {
      console.error('사용자 설정 삭제 실패:', error);
    }
  }
};