/**
 * Navigation 타입 정의
 * - RootStack, AuthStack, MainTab 파라미터 타입
 */

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Checkin: { sessionId: number }
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainTabParamList = {
  Home: undefined
  Timeline: undefined
  MarketValue: undefined
  Profile: undefined
}
