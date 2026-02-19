/**
 * App.tsx — 앱 진입점
 * - NavigationContainer + SafeAreaProvider
 * - expo-splash-screen으로 로딩 중 스플래시 유지
 * - AsyncStorage에서 인증 상태 복원
 */
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import AppNavigator from '@/navigation/AppNavigator'
import { useAuthStore } from '@/stores/auth.store'

// 스플래시 화면 자동 숨김 방지 (앱 준비 완료 전까지)
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [isReady, setIsReady] = useState(false)
  const restoreAuth = useAuthStore((state) => state.restoreAuth)

  useEffect(() => {
    // 앱 초기화: 저장된 인증 상태 복원
    const initialize = async () => {
      try {
        await restoreAuth()
      } catch {
        // 초기화 실패 시 로그아웃 상태로 진행
      } finally {
        setIsReady(true)
        await SplashScreen.hideAsync()
      }
    }
    initialize()
  }, [restoreAuth])

  if (!isReady) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
