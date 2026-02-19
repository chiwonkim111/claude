/**
 * MarketValueScreen — 마켓 밸류 화면
 * - MarketValueChart 컴포넌트 + 스킬 분석 + 이력 변화 + 재계산 버튼
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import MarketValueChart from '@/components/MarketValueChart/MarketValueChart'
import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import Badge from '@/components/Badge/Badge'
import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { getMarketValue, calculateMarketValue, getHistory } from '@/api/market-value.api'
import { colors, typography, spacing } from '@/styles/tokens'

const MarketValueScreen: React.FC = memo(() => {
  const [marketValue, setMarketValue] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [mv, hist] = await Promise.all([getMarketValue(), getHistory()])
      setMarketValue(mv)
      setHistory((hist as any[]).slice(0, 4))
    } catch (error: unknown) {
      const code = (error as any)?.response?.data?.error?.code
      if (code === 'MARKET_VALUE_INSUFFICIENT_DATA') {
        setToast({ type: 'info', message: '데이터 집계 중이에요. 체크인을 완료해주세요!' })
      } else {
        setToast({ type: 'error', message: '마켓 밸류를 불러오지 못했습니다.' })
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = useCallback(() => { setIsRefreshing(true); loadData() }, [loadData])

  const handleRecalculate = useCallback(async () => {
    setIsCalculating(true)
    try {
      const updated = await calculateMarketValue()
      setMarketValue(updated)
      setToast({ type: 'success', message: '마켓 밸류가 업데이트됐어요!' })
    } catch {
      setToast({ type: 'error', message: '재계산에 실패했습니다.' })
    } finally {
      setIsCalculating(false)
    }
  }, [])

  const getChange = (idx: number, field: string) => {
    if (history.length < idx + 2) return 0
    return (history[idx]?.[field] ?? 0) - (history[idx + 1]?.[field] ?? 0)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>마켓 밸류</Text>
          <Text style={styles.subtitle}>실시간 시장 가치를 확인하세요</Text>
        </View>

        {isLoading ? (
          <>
            <Skeleton height={200} borderRadius={16} style={{ marginBottom: spacing[4] }} />
            <Skeleton height={120} borderRadius={16} style={{ marginBottom: spacing[4] }} />
          </>
        ) : marketValue ? (
          <>
            <MarketValueChart
              salaryMin={marketValue.salaryMin}
              salaryMax={marketValue.salaryMax}
              hireProbability={marketValue.hireProbability}
              changeMin={getChange(0, 'salaryMin')}
              changeMax={getChange(0, 'salaryMax')}
              sampleCount={marketValue.sampleCount}
              percentile={marketValue.positioning?.percentile}
            />

            {/* 강점/약점 스킬 */}
            {marketValue.positioning && (
              <Card variant="outlined" style={styles.card}>
                <Text style={styles.cardTitle}>스킬 분석</Text>
                {marketValue.positioning.strengths?.length > 0 && (
                  <View style={styles.skillSection}>
                    <View style={styles.skillLabel}>
                      <Ionicons name="trending-up" size={14} color={colors.success} />
                      <Text style={styles.skillLabelText}>강점 스킬</Text>
                    </View>
                    <View style={styles.skillTags}>
                      {(marketValue.positioning.strengths as string[]).map((s: string) => (
                        <Badge key={s} variant="success" label={s} />
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            )}

            {/* 이력 */}
            {history.length > 1 && (
              <Card variant="default" style={styles.card}>
                <Text style={styles.cardTitle}>분기별 변화 이력</Text>
                {history.map((h, i) => (
                  <View key={h.id ?? i} style={styles.histRow}>
                    <Text style={styles.histDate}>{new Date(h.calculatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })}</Text>
                    <Text style={[styles.histSalary, i === 0 && styles.histSalaryActive]}>{h.salaryMin?.toLocaleString()}~{h.salaryMax?.toLocaleString()}만원</Text>
                  </View>
                ))}
              </Card>
            )}

            <Button label="마켓 밸류 재계산" variant="outline" size="lg" loading={isCalculating} onPress={handleRecalculate} style={styles.recalcBtn} />
            <Text style={styles.updatedAt}>마지막 업데이트: {new Date(marketValue.updatedAt).toLocaleDateString('ko-KR')}</Text>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyText}>체크인을 완료하면{'\n'}마켓 밸류가 자동으로 계산돼요!</Text>
          </View>
        )}
      </ScrollView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
})

MarketValueScreen.displayName = 'MarketValueScreen'

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing[5], paddingBottom: spacing[10] },
  header: { paddingBottom: spacing[4] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  card: { marginTop: spacing[4] },
  cardTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  skillSection: { marginBottom: spacing[2] },
  skillLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[2] },
  skillLabelText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  histRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  histDate: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  histSalary: { fontSize: typography.fontSize.sm, color: colors.textPrimary },
  histSalaryActive: { fontWeight: typography.fontWeight.bold, color: colors.primary },
  recalcBtn: { marginTop: spacing[5] },
  updatedAt: { fontSize: typography.fontSize.xs, color: colors.gray400, textAlign: 'center', marginTop: spacing[3] },
  empty: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] },
  emptyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})

export default MarketValueScreen
