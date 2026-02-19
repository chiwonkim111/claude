/**
 * ProfileScreen — 프로필 화면
 * - 프로필 정보 (직함, 회사, 경력, 스킬 태그)
 * - 완성도 바
 * - 알림 설정 (Switch)
 * - 로그아웃 버튼
 */
import React, { useEffect, useState, useCallback, memo } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import Card from '@/components/Card/Card'
import Badge from '@/components/Badge/Badge'
import ProfileCompletionBar from '@/components/ProfileCompletionBar/ProfileCompletionBar'
import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { useAuthStore } from '@/stores/auth.store'
import { useProfileStore } from '@/stores/profile.store'
import { getProfile } from '@/api/profile.api'
import { getSettings, updateSettings } from '@/api/notification.api'
import { logout as logoutApi } from '@/api/auth.api'

import { colors, typography, spacing, borderRadius } from '@/styles/tokens'

const ProfileScreen: React.FC = memo(() => {
  const user = useAuthStore((s) => s.user)
  const logoutStore = useAuthStore((s) => s.logout)
  const { profile, setProfile } = useProfileStore()
  const clearProfile = useProfileStore((s) => s.clearProfile)

  const [notifSettings, setNotifSettings] = useState({ checkinReminderEnabled: true, marketValueAlertEnabled: true, peerRequestEnabled: true })
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    Promise.all([getProfile(), getSettings()])
      .then(([p, s]) => {
        setProfile(p as any)
        const settings = s as any
        setNotifSettings({ checkinReminderEnabled: settings.checkinReminderEnabled, marketValueAlertEnabled: settings.marketValueAlertEnabled, peerRequestEnabled: settings.peerRequestEnabled })
      })
      .catch(() => setToast({ type: 'error', message: '프로필을 불러오지 못했습니다.' }))
      .finally(() => setIsLoading(false))
  }, [setProfile])

  const handleToggle = useCallback(async (key: keyof typeof notifSettings, value: boolean) => {
    const prev = { ...notifSettings }
    setNotifSettings((s) => ({ ...s, [key]: value }))
    try {
      await updateSettings({ [key]: value })
    } catch {
      setNotifSettings(prev)
      setToast({ type: 'error', message: '설정 저장에 실패했습니다.' })
    }
  }, [notifSettings])

  const handleLogout = useCallback(() => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: async () => {
        try { await logoutApi() } catch {}
        clearProfile()
        await logoutStore()
      }},
    ])
  }, [logoutStore, clearProfile])

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>내 프로필</Text>

        {/* 프로필 카드 */}
        {isLoading ? (
          <Skeleton height={160} borderRadius={16} style={{ marginBottom: spacing[4] }} />
        ) : (
          <Card variant="default" style={styles.profileCard}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {profile?.jobTitle && <Text style={styles.job}>{profile.jobTitle}{profile.companyName ? ` · ${profile.companyName}` : ''}</Text>}
              </View>
            </View>
            <View style={styles.metaRow}>
              {(profile?.yearsOfExperience ?? 0) > 0 && <Badge variant="primary" label={`경력 ${profile!.yearsOfExperience}년`} />}
              {profile?.isJobSeeking && <Badge variant="success" label="구직 중" />}
            </View>
            <View style={styles.completionWrap}>
              <ProfileCompletionBar score={profile?.completionScore ?? 0} compact />
            </View>
          </Card>
        )}

        {/* 스킬 */}
        {!isLoading && profile?.skills && profile.skills.length > 0 && (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.sectionTitle}>보유 스킬</Text>
            <View style={styles.skillTags}>
              {(profile.skills as any[]).map((s: any) => <Badge key={s.id ?? s.skillId} variant="gray" label={s.skillName ?? s.name ?? '스킬'} />)}
            </View>
          </Card>
        )}

        {/* 알림 설정 */}
        <Card variant="default" style={styles.card}>
          <Text style={styles.sectionTitle}>알림 설정</Text>
          {[
            { key: 'checkinReminderEnabled' as const, icon: 'calendar-outline', label: '분기 체크인 알림' },
            { key: 'marketValueAlertEnabled' as const, icon: 'trending-up-outline', label: '마켓 밸류 업데이트' },
            { key: 'peerRequestEnabled' as const, icon: 'people-outline', label: '동료 인증 요청' },
          ].map(({ key, icon, label }) => (
            <View key={key} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
                <Text style={styles.settingLabel}>{label}</Text>
              </View>
              <Switch
                value={notifSettings[key]}
                onValueChange={(v) => handleToggle(key, v)}
                trackColor={{ false: colors.gray200, true: colors.primaryLight }}
                thumbColor={notifSettings[key] ? colors.primary : colors.gray400}
              />
            </View>
          ))}
        </Card>

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="로그아웃">
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Remember v1.0.0</Text>
      </ScrollView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
})

ProfileScreen.displayName = 'ProfileScreen'

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing[5], paddingBottom: spacing[10] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, paddingVertical: spacing[4] },
  profileCard: { marginBottom: spacing[4] },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing[4] },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: spacing[3] },
  avatarText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.white },
  profileInfo: { flex: 1 },
  name: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  email: { fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  job: { fontSize: typography.fontSize.sm, color: colors.primary, marginTop: spacing[1] },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  completionWrap: { borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: spacing[4] },
  card: { marginBottom: spacing[4] },
  sectionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing[3] },
  skillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.gray100, minHeight: 52 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1 },
  settingLabel: { fontSize: typography.fontSize.base, color: colors.textPrimary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2], paddingVertical: spacing[4], borderWidth: 1, borderColor: colors.error, borderRadius: borderRadius.lg, minHeight: 52, marginBottom: spacing[4] },
  logoutText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.error },
  version: { fontSize: typography.fontSize.xs, color: colors.gray400, textAlign: 'center' },
})

export default ProfileScreen
