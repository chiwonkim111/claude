/**
 * Navigation 타입 정의
 * - RootStack, AuthStack, MainTab 파라미터 타입
 * - 상단 탭 구조로 변경: 프로필 / 마켓밸류 / 설정 (2026-02-20)
 */

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  Checkin: { sessionId: string }
}

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

/**
 * 메인 탭 파라미터 타입
 * - Profile: 프로필 + 마일스톤 + 검증된 이력 통합 화면
 * - MarketValue: 마켓밸류 분석 화면 (다크 테마)
 * - Growth: 성장 기록 타임라인 화면
 */
export type MainTabParamList = {
  Profile: undefined      // 프로필
  MarketValue: undefined  // 마켓밸류
  Growth: undefined       // 성장
}
