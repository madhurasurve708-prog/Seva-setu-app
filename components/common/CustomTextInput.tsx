import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface CustomTextInputProps extends TextInputProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export default function CustomTextInput({
  icon,
  label,
  error,
  secureTextEntry,
  style,
  ...props
}: CustomTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          style as any,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={error ? COLORS.danger : isFocused ? COLORS.accent : COLORS.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          placeholderTextColor="#A6ADB8"
          style={styles.input}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0, // Fix vertical alignment on Android
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '600',
  },
});
