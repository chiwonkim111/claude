/**
 * 데모 모드 목 응답 데이터
 * EXPO_PUBLIC_DEMO_MODE=true 일 때 백엔드 없이 UI 전체를 탐색할 수 있도록 사용
 */

export const DEMO_USER = { id: 1, name: '김치원', email: 'demo@remember.app' }
export const DEMO_TOKEN = 'demo-access-token'

/** URL 경로 → 목 응답 매핑 (method + path) */
export const DEMO_RESPONSES: Array<{
  match: (method: string, url: string) => boolean
  response: unknown
}> = [
  // 인증
  {
    match: (m, u) => m === 'post' && u.includes('/auth/register'),
    response: { success: true, data: { user: DEMO_USER, accessToken: DEMO_TOKEN } },
  },
  {
    match: (m, u) => m === 'post' && u.includes('/auth/login'),
    response: { success: true, data: { user: DEMO_USER, accessToken: DEMO_TOKEN } },
  },
  {
    match: (m, u) => m === 'post' && u.includes('/auth/logout'),
    response: { success: true, data: null },
  },

  // 프로필
  {
    match: (m, u) => m === 'get' && u.endsWith('/profile'),
    response: {
      success: true,
      data: {
        id: 1, userId: 1,
        jobTitle: '프론트엔드 개발자',
        companyName: '스타트업',
        yearsOfExperience: 5,
        completionScore: 72,
        isJobSeeking: false,
        marketValueMin: 6000,
        marketValueMax: 8500,
        skills: [
          { id: 1, skillName: 'React Native' },
          { id: 2, skillName: 'TypeScript' },
          { id: 3, skillName: 'Node.js' },
          { id: 4, skillName: 'PostgreSQL' },
        ],
      },
    },
  },

  // 성과
  {
    match: (m, u) => m === 'get' && u.includes('/achievements'),
    response: {
      success: true,
      data: [
        { id: 1, title: 'React Native 앱 v2.0 출시', projectName: 'Remember', period: '2025 Q4', isVerified: true, verificationCount: 3, createdAt: '2025-12-01' },
        { id: 2, title: 'API 응답 속도 40% 개선', projectName: '사내 프로젝트', period: '2025 Q3', isVerified: true, verificationCount: 1, createdAt: '2025-09-15' },
        { id: 3, title: 'CI/CD 파이프라인 구축', projectName: 'DevOps', period: '2025 Q2', isVerified: false, verificationCount: 0, createdAt: '2025-06-20' },
        { id: 4, title: '디자인 시스템 컴포넌트 라이브러리 개발', projectName: 'Design System', period: '2025 Q1', isVerified: false, verificationCount: 0, createdAt: '2025-03-10' },
      ],
    },
  },

  // 마켓 밸류
  {
    match: (m, u) => m === 'get' && u.includes('/market-value/history'),
    response: {
      success: true,
      data: [
        { id: 4, salaryMin: 6000, salaryMax: 8500, calculatedAt: '2026-01-01' },
        { id: 3, salaryMin: 5500, salaryMax: 7800, calculatedAt: '2025-10-01' },
        { id: 2, salaryMin: 5200, salaryMax: 7200, calculatedAt: '2025-07-01' },
        { id: 1, salaryMin: 4800, salaryMax: 6800, calculatedAt: '2025-04-01' },
      ],
    },
  },
  {
    match: (m, u) => m === 'get' && u.includes('/market-value') && !u.includes('history'),
    response: {
      success: true,
      data: {
        id: 4,
        salaryMin: 6000,
        salaryMax: 8500,
        hireProbability: 72,
        sampleCount: 48,
        updatedAt: new Date().toISOString(),
        positioning: {
          percentile: 68,
          strengths: ['React Native', 'TypeScript'],
          weaknesses: ['Go', 'Kubernetes'],
        },
      },
    },
  },
  {
    match: (m, u) => m === 'post' && u.includes('/market-value/calculate'),
    response: {
      success: true,
      data: {
        salaryMin: 6200,
        salaryMax: 8800,
        hireProbability: 75,
        sampleCount: 50,
        updatedAt: new Date().toISOString(),
        positioning: { percentile: 70, strengths: ['React Native', 'TypeScript'], weaknesses: [] },
      },
    },
  },

  // 체크인
  {
    match: (m, u) => m === 'post' && /\/checkins$/.test(u),
    response: { success: true, data: { id: 1, quarter: 'Q1', year: 2026, status: 'in_progress' } },
  },
  {
    match: (m, u) => m === 'get' && u.includes('/checkins/') && u.includes('/questions'),
    response: {
      success: true,
      data: [
        { id: 1, order: 1, text: '이번 분기 가장 자랑스러운 성과는 무엇인가요?', answer: null },
        { id: 2, order: 2, text: '새롭게 배운 기술이나 역량이 있다면 무엇인가요?', answer: null },
        { id: 3, order: 3, text: '함께 일한 동료에게 도움을 준 경험이 있나요?', answer: null },
        { id: 4, order: 4, text: '다음 분기에 집중하고 싶은 목표는?', answer: null },
      ],
    },
  },
  {
    match: (m, u) => m === 'patch' && u.includes('/questions/'),
    response: { success: true, data: { id: 1, answer: '' } },
  },
  {
    match: (m, u) => m === 'post' && u.includes('/complete'),
    response: { success: true, data: { sessionId: 1, status: 'completed' } },
  },

  // 알림 설정
  {
    match: (m, u) => m === 'get' && u.includes('/notifications/settings'),
    response: {
      success: true,
      data: { checkinReminderEnabled: true, marketValueAlertEnabled: true, peerRequestEnabled: true },
    },
  },
  {
    match: (m, u) => m === 'patch' && u.includes('/notifications/settings'),
    response: { success: true, data: { checkinReminderEnabled: true, marketValueAlertEnabled: true, peerRequestEnabled: true } },
  },
]

/** URL + method 로 목 응답 찾기 */
export function findDemoResponse(method: string, url: string): unknown | null {
  const entry = DEMO_RESPONSES.find((e) => e.match(method.toLowerCase(), url))
  return entry?.response ?? null
}
