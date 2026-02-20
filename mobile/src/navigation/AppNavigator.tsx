/**
 * AppNavigator — 루트 네비게이터
 * - 로그인 여부에 따라 AuthStack / MainTabs 전환
 * - 메인 탭: 커스텀 상단 탭 바 (프로필 / 마켓밸류 / 성장)
 * - material-top-tabs 대신 View + useState 사용 (웹 스크롤 호환)
 * - 탭 인디케이터 색상: Ignition Orange (#FE5314)
 * - 탭 배경색: Midnight Void (#000000)
 */
import React, { useState, memo } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAuthStore } from '@/stores/auth.store'
import { colors, typography, spacing } from '@/styles/tokens'

// 화면 imports
import LoginScreen from '@/screens/Auth/LoginScreen'
import RegisterScreen from '@/screens/Auth/RegisterScreen'
import HomeScreen from '@/screens/Home/HomeScreen'
import MarketValueScreen from '@/screens/MarketValue/MarketValueScreen'
import GrowthScreen from '@/screens/Growth/GrowthScreen'
import CheckinScreen from '@/screens/Checkin/CheckinScreen'

import { RootStackParamList, AuthStackParamList } from './types'

const RootStack = createStackNavigator<RootStackParamList>()
const AuthStack = createStackNavigator<AuthStackParamList>()

// ─── 탭 정의 ──────────────────────────────────────────

type TabKey = 'Profile' | 'MarketValue' | 'Growth'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'Profile',     label: '프로필' },
  { key: 'MarketValue', label: '마켓밸류' },
  { key: 'Growth',      label: '성장' },
]

/** 인증 전 스택 — 로그인 / 회원가입 */
const AuthNavigator = memo(() => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
))

/**
 * 메인 커스텀 탭 네비게이터
 * - material-top-tabs 대신 View + useState로 구현
 * - 웹(Expo Web)에서 ScrollView 스크롤이 정상 동작함
 */
const MainTabNavigator = memo(() => {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<TabKey>('Profile')

  return (
    <View style={styles.root}>
      {/* ── 상단 탭 바 ─────────────────────────── */}
      <View style={[styles.tabBar, { paddingTop: insets.top }]}>
        {TABS.map(({ key, label }) => {
          const isActive = activeTab === key
          return (
            <Pressable
              key={key}
              style={styles.tabItem}
              onPress={() => setActiveTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {label}
              </Text>
              {/* 활성 탭 인디케이터 */}
              <View style={[styles.indicator, isActive && styles.indicatorActive]} />
            </Pressable>
          )
        })}
      </View>

      {/* ── 탭 콘텐츠 — flex:1로 정상 스크롤 보장 ── */}
      <View style={styles.content}>
        {activeTab === 'Profile'     && <HomeScreen />}
        {activeTab === 'MarketValue' && <MarketValueScreen />}
        {activeTab === 'Growth'      && <GrowthScreen />}
      </View>
    </View>
  )
})

/** 루트 네비게이터 — 인증 상태에 따라 스택 전환 */
const AppNavigator = memo(() => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          {/* 메인 탭 화면 */}
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          {/* 체크인 모달 — 전체 화면 모달로 표시 */}
          <RootStack.Screen
            name="Checkin"
            component={CheckinScreen}
            options={{
              headerShown: true,
              title: '분기 체크인',
              headerBackTitle: '취소',
              presentation: 'modal',
              headerStyle: { backgroundColor: colors.midnight },
              headerTintColor: colors.white,
              headerTitleStyle: {
                fontWeight: typography.fontWeight.semibold,
                color: colors.white,
              },
            }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  )
})

AppNavigator.displayName = 'AppNavigator'
AuthNavigator.displayName = 'AuthNavigator'
MainTabNavigator.displayName = 'MainTabNavigator'

// ─── 스타일 ──────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.midnight,
  },

  // 탭 바
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.midnight,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.3,
    color: '#999999',
    marginBottom: spacing[1],
  },
  tabLabelActive: {
    color: colors.white,
  },

  // 인디케이터
  indicator: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: colors.ignition,
  },

  // 콘텐츠 영역
  content: {
    flex: 1,
  },
})

export default AppNavigator
