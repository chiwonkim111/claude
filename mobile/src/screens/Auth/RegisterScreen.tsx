/**
 * RegisterScreen — 회원가입 화면
 * - 이름, 이메일, 비밀번호, 비밀번호 확인 입력
 * - 모든 필드 유효성 검사
 */
import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'

import Input from '@/components/Input/Input'
import Button from '@/components/Button/Button'
import Toast from '@/components/Toast/Toast'

import { useAuthStore } from '@/stores/auth.store'
import { register } from '@/api/auth.api'
import { colors, typography, spacing } from '@/styles/tokens'
import { AuthStackParamList } from '@/navigation/types'

type RegisterNav = StackNavigationProp<AuthStackParamList, 'Register'>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNav>()
  const setSession = useAuthStore((s) => s.setSession)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (name.trim().length < 2) newErrors.name = '이름은 2자 이상이어야 합니다.'
    if (!EMAIL_REGEX.test(email)) newErrors.email = '올바른 이메일 형식이 아닙니다.'
    if (password.length < 8) newErrors.password = '비밀번호는 8자 이상이어야 합니다.'
    if (password !== passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email, password, passwordConfirm])

  const handleRegister = useCallback(async () => {
    if (!validate()) return
    setIsLoading(true)
    try {
      const { data, error } = await register({ name, email, password })
      if (error) throw error
      // Supabase: 이메일 인증 비활성화 시 session 즉시 반환, 활성화 시 null
      if (data.session) {
        setSession(data.session)
        setToast({ type: 'success', message: '회원가입이 완료됐습니다!' })
      } else {
        setToast({ type: 'info', message: '이메일 인증 후 로그인해주세요.' })
      }
    } catch (error: unknown) {
      const msg = (error as any)?.message ?? ''
      setToast({
        type: 'error',
        message: msg.includes('already registered')
          ? '이미 사용 중인 이메일입니다.'
          : '회원가입 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [validate, name, email, password, setSession])

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* 뒤로가기 */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="뒤로가기">
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>커리어 관리를 시작해보세요</Text>

          <View style={styles.form}>
            <Input label="이름" placeholder="홍길동" value={name} onChangeText={setName} errorMessage={errors.name} />
            <Input label="이메일" placeholder="name@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" errorMessage={errors.email} />
            <Input label="비밀번호" placeholder="8자 이상 입력" value={password} onChangeText={setPassword} secureTextEntry errorMessage={errors.password} />
            <Input label="비밀번호 확인" placeholder="비밀번호 재입력" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry errorMessage={errors.passwordConfirm} />
          </View>

          <Button label="가입하기" variant="primary" size="lg" loading={isLoading} onPress={handleRegister} />
        </ScrollView>
      </KeyboardAvoidingView>

      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { padding: spacing[6], flexGrow: 1 },
  backButton: { padding: spacing[2], marginBottom: spacing[4], alignSelf: 'flex-start', minWidth: 44, minHeight: 44, justifyContent: 'center' },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing[1] },
  subtitle: { fontSize: typography.fontSize.base, color: colors.textSecondary, marginBottom: spacing[6] },
  form: { marginBottom: spacing[4] },
})

export default RegisterScreen
