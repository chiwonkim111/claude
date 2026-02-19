/**
 * Button 컴포넌트 — 원자 단위 버튼
 * - variant: primary / secondary / outline / ghost
 * - size: sm / md / lg
 * - loading, disabled 상태 지원
 * - 최소 44px 높이로 터치 타겟 보장 (WCAG 2.1 AA)
 */
import React, { memo } from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native'
import { colors, typography, spacing, borderRadius, touchTarget } from '@/styles/tokens'

interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

const Button = memo<ButtonProps>(({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'secondary' ? colors.white : colors.primary}
        />
      ) : (
        <Text style={[styles.label, styles[`labelVariant_${variant}`], styles[`labelSize_${size}`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
})

Button.displayName = 'Button'

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: touchTarget.minHeight,
  } as ViewStyle,

  // Variant 스타일
  variant_primary: { backgroundColor: colors.primary } as ViewStyle,
  variant_secondary: { backgroundColor: colors.secondary } as ViewStyle,
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  } as ViewStyle,
  variant_ghost: { backgroundColor: 'transparent' } as ViewStyle,

  // Size 스타일
  size_sm: { paddingHorizontal: spacing[3], height: 36, minHeight: 36 } as ViewStyle,
  size_md: { paddingHorizontal: spacing[4], height: 44 } as ViewStyle,
  size_lg: { paddingHorizontal: spacing[5], height: 52 } as ViewStyle,

  disabled: { opacity: 0.5 } as ViewStyle,

  // 레이블 기본
  label: {
    fontWeight: typography.fontWeight.semibold,
  } as TextStyle,

  // 레이블 Variant
  labelVariant_primary: { color: colors.white } as TextStyle,
  labelVariant_secondary: { color: colors.white } as TextStyle,
  labelVariant_outline: { color: colors.primary } as TextStyle,
  labelVariant_ghost: { color: colors.primary } as TextStyle,

  // 레이블 Size
  labelSize_sm: { fontSize: typography.fontSize.sm } as TextStyle,
  labelSize_md: { fontSize: typography.fontSize.base } as TextStyle,
  labelSize_lg: { fontSize: typography.fontSize.lg } as TextStyle,
})

export default Button
