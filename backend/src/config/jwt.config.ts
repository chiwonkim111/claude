/**
 * JWT 인증 설정
 * - Access Token: 1시간 만료
 * - Refresh Token: 30일 만료
 */
export const jwtConfig = {
  // Access Token 시크릿 키 및 만료 설정
  access: {
    secret: process.env.JWT_ACCESS_SECRET ?? 'default-access-secret',
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1h',
  },

  // Refresh Token 시크릿 키 및 만료 설정
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
}
