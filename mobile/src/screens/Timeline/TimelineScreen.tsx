/**
 * TimelineScreen — 성과 타임라인 화면
 * - 필터 탭: 전체 / 인증완료 / 인증대기
 * - AchievementCard 목록
 * - FAB(+) 버튼: 성과 수동 등록
 * - Skeleton 로딩 상태
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import AchievementCard from '@/components/AchievementCard/AchievementCard'
import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { getAchievements } from '@/api/achievement.api'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

type FilterType = 'all' | 'verified' | 'pending'

const FILTERS: Array<{ key: FilterType; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'verified', label: '인증완료' },
  { key: 'pending', label: '인증대기' },
]

const TimelineScreen: React.FC = memo(() => {
  const [achievements, setAchievements] = useState<any[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const loadAchievements = useCallback(async () => {
    try {
      const { data, error } = await getAchievements()
      if (error) throw error
      setAchievements(data ?? [])
    } catch {
      setToast({ type: 'error', message: '성과 목록을 불러오지 못했습니다.' })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { loadAchievements() }, [loadAchievements])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadAchievements()
  }, [loadAchievements])

  // 필터 적용
  // Supabase 스키마 필드명: is_verified
  const filtered = achievements.filter((a) => {
    if (activeFilter === 'verified') return a.is_verified
    if (activeFilter === 'pending') return !a.is_verified
    return true
  })

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>성과 타임라인</Text>
        <Text style={styles.subtitle}>{achievements.length}개의 성과</Text>
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, activeFilter === f.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(f.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === f.key }}
          >
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {isLoading
          ? [1, 2, 3].map((i) => <Skeleton key={i} height={120} borderRadius={16} style={{ marginBottom: spacing[3] }} />)
          : filtered.length > 0
          ? filtered.map((a) => <AchievementCard key={a.id} achievement={a} />)
          : (
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>성과가 없어요{'\n'}체크인을 완료하거나 직접 추가해보세요!</Text>
            </View>
          )
        }
      </ScrollView>

      {/* FAB 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setToast({ type: 'info', message: '성과 등록 기능 — 준비 중이에요!' })}
        accessibilityLabel="성과 추가"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
})

TimelineScreen.displayName = 'TimelineScreen'

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[2] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  subtitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing[5], paddingBottom: spacing[3], gap: spacing[2] },
  filterTab: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: borderRadius.full, backgroundColor: colors.gray100, minHeight: 36, justifyContent: 'center' },
  filterTabActive: { backgroundColor: colors.primary },
  filterText: { fontSize: typography.fontSize.sm, color: colors.gray500, fontWeight: typography.fontWeight.medium },
  filterTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing[5], paddingBottom: spacing[16] },
  empty: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] },
  emptyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute', bottom: spacing[6], right: spacing[5],
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
})

export default TimelineScreen
