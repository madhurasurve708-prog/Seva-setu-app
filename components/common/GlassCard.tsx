// components/common/GlassCard.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export { GlassCard };
export default GlassCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    ...SHADOWS.soft,
  },
});