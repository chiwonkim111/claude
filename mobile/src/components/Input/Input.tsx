/**
 * Input 컴포넌트 — 텍스트 입력 필드
 * - label, placeholder, errorMessage, helperText 지원
 * - secureTextEntry (비밀번호 입력)
 * - 유효성 오류 시 빨간 테두리 + 에러 메시지
 * - accessibilityLabel 자동 연결
 */
import React, { memo, useState, forwardRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, typography, spacing, borderRadius, touchTarget } from '@/styles/tokens'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  errorMessage?: string
  helperText?: string
  containerStyle?: ViewStyle
}

const Input = memo(forwardRef<TextInput, InputProps>(({
  label,
  errorMessage,
  helperText,
  secureTextEntry,
  containerStyle,
  ...props
}, ref) => {
  // 비밀번호 보기/숨기기 토글 상태
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const hasError = Boolean(errorMessage)

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 레이블 */}
      {label && (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      )}

      {/* 입력 필드 행 */}
      <View style={[styles.inputRow, hasError && styles.inputRowError]}>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.gray400}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          accessibilityLabel={label ?? props.placeholder}
          accessibilityHint={helperText}
          accessibilityInvalid={hasError}
          {...props}
        />

        {/* 비밀번호 보기/숨기기 버튼 */}
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible((v) => !v)}
            accessibilityLabel={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.gray400}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 에러 메시지 */}
      {hasError && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {errorMessage}
        </Text>
      )}

      {/* 도움말 텍스트 (에러 없을 때만) */}
      {!hasError && helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  )
}))

Input.displayName = 'Input'

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing[2],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    minHeight: touchTarget.minHeight,
    paddingHorizontal: spacing[3],
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    paddingVertical: spacing[3],
  },
  eyeButton: {
    padding: spacing[2],
    minWidth: touchTarget.minWidth,
    minHeight: touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing[1],
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing[1],
  },
})

export default Input
