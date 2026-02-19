/**
 * Badge 컴포넌트 — 상태/카테고리 표시 뱃지
 * - variant: success / warning / error / primary / gray
 * - 아이콘 + 텍스트 조합 지원
 */
import React, { memo } from 'react'
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius } from '@/styles/tokens'

type BadgeVariant = 'success' | 'warning' | 'error' | 'primary' | 'gray'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  iconName?: keyof typeof Ionicons.glyphMap
  style?: StyleProp<ViewStyle>
}

// Variant별 색상 매핑
const variantColors: Record<BadgeVariant, { bg: string; text: string; icon: string }> = {
  success: { bg: colors.successBg, text: colors.success, icon: colors.success },
  warning: { bg: colors.warningBg, text: colors.warning, icon: colors.warning },
  error: { bg: colors.errorBg, text: colors.error, icon: colors.error },
  primary: { bg: colors.primaryBg, text: colors.primary, icon: colors.primary },
  gray: { bg: colors.gray100, text: colors.gray600, icon: colors.gray500 },
}

const Badge = memo<BadgeProps>(({ label, variant = 'gray', iconName, style }) => {
  const vc = variantColors[variant]

  return (
    <View style={[styles.badge, { backgroundColor: vc.bg }, style]}>
      {iconName && (
        <Ionicons name={iconName} size={12} color={vc.icon} style={styles.icon} />
      )}
      <Text style={[styles.label, { color: vc.text }]}>{label}</Text>
    </View>
  )
})

Badge.displayName = 'Badge'

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
})

export default Badge
