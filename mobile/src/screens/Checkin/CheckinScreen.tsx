/**
 * CheckinScreen — 분기 체크인 화면
 * - AI 생성 질문 목록 (QuestionCard)
 * - 답변 입력 + 800ms 디바운스 자동 저장
 * - 상단 진행률 바 (Reanimated)
 * - 전체 답변 완료 후 "완료하기" 버튼 활성화
 */
import React, { useState, useCallback, useEffect, useRef, memo } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated'

import QuestionCard from '@/components/QuestionCard/QuestionCard'
import Button from '@/components/Button/Button'
import Skeleton from '@/components/Skeleton/Skeleton'
import Toast from '@/components/Toast/Toast'

import { useCheckinStore } from '@/stores/checkin.store'
import { getQuestions, saveAnswer, completeCheckin } from '@/api/checkin.api'
import { RootStackParamList } from '@/navigation/types'
import { colors, typography, spacing, borderRadius } from '@/styles/tokens'

type CheckinRouteProp = RouteProp<RootStackParamList, 'Checkin'>

const CheckinScreen: React.FC = memo(() => {
  const route = useRoute<CheckinRouteProp>()
  const navigation = useNavigation()
  const { sessionId } = route.params

  const { questions, setQuestions, updateAnswer, reset } = useCheckinStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const saveTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  // 진행률 계산
  const answeredCount = questions.filter((q) => q.answer && q.answer.trim().length > 0).length
  const totalCount = questions.length
  const progress = totalCount > 0 ? answeredCount / totalCount : 0

  // Reanimated 진행률 바 너비
  const progressWidth = useSharedValue(0)
  useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 400 })
  }, [progress, progressWidth])
  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progressWidth.value * 100)}%` as any,
  }))

  // 질문 로드
  useEffect(() => {
    getQuestions(sessionId)
      .then((data) => setQuestions(data as any[]))
      .catch(() => setToast({ type: 'error', message: '질문을 불러오지 못했습니다.' }))
      .finally(() => setIsLoading(false))
  }, [sessionId, setQuestions])

  // 언마운트 시 타이머 정리
  useEffect(() => {
    const timers = saveTimers.current
    return () => { timers.forEach((t) => clearTimeout(t)) }
  }, [])

  const handleAnswerChange = useCallback((questionId: number, text: string) => {
    updateAnswer(questionId, text)
    // 800ms 디바운스 자동 저장
    const prev = saveTimers.current.get(questionId)
    if (prev) clearTimeout(prev)
    const timer = setTimeout(() => {
      saveAnswer(sessionId, questionId, text).catch(() => {
        setToast({ type: 'error', message: '답변 저장에 실패했습니다.' })
      })
    }, 800)
    saveTimers.current.set(questionId, timer)
  }, [sessionId, updateAnswer])

  const handleComplete = useCallback(async () => {
    if (answeredCount < totalCount) {
      setToast({ type: 'info', message: `${totalCount - answeredCount}개 답변이 남아있어요.` })
      return
    }
    setIsCompleting(true)
    try {
      await completeCheckin(sessionId)
      reset()
      setToast({ type: 'success', message: '체크인 완료! 성과가 자동 등록됐어요.' })
      setTimeout(() => navigation.goBack(), 1500)
    } catch {
      setToast({ type: 'error', message: '체크인 완료에 실패했습니다.' })
    } finally {
      setIsCompleting(false)
    }
  }, [sessionId, answeredCount, totalCount, navigation, reset])

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 진행률 헤더 */}
        <View style={styles.progressHeader}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>답변 진행률</Text>
            <Text style={styles.progressCount}>{answeredCount} / {totalCount}</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading
            ? [1, 2, 3].map((i) => (
                <Skeleton key={i} height={160} borderRadius={16} style={{ marginBottom: spacing[3] }} />
              ))
            : questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onAnswerChange={handleAnswerChange}
                />
              ))
          }

          {!isLoading && totalCount > 0 && (
            <Button
              label={answeredCount < totalCount ? `${totalCount - answeredCount}개 답변 후 완료 가능` : '체크인 완료하기'}
              variant="primary"
              size="lg"
              loading={isCompleting}
              disabled={answeredCount < totalCount}
              onPress={handleComplete}
              style={styles.completeBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
})

CheckinScreen.displayName = 'CheckinScreen'

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  progressHeader: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  progressCount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  container: {
    padding: spacing[5],
    paddingBottom: spacing[12],
  },
  completeBtn: { marginTop: spacing[4] },
})

export default CheckinScreen
