/**
 * MarketValueScreen — 마켓밸류 탭
 * 레퍼런스: reference_img/마켓밸류.png
 *
 * 섹션 구성 (다크 테마 전체):
 *   A. 프로필 섹션 — 아바타 + 직함 + 전문가 수준 뱃지
 *   B. 총 예상 시장 가치 카드 — 연봉 범위 + 변화율
 *   C. 채용 가능성 카드 — 원형 표시 + 비율
 *   D. 연봉 벤치마크 카드 — 시장 평균 / 내 프로필 / 상위 10%
 *   E. 핵심 역량 섹션 — 스킬 2x2 그리드
 *   F. 최적 맞춤 역할 — 준비중 카드
 *   G. 하단 재계산 버튼
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { getMarketValue, getHistory, calculateMarketValue } from '@/api/market-value.api'
import { getProfile } from '@/api/profile.api'
import { useAuthStore } from '@/stores/auth.store'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

// ─── 원형 채용 가능성 차트 ───────────────────────────

interface DonutProps { value: number } // 0~100

const DonutChart = memo<DonutProps>(({ value }) => (
  <View style={donutStyles.wrap}>
    <View style={donutStyles.ring}>
      <Text style={donutStyles.valueText}>{Math.round(value)}%</Text>
    </View>
  </View>
))
DonutChart.displayName = 'DonutChart'

const donutStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', marginVertical: spacing[4] },
  ring: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 16, borderColor: colors.ignition,
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  valueText: { fontSize: 36, fontWeight: '700', color: colors.white },
})

// ─── 연봉 벤치마크 바 ────────────────────────────────

interface BenchmarkBarProps {
  label: string
  value: number
  max: number
  highlight?: boolean
}

const BenchmarkBar = memo<BenchmarkBarProps>(({ label, value, max, highlight }) => {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text style={[barStyles.label, highlight && barStyles.labelHighlight]}>{label}</Text>
        <Text style={[barStyles.value, highlight && barStyles.valueHighlight]}>
          {value.toLocaleString()}만원
        </Text>
      </View>
      <View style={barStyles.track}>
        <View style={[barStyles.fill, { width: `${pct}%` as any }, highlight && barStyles.fillHighlight]} />
      </View>
    </View>
  )
})
BenchmarkBar.displayName = 'BenchmarkBar'

const barStyles = StyleSheet.create({
  row: { marginBottom: spacing[4] },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] },
  label: { fontSize: typography.fontSize.sm, color: '#999999' },
  labelHighlight: { color: colors.white, fontWeight: typography.fontWeight.semibold },
  value: { fontSize: typography.fontSize.sm, color: '#999999' },
  valueHighlight: { color: colors.ignition, fontWeight: typography.fontWeight.bold },
  track: { height: 6, backgroundColor: '#2A2A2A', borderRadius: borderRadius.full, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#444444', borderRadius: borderRadius.full },
  fillHighlight: { backgroundColor: colors.ignition },
})

// ─── 핵심 역량 카드 ──────────────────────────────────

const SKILL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Product Management': 'grid-outline',
  'Data Analysis': 'bar-chart-outline',
  'User Research': 'people-outline',
  'Architecture': 'construct-outline',
  'Leadership': 'ribbon-outline',
}
const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'star-outline'

// ─── 메인 컴포넌트 ────────────────────────────────────

const MarketValueScreen: React.FC = memo(() => {
  const user = useAuthStore((s) => s.user)

  const [marketValue, setMarketValue] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // ─── 데이터 로드 ─────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [mvRes, histRes, profRes] = await Promise.all([
        getMarketValue(),
        getHistory(),
        getProfile(),
      ])
      if (mvRes.data) setMarketValue(mvRes.data)
      setHistory((histRes.data ?? []) as any[])
      if (profRes.data) setProfileData(profRes.data)
    } catch {
      setToast({ type: 'error', message: '마켓 밸류를 불러오지 못했습니다.' })
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
      const { error } = await calculateMarketValue()
      if (error) throw error
      await loadData()
      setToast({ type: 'success', message: '마켓 밸류가 업데이트됐어요!' })
    } catch {
      setToast({ type: 'info', message: 'Edge Function이 아직 배포되지 않았어요.' })
    } finally {
      setIsCalculating(false)
    }
  }, [loadData])

  // ─── 파생값 ────────────────────────────────────────

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '사용자'
  const initial = displayName.charAt(0).toUpperCase()
  const jobTitle = profileData?.job_title ?? '직함 미등록'
  const company = profileData?.company ?? ''

  // 전분기 대비 변화
  const prevMv = history.length > 1 ? history[1] : null
  const changeMin = marketValue && prevMv ? (marketValue.salary_min ?? 0) - (prevMv.salary_min ?? 0) : 0
  const changePct = prevMv?.salary_min ? ((changeMin / prevMv.salary_min) * 100).toFixed(1) : null

  // 채용 가능성 수준 레이블
  const hirePct = marketValue?.hire_probability ?? 0
  const hireLabel = hirePct >= 80 ? '매우 높음' : hirePct >= 60 ? '높음' : hirePct >= 40 ? '보통' : '낮음'

  // 연봉 벤치마크 최댓값
  const benchmarkMax = (marketValue?.salary_max ?? 0) * 1.2

  // 핵심 역량 (strengths 배열)
  const strengths: string[] = marketValue?.metadata?.positioning?.strengths ?? profileData?.profile_skills?.map((ps: any) => ps.skills?.name).filter(Boolean) ?? []

  // ─── 렌더 ──────────────────────────────────────────

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} edges={['top']} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.ignition} />}
      >
        {/* ── A. 프로필 섹션 ───────────────────── */}
        <View style={styles.profileSection}>
          {/* 아바타 */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={10} color={colors.white} />
            </View>
          </View>
          <Text style={styles.profileTitle}>{jobTitle}</Text>
          <View style={styles.profileMeta}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>전문가 수준</Text>
            </View>
            {company ? <Text style={styles.profileCompany}>• {company}</Text> : null}
          </View>
        </View>

        {isLoading ? (
          <>
            <Skeleton height={140} borderRadius={16} style={styles.card} />
            <Skeleton height={220} borderRadius={16} style={styles.card} />
            <Skeleton height={160} borderRadius={16} style={styles.card} />
          </>
        ) : marketValue ? (
          <>
            {/* ── B. 총 예상 시장 가치 ─────────── */}
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>총 예상 시장 가치</Text>
                <Ionicons name="information-circle-outline" size={16} color="#666" />
              </View>
              <Text style={styles.salaryRange}>
                {(marketValue.salary_min ?? 0).toLocaleString()}만원{'\n'}~ {(marketValue.salary_max ?? 0).toLocaleString()}만원
              </Text>
              {changePct !== null && (
                <View style={styles.changeRow}>
                  <Ionicons name={changeMin >= 0 ? 'trending-up' : 'trending-down'} size={16} color={changeMin >= 0 ? colors.success : colors.error} />
                  <Text style={[styles.changeText, { color: changeMin >= 0 ? colors.success : colors.error }]}>
                    {changeMin >= 0 ? '+' : ''}{changePct}%
                  </Text>
                </View>
              )}
              <Text style={styles.cardDesc}>
                최근 채용 사례와 현재 기술 수요 지수를 기반으로 계산되었습니다.
              </Text>
            </View>

            {/* ── C. 채용 가능성 ────────────────── */}
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <Text style={styles.cardLabel}>채용 가능성</Text>
                <View style={[styles.hireBadge, hirePct >= 80 && styles.hireBadgeHigh]}>
                  <Text style={styles.hireBadgeText}>{hireLabel}</Text>
                </View>
              </View>
              <DonutChart value={hirePct} />
              <Text style={styles.cardDesc}>
                현재 프로필 기준 상위 {(100 - (marketValue.metadata?.positioning?.percentile ?? 50)).toFixed(0)}%에 해당합니다.
              </Text>
            </View>

            {/* ── D. 연봉 벤치마크 ──────────────── */}
            <View style={styles.card}>
              <Text style={[styles.cardLabel, { marginBottom: spacing[4] }]}>연봉 벤치마크 (만원 단위)</Text>
              <BenchmarkBar
                label="시장 평균"
                value={Math.round((marketValue.salary_min + marketValue.salary_max) / 2 * 0.85)}
                max={benchmarkMax}
              />
              <BenchmarkBar
                label="내 프로필"
                value={Math.round((marketValue.salary_min + marketValue.salary_max) / 2)}
                max={benchmarkMax}
                highlight
              />
              <BenchmarkBar
                label="상위 10%"
                value={Math.round(marketValue.salary_max * 1.15)}
                max={benchmarkMax}
              />
            </View>

            {/* ── E. 핵심 역량 ──────────────────── */}
            {strengths.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>핵심 역량</Text>
                  <TouchableOpacity onPress={() => setToast({ type: 'info', message: '매트릭스 보기 — 준비 중이에요!' })}>
                    <Text style={styles.sectionLink}>매트릭스 보기 ↗</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.skillGrid}>
                  {strengths.slice(0, 4).map((skill: string) => (
                    <View key={skill} style={styles.skillCard}>
                      <Ionicons name={SKILL_ICONS[skill] ?? DEFAULT_ICON} size={24} color={colors.ignition} />
                      <Text style={styles.skillName}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* ── F. 최적 맞춤 역할 ─────────────── */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionTitle}>최적 맞춤 역할</Text>
              <View style={styles.roleCard}>
                <View style={styles.roleIconWrap}>
                  <Ionicons name="briefcase-outline" size={22} color={colors.ignition} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleName}>맞춤 역할 분석 중</Text>
                  <Text style={styles.roleCompany}>AI 분석 기능 — 준비 중이에요</Text>
                </View>
              </View>
            </View>

            {/* 분기별 이력 */}
            {history.length > 1 && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.sectionTitle, { marginBottom: spacing[3] }]}>분기별 변화 이력</Text>
                {history.map((h, i) => (
                  <View key={h.id ?? i} style={styles.histRow}>
                    <Text style={styles.histDate}>{h.year}년 {h.quarter}</Text>
                    <Text style={[styles.histSalary, i === 0 && styles.histSalaryActive]}>
                      {(h.salary_min ?? 0).toLocaleString()}~{(h.salary_max ?? 0).toLocaleString()}만원
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={48} color="#444" />
            <Text style={styles.emptyText}>체크인을 완료하면{'\n'}마켓 밸류가 자동으로 계산돼요!</Text>
          </View>
        )}

        <View style={{ height: spacing[16] }} />
      </ScrollView>

      {/* ── G. 하단 고정 재계산 버튼 ────────────── */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.recalcBtn, isCalculating && { opacity: 0.7 }]}
          onPress={handleRecalculate}
          disabled={isCalculating}
          activeOpacity={0.85}
        >
          <Text style={styles.recalcBtnText}>
            {isCalculating ? '계산 중...' : '마켓밸류 재계산  📊'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </View>
  )
})

MarketValueScreen.displayName = 'MarketValueScreen'

// ─── 스타일 ──────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.midnight },
  safeTop: { backgroundColor: colors.midnight },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing[4] },

  // 프로필 섹션
  profileSection: { alignItems: 'center', paddingTop: spacing[6], paddingBottom: spacing[5] },
  avatarWrap: { position: 'relative', marginBottom: spacing[3] },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#2A2A2A',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: colors.white },
  checkBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.ignition,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.midnight,
  },
  profileTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.white, marginBottom: spacing[2] },
  profileMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  levelBadge: { backgroundColor: colors.ignition, borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 3 },
  levelBadgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.white },
  profileCompany: { fontSize: typography.fontSize.sm, color: '#888888' },

  // 카드 공통
  card: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    backgroundColor: '#111111',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  cardLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: '#AAAAAA' },
  cardDesc: { fontSize: typography.fontSize.xs, color: '#666666', lineHeight: 18, marginTop: spacing[2] },

  // 연봉 범위
  salaryRange: { fontSize: 28, fontWeight: '700', color: colors.white, lineHeight: 36, marginBottom: spacing[2] },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing[2] },
  changeText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },

  // 채용 가능성 뱃지
  hireBadge: { backgroundColor: '#1A3A1A', borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 3 },
  hireBadgeHigh: { backgroundColor: '#1A3A1A' },
  hireBadgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.success },

  // 섹션
  sectionWrap: { marginHorizontal: spacing[4], marginBottom: spacing[4] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3] },
  sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.white },
  sectionLink: { fontSize: typography.fontSize.xs, color: colors.ignition },

  // 스킬 그리드
  skillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  skillCard: {
    width: '47%',
    backgroundColor: '#111111',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[2],
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  skillName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.white },

  // 역할 카드
  roleCard: {
    backgroundColor: '#111111', borderRadius: borderRadius.xl,
    padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  roleIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  roleName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.white },
  roleCompany: { fontSize: typography.fontSize.xs, color: '#666666', marginTop: 2 },

  // 이력
  histRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  histDate: { fontSize: typography.fontSize.sm, color: '#666666' },
  histSalary: { fontSize: typography.fontSize.sm, color: '#888888' },
  histSalaryActive: { fontWeight: typography.fontWeight.bold, color: colors.ignition },

  // 빈 상태
  empty: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] },
  emptyText: { fontSize: typography.fontSize.sm, color: '#666666', textAlign: 'center', lineHeight: 22 },

  // 하단 버튼
  bottomBar: { backgroundColor: colors.midnight, paddingHorizontal: spacing[5], paddingTop: spacing[3] },
  recalcBtn: {
    backgroundColor: colors.ignition, borderRadius: borderRadius.xl,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  recalcBtnText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.white },
})

export default MarketValueScreen
