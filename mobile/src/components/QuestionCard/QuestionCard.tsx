/**
 * QuestionCard 컴포넌트 — 체크인 질문 카드
 * - 질문 번호, 질문 텍스트, 답변 TextInput 포함
 * - 답변 완료 시 초록 테두리 + 체크 아이콘 표시
 */
import React, { memo, useCallback } from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

/** Supabase checkin_questions 컬럼 기준 */
interface Question {
  id: string
  seq: number       // 질문 순서 (1~4)
  question: string  // 질문 텍스트
  answer: string | null
}

interface QuestionCardProps {
  question: Question
  onAnswerChange: (id: string, text: string) => void
}

const QuestionCard = memo<QuestionCardProps>(({ question, onAnswerChange }) => {
  const isAnswered = Boolean(question.answer && question.answer.trim().length > 0)

  const handleChange = useCallback(
    (text: string) => onAnswerChange(question.id, text),
    [question.id, onAnswerChange],
  )

  return (
    <View style={[styles.card, isAnswered && styles.cardAnswered]}>
      {/* 질문 헤더 */}
      <View style={styles.header}>
        <View style={[styles.orderBadge, isAnswered && styles.orderBadgeAnswered]}>
          {isAnswered ? (
            <Ionicons name="checkmark" size={14} color={colors.white} />
          ) : (
            <Text style={styles.orderText}>Q{question.seq}</Text>
          )}
        </View>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* 답변 입력 */}
      <TextInput
        style={styles.answerInput}
        value={question.answer ?? ''}
        onChangeText={handleChange}
        placeholder="답변을 입력하세요..."
        placeholderTextColor={colors.gray400}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        accessibilityLabel={`${question.seq}번 질문 답변 입력`}
        accessibilityHint={question.question}
      />
    </View>
  )
})

QuestionCard.displayName = 'QuestionCard'

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardAnswered: {
    borderColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  orderBadgeAnswered: {
    backgroundColor: colors.success,
  },
  orderText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  questionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  answerInput: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    minHeight: 96,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
})

export default QuestionCard
