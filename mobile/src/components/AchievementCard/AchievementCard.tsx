/**
 * AchievementCard 컴포넌트 — 성과 타임라인 카드
 * - 제목, 기간, 프로젝트명, 인증 뱃지 표시
 * - isVerified 여부에 따라 인증 마크 표시
 * - onPress: 상세 페이지 이동
 */
import React, { memo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Badge from '@/components/Badge/Badge'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

interface Achievement {
  id: number
  title: string
  description?: string | null
  projectName?: string | null
  periodStart?: string | null
  periodEnd?: string | null
  isVerified: boolean
  verificationCount: number
  source: 'manual' | 'checkin' | 'ai_log'
}

interface AchievementCardProps {
  achievement: Achievement
  onPress?: (id: number) => void
}

const AchievementCard = memo<AchievementCardProps>(({ achievement, onPress }) => {
  const formatDate = (d: string | null | undefined) => {
    if (!d) return null
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
  }

  const periodText = [formatDate(achievement.periodStart), formatDate(achievement.periodEnd)]
    .filter(Boolean)
    .join(' ~ ')

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(achievement.id)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`성과: ${achievement.title}`}
    >
      {/* 상단 행: 제목 + 인증 아이콘 */}
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={2}>{achievement.title}</Text>
        {achievement.isVerified && (
          <Ionicons name="shield-checkmark" size={20} color={colors.success} style={styles.verifiedIcon} />
        )}
      </View>

      {/* 프로젝트명 */}
      {achievement.projectName && (
        <Text style={styles.projectName} numberOfLines={1}>
          <Ionicons name="folder-outline" size={12} color={colors.gray400} /> {achievement.projectName}
        </Text>
      )}

      {/* 기간 */}
      {periodText && (
        <Text style={styles.period}>{periodText}</Text>
      )}

      {/* 하단 행: 출처 뱃지 + 인증 카운트 */}
      <View style={styles.bottomRow}>
        <Badge
          variant={achievement.source === 'checkin' ? 'primary' : 'gray'}
          label={achievement.source === 'checkin' ? '체크인' : '직접 입력'}
        />
        {achievement.verificationCount > 0 && (
          <View style={styles.verifyCount}>
            <Ionicons name="people" size={12} color={colors.success} />
            <Text style={styles.verifyCountText}>{achievement.verificationCount}명 인증</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
})

AchievementCard.displayName = 'AchievementCard'

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  verifiedIcon: {
    marginLeft: spacing[2],
    marginTop: 2,
  },
  projectName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  period: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    marginBottom: spacing[3],
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifyCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifyCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
})

export default AchievementCard
