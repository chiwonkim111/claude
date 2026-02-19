/**
 * AppNavigator — 루트 네비게이터
 * - 로그인 여부에 따라 AuthStack / MainTabs 전환
 */
import React, { memo } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { useAuthStore } from '@/stores/auth.store'
import { colors, typography } from '@/styles/tokens'

// 화면 imports
import LoginScreen from '@/screens/Auth/LoginScreen'
import RegisterScreen from '@/screens/Auth/RegisterScreen'
import HomeScreen from '@/screens/Home/HomeScreen'
import TimelineScreen from '@/screens/Timeline/TimelineScreen'
import MarketValueScreen from '@/screens/MarketValue/MarketValueScreen'
import ProfileScreen from '@/screens/Profile/ProfileScreen'
import CheckinScreen from '@/screens/Checkin/CheckinScreen'

import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types'

const RootStack = createStackNavigator<RootStackParamList>()
const AuthStack = createStackNavigator<AuthStackParamList>()
const MainTab = createBottomTabNavigator<MainTabParamList>()

/** 인증 전 스택 — 로그인 / 회원가입 */
const AuthNavigator = memo(() => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
))

/** 메인 탭 — 홈 / 타임라인 / 마켓밸류 / 프로필 */
const MainTabNavigator = memo(() => (
  <MainTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        // 탭별 아이콘 매핑
        const iconMap: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
          Home: { active: 'home', inactive: 'home-outline' },
          Timeline: { active: 'trophy', inactive: 'trophy-outline' },
          MarketValue: { active: 'bar-chart', inactive: 'bar-chart-outline' },
          Profile: { active: 'person', inactive: 'person-outline' },
        }
        const icons = iconMap[route.name] ?? { active: 'help', inactive: 'help-outline' }
        return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray400,
      tabBarStyle: { borderTopColor: colors.border },
      tabBarLabelStyle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
      },
    })}
  >
    <MainTab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '홈' }} />
    <MainTab.Screen name="Timeline" component={TimelineScreen} options={{ tabBarLabel: '타임라인' }} />
    <MainTab.Screen name="MarketValue" component={MarketValueScreen} options={{ tabBarLabel: '마켓밸류' }} />
    <MainTab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '프로필' }} />
  </MainTab.Navigator>
))

/** 루트 네비게이터 — 인증 상태에 따라 스택 전환 */
const AppNavigator = memo(() => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen
            name="Checkin"
            component={CheckinScreen}
            options={{
              headerShown: true,
              title: '분기 체크인',
              headerBackTitle: '취소',
              presentation: 'modal',
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

export default AppNavigator
