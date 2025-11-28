import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function OnboardingButton({ title, onPress, disabled = false, style }: OnboardingButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, disabled && styles.buttonDisabled, style]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#80FD8F',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#333333',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#666666',
  },
});