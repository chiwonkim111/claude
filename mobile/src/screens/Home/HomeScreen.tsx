/**
 * HomeScreen — 프로필 탭
 * 레퍼런스: reference_img/프로필.png
 *
 * 섹션 구성:
 *   A. 프로필 카드 — 아바타 + 이름 + 활성화 뱃지 + 직함
 *   B. 버튼 행 — 프로필 공유 / 정보 수정
 *   C. 오렌지 CTA 카드 — 이번 분기 체크인
 *   D. 분기별 마일스톤 — 체크인 세션 기반
 *   E. 검증된 이력 — 성과 타임라인
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Pressable,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, NavigationProp } from '@react-navigation/native'

import Toast from '@/components/Toast/Toast'
import Skeleton from '@/components/Skeleton/Skeleton'

import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { getProfile } from '@/api/profile.api'
import { getAchievements } from '@/api/achievement.api'
import { getSessions, createSession } from '@/api/checkin.api'
import { useCheckinStore } from '@/stores/checkin.store'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'
import { RootStackParamList } from '@/navigation/types'

// ─── 타입 ───────────────────────────────────────────

interface Session {
  id: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

interface Achievement {
  id: string
  title: string
  description?: string | null
  project_name?: string | null
  started_at?: string | null
  ended_at?: string | null
  is_verified: boolean
}

// ─── 유틸 ────────────────────────────────────────────

/** 날짜 포맷: "2021. 03" 형식 */
const fmtDate = (d: string | null | undefined) => {
  if (!d) return '현재'
  const dt = new Date(d)
  return `${dt.getFullYear()}. ${String(dt.getMonth() + 1).padStart(2, '0')}`
}

/** 세션 상태별 진행률 */
const sessionProgress = (status: string) => {
  if (status === 'COMPLETED') return 100
  if (status === 'IN_PROGRESS') return 50
  return 0
}

/** 세션 상태 한국어 레이블 */
const sessionLabel = (status: string) => {
  if (status === 'COMPLETED') return '완료'
  if (status === 'IN_PROGRESS') return '진행중'
  return '대기'
}

// ─── 메인 컴포넌트 ────────────────────────────────────

const HomeScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const user = useAuthStore((s) => s.user)
  const { profile, setProfile } = useProfileStore()
  const setSession = useCheckinStore((s) => s.setSession)

  const [sessions, setSessions] = useState<Session[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCheckinLoading, setIsCheckinLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // 현재 분기/연도
  const now = new Date()
  const currentQuarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`
  const currentYear = now.getFullYear()

  // ─── 데이터 로드 ───────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [profileRes, achRes, sessRes] = await Promise.all([
        getProfile(),
        getAchievements(),
        getSessions(),
      ])
      if (profileRes.data) setProfile(profileRes.data as any)
      setAchievements((achRes.data ?? []) as Achievement[])
      setSessions(((sessRes.data ?? []) as Session[]).slice(0, 4))
    } catch {
      setToast({ type: 'error', message: '데이터를 불러오지 못했습니다.' })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [setProfile])

  useEffect(() => { loadData() }, [loadData])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    loadData()
  }, [loadData])

  // ─── 체크인 시작 ────────────────────────────────────

  const handleCheckin = useCallback(async () => {
    setIsCheckinLoading(true)
    try {
      const { data: session, error } = await createSession()
      if (error) throw error
      if (!session) throw new Error('세션 생성에 실패했습니다.')
      setSession(session as any)
      navigation.navigate('Checkin', { sessionId: (session as any).id })
    } catch (err: unknown) {
      const msg = (err as any)?.message ?? ''
      const isDup = msg.includes('duplicate') || msg.includes('already exists')
      setToast({ type: isDup ? 'info' : 'error', message: isDup ? '이미 이번 분기 체크인이 있어요!' : (msg || '체크인 생성에 실패했습니다.') })
    } finally {
      setIsCheckinLoading(false)
    }
  }, [setSession, navigation])

  // ─── 파생값 ────────────────────────────────────────

  const profileData = profile as any
  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? '사용자'
  const initial = displayName.charAt(0).toUpperCase()

  // ─── 렌더 ──────────────────────────────────────────

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.ignition} />}
      >

        {/* ── A. 프로필 카드 ──────────────────── */}
        <View style={styles.section}>
          {isLoading ? (
            <Skeleton height={80} borderRadius={12} />
          ) : (
            <View style={styles.profileRow}>
              {/* 아바타 */}
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                {/* 오렌지 체크 뱃지 */}
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={10} color={colors.white} />
                </View>
              </View>

              {/* 이름 + 뱃지 + 직함 */}
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>활성화</Text>
                  </View>
                </View>
                <Text style={styles.jobTitle} numberOfLines={1}>
                  {profileData?.job_title ?? '직함을 입력해주세요'}
                </Text>
              </View>
            </View>
          )}

          {/* ── B. 버튼 행 ─────────────────────── */}
          {!isLoading && (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.btnBlack}
                onPress={() => setToast({ type: 'info', message: '프로필 공유 기능 — 준비 중이에요!' })}
                activeOpacity={0.8}
              >
                <Text style={styles.btnBlackText}>프로필 공유</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnOutline}
                onPress={() => setToast({ type: 'info', message: '정보 수정 기능 — 준비 중이에요!' })}
                activeOpacity={0.8}
              >
                <Text style={styles.btnOutlineText}>정보 수정</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── C. 체크인 CTA 카드 ──────────────── */}
          {!isLoading && (
            <TouchableOpacity
              style={[styles.ctaCard, isCheckinLoading && { opacity: 0.7 }]}
              onPress={handleCheckin}
              disabled={isCheckinLoading}
              activeOpacity={0.85}
            >
              <View style={styles.ctaText}>
                <Text style={styles.ctaQuarter}>{currentYear}년 {currentQuarter}분기</Text>
                <Text style={styles.ctaTitle}>
                  {isCheckinLoading ? '처리 중...' : '이번 분기 성과를 기록하세요'}
                </Text>
              </View>
              <View style={styles.ctaArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.ignition} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── D. 분기별 마일스톤 ────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>분기별 마일스톤</Text>
            <Pressable onPress={() => setToast({ type: 'info', message: '전체보기 — 준비 중이에요!' })}>
              <Text style={styles.sectionLink}>전체보기</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <>
              <Skeleton height={90} borderRadius={12} style={{ marginBottom: spacing[3] }} />
              <Skeleton height={90} borderRadius={12} />
            </>
          ) : sessions.length > 0 ? (
            sessions.map((s) => {
              const progress = sessionProgress(s.status)
              const label = sessionLabel(s.status)
              return (
                <View key={s.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneTop}>
                    <Text style={[styles.milestoneQuarter, s.status === 'COMPLETED' && styles.milestoneQuarterDone]}>
                      {s.quarter} {label}
                    </Text>
                    <Text style={styles.milestonePercent}>{progress}%</Text>
                  </View>
                  <Text style={styles.milestoneTitle}>{s.year}년 {s.quarter} 체크인</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                  </View>
                </View>
              )
            })
          ) : (
            <View style={styles.emptySmall}>
              <Text style={styles.emptySmallText}>아직 체크인 기록이 없어요. 위 버튼으로 시작해보세요!</Text>
            </View>
          )}
        </View>

        {/* ── E. 검증된 이력 ────────────────────── */}
        <View style={[styles.section, { paddingBottom: spacing[10] }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>검증된 이력</Text>
            <Pressable onPress={() => setToast({ type: 'info', message: '성과 등록 — 준비 중이에요!' })}>
              <Ionicons name="add" size={22} color={colors.ignition} />
            </Pressable>
          </View>

          {isLoading ? (
            <Skeleton height={120} borderRadius={12} />
          ) : achievements.length > 0 ? (
            achievements.map((a, idx) => (
              <View key={a.id} style={styles.timelineRow}>
                {/* 좌측 도트 + 라인 */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, a.is_verified && styles.timelineDotVerified]} />
                  {idx < achievements.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* 내용 */}
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>
                    {fmtDate(a.started_at)} - {fmtDate(a.ended_at)}
                  </Text>
                  <Text style={styles.timelineCompany}>{a.project_name ?? '프로젝트'}</Text>
                  <Text style={styles.timelineTitle}>{a.title}</Text>
                  {a.description ? (
                    <View style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText} numberOfLines={2}>{a.description}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptySmall}>
              <Text style={styles.emptySmallText}>검증된 이력이 없어요. 성과를 추가해보세요!</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </View>
  )
})

HomeScreen.displayName = 'HomeScreen'

// ─── 스타일 ──────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },

  section: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },

  // 프로필 카드
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], marginBottom: spacing[4] },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.gray600 },
  checkBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.ignition,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] },
  name: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.ink },
  activeBadge: {
    backgroundColor: colors.ignition, borderRadius: borderRadius.sm,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 11, fontWeight: typography.fontWeight.semibold, color: colors.white },
  jobTitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary },

  // 버튼 행
  btnRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  btnBlack: {
    flex: 1, height: 48, borderRadius: borderRadius.xl,
    backgroundColor: colors.midnight,
    alignItems: 'center', justifyContent: 'center',
  },
  btnBlackText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.white },
  btnOutline: {
    flex: 1, height: 48, borderRadius: borderRadius.xl,
    borderWidth: 1.5, borderColor: colors.gray200,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.ink },

  // CTA 카드
  ctaCard: {
    backgroundColor: colors.ignition,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.md,
  },
  ctaText: { flex: 1 },
  ctaQuarter: { fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  ctaTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white },
  ctaArrow: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },

  // 섹션 공통
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing[3],
  },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.ink },
  sectionLink: { fontSize: typography.fontSize.sm, color: colors.textSecondary },

  // 마일스톤 카드
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1, borderColor: colors.gray100,
    ...shadows.sm,
  },
  milestoneTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[1] },
  milestoneQuarter: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.ignition },
  milestoneQuarterDone: { color: colors.gray400 },
  milestonePercent: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
  milestoneTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.ink, marginBottom: spacing[3] },
  progressTrack: { height: 6, backgroundColor: colors.gray100, borderRadius: borderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.midnight, borderRadius: borderRadius.full },

  // 타임라인
  timelineRow: { flexDirection: 'row', marginBottom: spacing[4] },
  timelineLeft: { width: 24, alignItems: 'center', marginRight: spacing[3] },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.gray300 },
  timelineDotVerified: { backgroundColor: colors.ignition },
  timelineLine: { flex: 1, width: 1.5, backgroundColor: colors.gray100, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineDate: { fontSize: typography.fontSize.xs, color: colors.gray400, marginBottom: 2 },
  timelineCompany: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold, color: colors.ink, marginBottom: 2 },
  timelineTitle: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing[1] },
  bulletRow: { flexDirection: 'row', gap: 6 },
  bullet: { fontSize: typography.fontSize.xs, color: colors.gray400, lineHeight: 18 },
  bulletText: { flex: 1, fontSize: typography.fontSize.xs, color: colors.gray500, lineHeight: 18 },

  // 빈 상태
  emptySmall: { paddingVertical: spacing[4], alignItems: 'center' },
  emptySmallText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
})

export default HomeScreen
