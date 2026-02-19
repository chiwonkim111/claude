/**
 * ProfileCompletionBar 컴포넌트 — 프로필 완성도 프로그레스 바
 * - 0~100% 시각화
 * - Reanimated 진입 애니메이션
 * - compact 모드 (홈 화면 등 소형 표시용)
 */
import React, { memo, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { colors, typography, spacing, borderRadius } from '@/styles/tokens'

interface ProfileCompletionBarProps {
  score: number    // 0~100
  compact?: boolean
}

const ProfileCompletionBar = memo<ProfileCompletionBarProps>(({ score, compact = false }) => {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(Math.min(100, Math.max(0, score)) / 100, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    })
  }, [score, progress])

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  // 점수에 따른 색상
  const barColor = score >= 80 ? colors.success : score >= 50 ? colors.primary : colors.warning

  const levelLabel = score >= 80 ? '높음' : score >= 50 ? '보통' : '낮음'

  return (
    <View style={compact ? styles.containerCompact : styles.container}>
      {!compact && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>프로필 완성도</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: barColor }]}>{score}%</Text>
            <Text style={styles.level}> · {levelLabel}</Text>
          </View>
        </View>
      )}

      <View style={compact ? styles.trackCompact : styles.track}>
        <Animated.View
          style={[
            compact ? styles.fillCompact : styles.fill,
            { backgroundColor: barColor },
            barStyle,
          ]}
        />
      </View>

      {compact && (
        <Text style={styles.scoreCompact}>{score}%</Text>
      )}
    </View>
  )
})

ProfileCompletionBar.displayName = 'ProfileCompletionBar'

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  level: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
  },
  track: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  trackCompact: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fillCompact: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  scoreCompact: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
})

export default ProfileCompletionBar
