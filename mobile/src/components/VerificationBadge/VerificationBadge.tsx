/**
 * VerificationBadge — 동료 인증 배지
 * - 인증 완료: 초록색 shield 아이콘 + 인증 수
 * - 인증 대기: 회색 clock 아이콘
 */
import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius } from '@/styles/tokens'

interface VerificationBadgeProps {
  isVerified: boolean
  count: number
}

const VerificationBadge = memo<VerificationBadgeProps>(({ isVerified, count }) => {
  const iconName = isVerified ? 'shield-checkmark' : 'time-outline'
  const bgColor = isVerified ? colors.successBg : colors.gray100
  const iconColor = isVerified ? colors.success : colors.gray500
  const textColor = isVerified ? colors.success : colors.gray500

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName as any} size={12} color={iconColor} />
      <Text style={[styles.label, { color: textColor }]}>
        {isVerified ? `인증 ${count}` : '인증 대기'}
      </Text>
    </View>
  )
})

VerificationBadge.displayName = 'VerificationBadge'

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
})

export default VerificationBadge
