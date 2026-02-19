/**
 * Card 컴포넌트
 * - variant: default (흰 배경) / elevated (그림자) / outlined (테두리)
 * - onPress 지정 시 터치 가능한 카드
 */
import React, { memo } from 'react'
import { View, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { colors, spacing, borderRadius, shadows } from '@/styles/tokens'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

const Card = memo<CardProps>(({ children, variant = 'default', onPress, style, accessibilityLabel }) => {
  const cardStyle = [styles.base, styles[`variant_${variant}`], style]

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    )
  }

  return <View style={cardStyle}>{children}</View>
})

Card.displayName = 'Card'

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
  },
  variant_default: {
    backgroundColor: colors.white,
  } as ViewStyle,
  variant_elevated: {
    backgroundColor: colors.white,
    ...shadows.md,
  } as ViewStyle,
  variant_outlined: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
})

export default Card
