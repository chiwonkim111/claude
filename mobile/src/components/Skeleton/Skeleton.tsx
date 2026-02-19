/**
 * Skeleton 컴포넌트 — 로딩 중 콘텐츠 플레이스홀더
 * - Reanimated shimmer 애니메이션으로 부드러운 로딩 표현
 */
import React, { memo, useEffect } from 'react'
import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { colors, borderRadius as br } from '@/styles/tokens'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

const Skeleton = memo<SkeletonProps>(({
  width = '100%',
  height = 16,
  borderRadius = br.md,
  style,
}) => {
  // opacity shimmer 애니메이션 값
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease }),
      ),
      -1, // 무한 반복
      false,
    )
  }, [opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius },
        animatedStyle,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="로딩 중"
    />
  )
})

Skeleton.displayName = 'Skeleton'

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray200,
  } as ViewStyle,
})

export default Skeleton
