/**
 * LoginScreen — 로그인 화면
 * - 이메일, 비밀번호 입력 + 유효성 검사
 * - 로그인 성공 시 MainTabs 이동
 * - Toast 에러 메시지 처리
 */
import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import Toast from '@/components/Toast/Toast'

import { useAuthStore } from '@/stores/auth.store'
import { login } from '@/api/auth.api'
import { colors, typography, spacing } from '@/styles/tokens'
import { AuthStackParamList } from '@/navigation/types'

type LoginNav = StackNavigationProp<AuthStackParamList, 'Login'>

// 이메일 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>()
  const setSession = useAuthStore((s) => s.setSession)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const passwordRef = useRef<TextInput>(null)

  /** 유효성 검사 */
  const validate = useCallback(() => {
    let valid = true
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('올바른 이메일 형식이 아닙니다.')
      valid = false
    } else setEmailError('')
    if (password.length < 8) {
      setPasswordError('비밀번호는 8자 이상이어야 합니다.')
      valid = false
    } else setPasswordError('')
    return valid
  }, [email, password])

  /** 로그인 처리 */
  const handleLogin = useCallback(async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const { data, error } = await login({ email, password })
      if (error) throw error
      if (data.session) setSession(data.session)
    } catch (error: unknown) {
      const msg = (error as any)?.message ?? ''
      setToast({
        type: 'error',
        message: msg.includes('Invalid login credentials')
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : '로그인 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [validate, email, password, setSession])

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* 로고 + 타이틀 */}
          <View style={styles.header}>
            <Text style={styles.logo}>Remember</Text>
            <Text style={styles.subtitle}>커리어 프로필 다이어리</Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.form}>
            <Input
              label="이메일"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              errorMessage={emailError}
            />
            <Input
              ref={passwordRef}
              label="비밀번호"
              placeholder="8자 이상 입력"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              errorMessage={passwordError}
            />
          </View>

          {/* 로그인 버튼 */}
          <Button
            label="로그인"
            variant="primary"
            size="lg"
            loading={isLoading}
            onPress={handleLogin}
          />

          {/* 회원가입 링크 */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="link"
            accessibilityLabel="회원가입 화면으로 이동"
          >
            <Text style={styles.registerText}>
              계정이 없으신가요? <Text style={styles.registerTextHighlight}>회원가입</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {toast && (
        <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: {
    padding: spacing[6],
    paddingTop: spacing[12],
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  logo: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing[2],
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    minHeight: 44,
    justifyContent: 'center',
  },
  registerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  registerTextHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
})

export default LoginScreen
