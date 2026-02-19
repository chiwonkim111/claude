/**
 * HomeScreen — 홈 화면
 * - 현재 분기 체크인 CTA 카드
 * - 프로필 완성도 바
 * - 최근 성과 3개 미리보기
 * - 당겨서 새로고침
 */
import React, { useState, useCallback, useEffect, memo } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '@/navigation/types'

import Card from '@/components/Card/Card'
import Button from '@/components/Button/Button'
import AchievementCard from '@/components/AchievementCard/AchievementCard'
import ProfileCompletionBar from '@/components/ProfileCompletionBar/ProfileCompletionBar'
import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { useCheckinStore } from '@/stores/checkin.store'
import { getProfile } from '@/api/profile.api'
import { createSession } from '@/api/checkin.api'
import { getAchievements } from '@/api/achievement.api'
import { colors, typography, spacing } from '@/styles/tokens'

const HomeScreen: React.FC = memo(() => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const user = useAuthStore((s) => s.user)
  const { profile, setProfile } = useProfileStore()
  const setSession = useCheckinStore((s) => s.setSession)

  const [achievements, setAchievements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckinLoading, setIsCheckinLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  // 현재 분기 계산
  const now = new Date()
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`
  const year = now.getFullYear()

  const loadData = useCallback(async () => {
    try {
      const [profileData, achievementsData] = await Promise.all([
        getProfile(),
        getAchievements(),
      ])
      setProfile(profileData as any)
      setAchievements((achievementsData as any[]).slice(0, 3)) // 최근 3개
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

  // 체크인 세션 시작
  const handleStartCheckin = useCallback(async () => {
    setIsCheckinLoading(true)
    try {
      const res = await createSession() as any
      const session = res.data
      setSession(session)
      navigation.navigate('Checkin', { sessionId: session.id })
    } catch (error: unknown) {
      const code = (error as any)?.response?.data?.error?.code
      setToast({
        type: code === 'CHECKIN_ALREADY_EXISTS' ? 'info' : 'error',
        message: code === 'CHECKIN_ALREADY_EXISTS' ? '이미 이번 분기 체크인이 있어요!' : '체크인 생성에 실패했습니다.',
      })
    } finally {
      setIsCheckinLoading(false)
    }
  }, [year, quarter, setSession])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        {/* 인사말 */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>안녕하세요, {user?.name}님 👋</Text>
          <Text style={styles.quarterText}>{year}년 {quarter} 분기</Text>
        </View>

        {/* 체크인 CTA */}
        <Card variant="elevated" style={styles.checkinCard}>
          <Text style={styles.checkinTitle}>{year}년 {quarter} 체크인</Text>
          <Text style={styles.checkinSubtitle}>이번 분기 성과를 기록하고 마켓 밸류를 업데이트하세요</Text>
          <Button
            label="체크인 시작하기"
            variant="primary"
            size="md"
            loading={isCheckinLoading}
            onPress={handleStartCheckin}
            style={styles.checkinButton}
          />
        </Card>

        {/* 프로필 완성도 */}
        {isLoading ? (
          <Skeleton height={80} borderRadius={16} style={{ marginBottom: spacing[4] }} />
        ) : (
          <Card variant="outlined" style={styles.completionCard}>
            <Text style={styles.sectionTitle}>프로필 완성도</Text>
            <ProfileCompletionBar score={profile?.completionScore ?? 0} />
          </Card>
        )}

        {/* 최근 성과 */}
        <Text style={styles.sectionTitle}>최근 성과</Text>
        {isLoading ? (
          [1, 2].map((i) => <Skeleton key={i} height={100} borderRadius={16} style={{ marginBottom: spacing[3] }} />)
        ) : achievements.length > 0 ? (
          achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>아직 등록된 성과가 없어요{'\n'}체크인을 완료하면 자동으로 기록돼요!</Text>
          </Card>
        )}
      </ScrollView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
})

HomeScreen.displayName = 'HomeScreen'

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing[5], paddingBottom: spacing[10] },
  greeting: { marginBottom: spacing[5] },
  greetingText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  quarterText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing[1] },
  checkinCard: { marginBottom: spacing[4], backgroundColor: colors.primary },
  checkinTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.white, marginBottom: spacing[1] },
  checkinSubtitle: { fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing[4], lineHeight: 20 },
  checkinButton: { backgroundColor: colors.white },
  completionCard: { marginBottom: spacing[4] },
  sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  emptyCard: { padding: spacing[5] },
  emptyText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})

export default HomeScreen
