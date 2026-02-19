/**
 * MarketValueChart 컴포넌트 — 마켓 밸류 시각화
 * - 연봉 범위 Bar + 채용 확률 게이지 표시
 * - 이전 대비 변화량 (▲/▼ 화살표 + 색상)
 * - Reanimated 진입 애니메이션
 */
import React, { memo, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

interface MarketValueChartProps {
  salaryMin: number
  salaryMax: number
  hireProbability: number
  changeMin?: number
  changeMax?: number
  sampleCount?: number
  percentile?: number
}

const MarketValueChart = memo<MarketValueChartProps>(({
  salaryMin,
  salaryMax,
  hireProbability,
  changeMin = 0,
  changeMax = 0,
  sampleCount = 0,
  percentile = 0,
}) => {
  // 채용 확률 게이지 애니메이션 (0 → 실제 값)
  const gaugeWidth = useSharedValue(0)

  useEffect(() => {
    gaugeWidth.value = withTiming(hireProbability / 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    })
  }, [hireProbability, gaugeWidth])

  const gaugeAnimatedStyle = useAnimatedStyle(() => ({
    width: `${gaugeWidth.value * 100}%`,
  }))

  // 변화량 표시 텍스트
  const renderChange = (change: number) => {
    if (change === 0) return null
    const isPositive = change > 0
    return (
      <View style={styles.changeRow}>
        <Ionicons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={12}
          color={isPositive ? colors.success : colors.error}
        />
        <Text style={[styles.changeText, { color: isPositive ? colors.success : colors.error }]}>
          {isPositive ? '+' : ''}{change.toLocaleString()}만원
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      {/* 제목 */}
      <Text style={styles.cardTitle}>내 마켓 밸류</Text>
      {sampleCount > 0 && (
        <Text style={styles.sampleCount}>동일 직무 {sampleCount.toLocaleString()}명 기준</Text>
      )}

      {/* 연봉 범위 */}
      <View style={styles.salarySection}>
        <Text style={styles.salaryLabel}>예상 연봉 범위</Text>
        <Text style={styles.salaryRange}>
          {salaryMin.toLocaleString()}만원 ~ {salaryMax.toLocaleString()}만원
        </Text>
        <View style={styles.changeContainer}>
          {renderChange(changeMin)}
          {renderChange(changeMax)}
        </View>
      </View>

      {/* 채용 확률 게이지 */}
      <View style={styles.gaugeSection}>
        <View style={styles.gaugeLabelRow}>
          <Text style={styles.gaugeLabel}>채용 제안 확률</Text>
          <Text style={styles.gaugePct}>{hireProbability.toFixed(0)}%</Text>
        </View>
        <View style={styles.gaugeTrack}>
          <Animated.View
            style={[
              styles.gaugeFill,
              { backgroundColor: hireProbability >= 70 ? colors.success : hireProbability >= 40 ? colors.warning : colors.error },
              gaugeAnimatedStyle,
            ]}
          />
        </View>
      </View>

      {/* 퍼센타일 */}
      {percentile > 0 && (
        <View style={styles.percentileRow}>
          <Ionicons name="podium-outline" size={14} color={colors.primary} />
          <Text style={styles.percentileText}>동일 직무 상위 {100 - percentile}%</Text>
        </View>
      )}
    </View>
  )
})

MarketValueChart.displayName = 'MarketValueChart'

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sampleCount: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    marginBottom: spacing[4],
  },
  salarySection: {
    marginBottom: spacing[5],
  },
  salaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[1],
  },
  salaryRange: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  changeContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  gaugeSection: {
    marginBottom: spacing[3],
  },
  gaugeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  gaugeLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  gaugePct: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  percentileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[2],
  },
  percentileText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
})

export default MarketValueChart
