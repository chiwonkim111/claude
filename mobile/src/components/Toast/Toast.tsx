/**
 * Toast 컴포넌트 — 알림 토스트 메시지
 * - type: success / error / info
 * - 상단에서 슬라이드 인/아웃 애니메이션
 * - 3초 후 자동 소멸
 */
import React, { memo, useEffect } from 'react'
import { Text, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/tokens'

type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  onDismiss: () => void
}

// Toast 타입별 스타일
const toastConfig: Record<ToastType, { bg: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
  success: { bg: colors.success, icon: 'checkmark-circle', iconColor: colors.white },
  error: { bg: colors.error, icon: 'alert-circle', iconColor: colors.white },
  info: { bg: colors.info, icon: 'information-circle', iconColor: colors.white },
}

const Toast = memo<ToastProps>(({ type, message, onDismiss }) => {
  const insets = useSafeAreaInsets()
  const translateY = useSharedValue(-100)  // 시작 위치 (화면 위)

  const config = toastConfig[type]

  useEffect(() => {
    // 슬라이드 인
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 })

    // 3초 후 슬라이드 아웃 + onDismiss 호출
    translateY.value = withDelay(
      3000,
      withTiming(-100, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)()
      }),
    )
  }, [translateY, onDismiss])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: config.bg, top: insets.top + spacing[2] },
        animatedStyle,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
})

Toast.displayName = 'Toast'

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    zIndex: 9999,
    ...shadows.lg,
  } as ViewStyle,
  icon: {
    marginRight: spacing[2],
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
})

export default Toast
