/**
 * 디자인 토큰
 * - 색상, 타이포그래피, 간격, 테두리 반경, 그림자 전체 중앙 관리
 * - 모든 컴포넌트에서 이 토큰을 참조하여 일관성 유지
 * - Stitch 브랜드 팔레트 적용 (2026-02-20)
 */

/**
 * 색상 팔레트 — Stitch 브랜드 컬러
 * - Primary: Midnight Void (절대적인 검정)
 * - Accent: Ignition Orange (열정과 커리어 성장)
 * - Surface: Silent Ash (여백 있는 배경)
 */
export const colors = {
  // Primary — Midnight Void (검정)
  primary: '#000000',
  primaryDark: '#000000',
  primaryLight: '#333333',
  primaryBg: '#F4F4F4',

  // Accent — Ignition Orange (오렌지)
  accent: '#FE5314',
  accentDark: '#D94410',
  accentLight: '#FF7A47',
  accentBg: '#FFF1EC',

  // Secondary (레거시 호환 유지)
  secondary: '#FE5314',

  // 시멘틱 색상
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#DBEAFE',

  // 그레이 스케일
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F4F4F4',   // Silent Ash
  gray200: '#E8E8E8',
  gray300: '#D0D0D0',
  gray400: '#999999',
  gray500: '#6B6B6B',
  gray600: '#4A4A4A',
  gray700: '#2E2E2E',
  gray900: '#1A1A1A',   // Deep Ink

  // 배경 및 텍스트
  background: '#F4F4F4',   // Silent Ash
  surface: '#FFFFFF',       // Pure Canvas
  card: '#FFFFFF',          // Pure Canvas
  textPrimary: '#1A1A1A',  // Deep Ink
  textSecondary: '#6B6B6B',
  textDisabled: '#999999',
  textInverse: '#FFFFFF',
  border: '#E8E8E8',

  // 추가 Stitch 토큰
  midnight: '#000000',     // Midnight Void
  ignition: '#FE5314',     // Ignition Orange
  ash: '#F4F4F4',          // Silent Ash
  canvas: '#FFFFFF',       // Pure Canvas
  ink: '#1A1A1A',          // Deep Ink
} as const

/** 타이포그래피 */
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

/** 간격 — 4px 단위 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const

/** 테두리 반경 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

/** 그림자 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const

/** 최소 터치 타겟 크기 (WCAG 2.1 AA — 44×44px) */
export const touchTarget = {
  minHeight: 44,
  minWidth: 44,
} as const
