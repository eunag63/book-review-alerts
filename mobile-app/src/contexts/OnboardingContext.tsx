import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserSettings, UserSettingsService } from '../services/UserSettingsService';
import { NotificationService } from '../services/NotificationService';

interface OnboardingContextType {
  interests: string[];
  categories: string[];
  authorGenders: string[];
  publishers: string[];
  setInterests: (interests: string[]) => void;
  setCategories: (categories: string[]) => void;
  setAuthorGenders: (genders: string[]) => void;
  setPublishers: (publishers: string[]) => void;
  saveAllSettings: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [interests, setInterests] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [authorGenders, setAuthorGenders] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);

  const saveAllSettings = async () => {
    const settings: UserSettings = {
      interests,
      categories,
      authorGenders,
      publishers,
    };
    
    // AsyncStorage에 저장
    await UserSettingsService.saveSettings(settings);
    
    // Firebase 토픽 구독 업데이트
    await NotificationService.updateTopicSubscriptions(settings);
  };

  return (
    <OnboardingContext.Provider
      value={{
        interests,
        categories,
        authorGenders,
        publishers,
        setInterests,
        setCategories,
        setAuthorGenders,
        setPublishers,
        saveAllSettings,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};