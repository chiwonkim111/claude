/**
 * GrowthScreen — 성장 탭 (신규)
 * 레퍼런스: reference_img/성장.png
 *
 * 섹션 구성:
 *   A. 프로필 미니 헤더 — 아바타 + 이름 + 직함 + 목표 한 줄
 *   B. 필터 토글 — 시간순 / 성과 중심
 *   C. 타임라인 카드 목록 — 날짜, 제목, 설명, 스킬 태그
 *   D. FAB(+) 버튼 — 성과 추가
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { getProfile } from '@/api/profile.api'
import { getAchievements } from '@/api/achievement.api'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

// ─── 타입 ───────────────────────────────────────────

interface Achievement {
  id: string
  title: string
  description?: string | null
  project_name?: string | null
  started_at?: string | null
  ended_at?: string | null
  is_verified: boolean
}

type FilterType = 'time' | 'impact'

// ─── 유틸 ────────────────────────────────────────────

/** 날짜 포맷: "2023년 9월" 형식 */
const fmtMonth = (d: string | null | undefined) => {
  if (!d) return ''
  const dt = new Date(d)
  return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월`
}

// ─── 타임라인 아이콘 결정 ───────────────────────────

const getTimelineIcon = (a: Achievement): keyof typeof Ionicons.glyphMap => {
  if (a.is_verified) return 'shield-checkmark'
  return 'trending-up'
}

// ─── 메인 컴포넌트 ────────────────────────────────────

const GrowthScreen: React.FC = memo(() => {
  const user = useAuthStore((s) => s.user)
  const { profile, setProfile } = useProfileStore()

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<FilterType>('time')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // ─── 데이터 로드 ───────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [profRes, achRes] = await Promise.all([getProfile(), getAchievements()])
      if (profRes.data) setProfile(profRes.data as any)
      setAchievements((achRes.data ?? []) as Achievement[])
    } catch {
      setToast({ type: 'error', message: '데이터를 불러오지 못했습니다.' })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [setProfile])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = useCallback(() => { setIsRefreshing(true); loadData() }, [loadData])

  // ─── 필터 적용 ─────────────────────────────────────

  const filtered = filter === 'impact'
    ? achievements.filter((a) => a.is_verified)
    : achievements

  // ─── 파생값 ────────────────────────────────────────

  const profileData = profile as any
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '사용자'
  const initial = displayName.charAt(0).toUpperCase()
  const jobTitle = profileData?.job_title ?? '직함 미등록'
  const bio = profileData?.bio ?? '커리어 성장 기록을 시작해보세요'

  // ─── 렌더 ──────────────────────────────────────────

  return (
    <View style={styles.root}>

      {/* ── A. 프로필 미니 헤더 ──────────────── */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={10} color={colors.white} />
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileJob}>{jobTitle}</Text>
        </View>
      </View>

      {/* 목표 한 줄 */}
      <View style={styles.goalRow}>
        <Text style={styles.goalText}>🚀 {bio}</Text>
      </View>

      {/* ── B. 필터 토글 ────────────────────── */}
      <View style={styles.filterWrap}>
        <View style={styles.filterToggle}>
          <Pressable
            style={[styles.filterBtn, filter === 'time' && styles.filterBtnActive]}
            onPress={() => setFilter('time')}
          >
            <Text style={[styles.filterBtnText, filter === 'time' && styles.filterBtnTextActive]}>
              시간순
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterBtn, filter === 'impact' && styles.filterBtnActive]}
            onPress={() => setFilter('impact')}
          >
            <Text style={[styles.filterBtnText, filter === 'impact' && styles.filterBtnTextActive]}>
              성과 중심
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── C. 타임라인 목록 ────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.ignition} />}
      >
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} height={150} borderRadius={16} style={{ marginBottom: spacing[4] }} />
          ))
        ) : filtered.length > 0 ? (
          filtered.map((a, idx) => (
            <View key={a.id} style={styles.timelineRow}>
              {/* 좌측 아이콘 + 라인 */}
              <View style={styles.timelineLeft}>
                <View style={[styles.iconWrap, a.is_verified && styles.iconWrapVerified]}>
                  <Ionicons
                    name={getTimelineIcon(a)}
                    size={16}
                    color={a.is_verified ? colors.white : colors.ignition}
                  />
                </View>
                {idx < filtered.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* 카드 내용 */}
              <View style={styles.card}>
                {/* 날짜 + 뱃지 */}
                <View style={styles.cardTop}>
                  <Text style={styles.cardDate}>{fmtMonth(a.started_at).toUpperCase()}</Text>
                  {a.is_verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>인증 완료</Text>
                    </View>
                  )}
                </View>

                {/* 제목 */}
                <Text style={styles.cardTitle}>{a.title}</Text>

                {/* 설명 */}
                {a.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>{a.description}</Text>
                ) : null}

                {/* 프로젝트 태그 */}
                {a.project_name ? (
                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{a.project_name}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={48} color={colors.gray300} />
            <Text style={styles.emptyText}>
              {filter === 'impact'
                ? '인증된 성과가 없어요\n동료 인증을 요청해보세요!'
                : '아직 성과 기록이 없어요\n체크인을 완료하거나 직접 추가해보세요!'}
            </Text>
          </View>
        )}

        <View style={{ height: spacing[16] }} />
      </ScrollView>

      {/* ── D. FAB 버튼 ─────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setToast({ type: 'info', message: '성과 직접 등록 — 준비 중이에요!' })}
        accessibilityLabel="성과 추가"
        accessibilityRole="button"
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </View>
  )
})

GrowthScreen.displayName = 'GrowthScreen'

// ─── 스타일 ──────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ash },

  // 프로필 헤더
  profileHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[2],
    backgroundColor: colors.white,
    gap: spacing[3],
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.gray600 },
  checkBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.ignition,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.ink },
  profileJob: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },

  // 목표
  goalRow: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[5], paddingBottom: spacing[4],
    borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  goalText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, fontStyle: 'italic' },

  // 필터 토글
  filterWrap: { paddingHorizontal: spacing[5], paddingVertical: spacing[3], backgroundColor: colors.white },
  filterToggle: {
    flexDirection: 'row', backgroundColor: colors.gray100,
    borderRadius: borderRadius.xl, padding: 3,
  },
  filterBtn: {
    flex: 1, paddingVertical: spacing[2],
    borderRadius: borderRadius.lg, alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  filterBtnText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.gray500 },
  filterBtnTextActive: { color: colors.ink, fontWeight: typography.fontWeight.semibold },

  // 타임라인
  listContent: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  timelineRow: { flexDirection: 'row', marginBottom: spacing[4] },
  timelineLeft: { width: 36, alignItems: 'center', marginRight: spacing[3] },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.accentBg ?? '#FFF1EC',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.ignition,
  },
  iconWrapVerified: {
    backgroundColor: colors.ignition,
    borderColor: colors.ignition,
  },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: colors.gray200, marginTop: 4 },

  // 카드
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadows.sm,
    borderWidth: 1, borderColor: colors.gray100,
    marginBottom: spacing[1],
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] },
  cardDate: { fontSize: typography.fontSize.xs, color: colors.gray400, fontWeight: typography.fontWeight.medium, letterSpacing: 0.5 },
  verifiedBadge: {
    backgroundColor: '#D1FAE5', borderRadius: borderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  verifiedBadgeText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, color: colors.success },
  cardTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.ink, marginBottom: spacing[2] },
  cardDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing[3] },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    backgroundColor: colors.gray100, borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3], paddingVertical: 4,
  },
  tagText: { fontSize: typography.fontSize.xs, color: colors.gray600, fontWeight: typography.fontWeight.medium },

  // 빈 상태
  empty: { alignItems: 'center', paddingVertical: spacing[12], gap: spacing[3] },
  emptyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  // FAB
  fab: {
    position: 'absolute', bottom: spacing[6], right: spacing[5],
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.ignition,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.lg,
  },
})

export default GrowthScreen
