# QA 검수 리포트

> 검수일: 2026-02-20
> 검수자: qa agent
> 기준 문서: docs/PLAN.md (v1.1)
> 검수 대상: mobile/src/, supabase/schema.sql

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-20 | 최초 QA 검수 작성 |

---

## 종합 구현율

**[ 61% ]**

> ████████████░░░░░░░░ 61 / 100

MVP 필수 기능(FR-001, FR-002, FR-006, FR-007, FR-008) 기준으로 Phase 1 핵심 기능은 전반적으로 구현되어 있으나, 일부 완료 조건(Acceptance Criteria)이 미충족 상태입니다. Phase 2 기능(FR-003, FR-004)은 DB 스키마 수준에만 존재하며 UI/로직이 미구현입니다.

---

## 기능별 구현 현황

| # | 기능 ID | 기능명 | 상태 | 점수 | 비고 |
|---|---------|--------|------|------|------|
| 1 | FR-001 | 분기별 성과 체크 (Quarterly Check-in) | 부분 구현 | 50% | 텍스트 입력 지원, 음성 입력 미구현. 완료 후 마켓밸류 CTA 미연결. 임시저장(이탈 복원) 미구현 |
| 2 | FR-002 | 실시간 마켓 밸류 | 부분 구현 | 50% | 연봉 범위·채용 확률·변화량 시각화 구현. Edge Function 미배포로 실시간 계산 불가. 벤치마킹 UI 미구현. "연봉 10% 올리려면?" 버튼 미구현 |
| 3 | FR-003 | 동료 상호 인증 (Peer Verification) | 부분 구현 | 50% | DB 스키마(peer_verifications) 및 VerificationBadge 컴포넌트 존재. 인증 요청 화면(SCR-006), 인증 수신 화면(SCR-007), 인증 API 로직 미구현 |
| 4 | FR-004 | AI 채팅 로그 동기화 | 미구현 | 0% | Phase 2 예정. 코드 없음 |
| 5 | FR-005 | 커리어 패스 제안 | 미구현 | 0% | Phase 3 예정. 코드 없음 |
| 6 | FR-006 | 푸시 알림 개인화 | 부분 구현 | 50% | notification_settings 테이블 및 UI 스위치 구현 완료. 실제 푸시 발송 로직(Expo Notifications 또는 FCM 연동), 분기 자동 발송 스케줄러 미구현 |
| 7 | FR-007 | 성과 타임라인 | 구현됨 | 100% | HomeScreen 내 통합 구현, TimelineScreen 별도 구현, 필터(전체/인증완료/인증대기) 지원. AchievementCard 컴포넌트 완비 |
| 8 | FR-008 | 프로필 완성도 스코어 | 부분 구현 | 50% | ProfileCompletionBar 컴포넌트(Reanimated 애니메이션) 구현. DB의 completeness 필드 연동. 체크인 완료 시 즉시 스코어 갱신 트리거 미구현 |

### 화면(SCR) 구현 현황

| 화면 ID | 화면명 | 상태 | 비고 |
|---------|--------|------|------|
| SCR-001 | 분기 체크인 진입 | 구현됨 | HomeScreen 체크인 CTA → CheckinScreen 이동 |
| SCR-002 | AI 질문 카드 | 부분 구현 | QuestionCard(텍스트) 구현. 스와이프 카드형 UX 미적용(스크롤 방식) |
| SCR-003 | 성과 입력 완료 | 부분 구현 | 토스트 알림으로 완료 처리. 별도 완료 화면·완성도 애니메이션·마켓밸류 CTA 미구현 |
| SCR-004 | 마켓 밸류 대시보드 | 부분 구현 | 연봉 범위·채용 확률 구현. 벤치마킹·AI 분석 리포트 버튼 미구현 |
| SCR-005 | 성과 타임라인 | 구현됨 | TimelineScreen + HomeScreen 내 통합 구현 |
| SCR-006 | 동료 인증 요청 | 미구현 | 코드 없음 |
| SCR-007 | 동료 인증 수신 | 미구현 | 코드 없음 |
| SCR-008 | AI 로그 업로드 | 미구현 | Phase 2 예정 |
| SCR-009 | 추출 결과 확인 | 미구현 | Phase 2 예정 |
| SCR-010 | 커리어 패스 설정 | 미구현 | Phase 3 예정 |
| SCR-011 | 분기 미션 카드 | 미구현 | Phase 3 예정 |

---

## 이슈 목록

### Critical — 즉시 수정 필요

**[ISSUE-001] 마켓 밸류 Edge Function 미배포로 실시간 계산 불가**
- 위치: `mobile/src/api/market-value.api.ts` L36, `MarketValueScreen.tsx` L54
- 현상: `calculateMarketValue()` 호출 시 Edge Function `calculate-market-value` 미배포로 "Edge Function이 아직 배포되지 않았어요" 토스트만 출력됨
- 영향: FR-002 핵심 기능인 실시간 마켓 밸류 계산이 실제로 동작하지 않음
- 코드 근거:
  ```typescript
  // market-value.api.ts — calculateMarketValue
  export const calculateMarketValue = () =>
    supabase.functions.invoke('calculate-market-value')
  // MarketValueScreen.tsx — 에러 처리에서 Edge Function 미배포 상황을 명시적으로 인지
  setToast({ type: 'info', message: 'Edge Function이 아직 배포되지 않았어요.' })
  ```
- 개선 방안: Supabase Edge Function `calculate-market-value` 구현 및 배포 필요

**[ISSUE-002] 체크인 완료 후 전용 완료 화면 없음 — Acceptance Criteria 미충족**
- 위치: `CheckinScreen.tsx` L99
- 현상: 체크인 완료 시 토스트 1.5초 후 이전 화면으로 이동. 완성도 스코어 상승 애니메이션, "내 연봉 범위 확인하기" CTA 모두 미노출
- 영향: FR-001, FR-008의 완료 조건("완료 화면에서 CTA 노출", "완성도 스코어 즉시 반영 애니메이션") 미충족

**[ISSUE-003] 체크인 완료 시 프로필 완성도(completeness) 자동 갱신 미구현**
- 위치: `CheckinScreen.tsx` L90-106, `supabase/schema.sql`
- 현상: `completeCheckin()` 호출 시 체크인 세션 상태만 COMPLETED로 변경. profiles.completeness 필드 갱신 로직 없음
- 코드 근거:
  ```typescript
  // completeCheckin은 checkin_sessions.status만 업데이트
  export const completeCheckin = (sessionId: string) =>
    supabase
      .from('checkin_sessions')
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
      .eq('id', sessionId)
  ```
- 개선 방안: 체크인 완료 트리거(DB 함수) 또는 클라이언트에서 `updateProfile({ completeness: newScore })` 호출 추가

**[ISSUE-004] 프로필 수정 기능 미구현**
- 위치: `HomeScreen.tsx` L461
- 현상: 프로필 헤더의 수정 버튼이 "준비 중이에요!" 토스트만 표시
- 코드 근거:
  ```typescript
  onEditPress={() => setToast({ type: 'info', message: '프로필 수정 기능 — 준비 중이에요!' })}
  ```
- 영향: `updateProfile` API는 구현되어 있으나 UI가 없어 사용자가 직함, 회사, 경력 등을 수정할 수 없음

---

### Warning — 개선 권장

**[ISSUE-005] 성과 수동 등록 UI 미구현 (FAB 버튼 동작 안 함)**
- 위치: `HomeScreen.tsx` L550, `TimelineScreen.tsx` L112
- 현상: FAB(+) 버튼이 "준비 중이에요!" 토스트만 출력. `createAchievement` API는 `achievement.api.ts` L22에 구현되어 있으나 UI 미연결
- 개선 방안: 성과 등록 모달 또는 별도 화면 구현

**[ISSUE-006] 체크인 질문이 스와이프 카드형이 아닌 스크롤 방식으로 구현**
- 위치: `CheckinScreen.tsx` L125, `QuestionCard.tsx`
- 현상: 기획서 SCR-002는 "스와이프 카드형" 명시. 현재는 ScrollView + QuestionCard 목록으로 모든 질문이 한 번에 표시됨
- 영향: UX 차이. "5분 이내 완료" 목표에 부합하나 기획 명세와 불일치

**[ISSUE-007] 음성 입력 미지원**
- 위치: FR-001 완료 조건 — "음성·텍스트 혼합 입력이 모두 지원된다"
- 현상: `QuestionCard.tsx`는 TextInput만 제공. 음성 입력 관련 코드 전무
- 개선 방안: Expo Speech-to-Text 또는 React Native Voice 라이브러리 연동 필요

**[ISSUE-008] 체크인 이탈 시 임시 저장 미구현**
- 위치: FR-001 완료 조건 — "입력 중 이탈 시 임시 저장 → 재진입 시 이어서 작성 가능"
- 현상: 800ms 디바운스로 Supabase에 실시간 저장은 되나, 세션 재진입 시 기존 답변 복원 플로우가 HomeScreen → CheckinScreen 진입 시 항상 새 세션을 생성하는 구조
- 코드 근거:
  ```typescript
  // HomeScreen.tsx — handleStartCheckin은 항상 createSession()을 호출
  const { data: session, error } = await createSession()
  ```
  기존 PENDING/IN_PROGRESS 세션 조회 후 재진입하는 로직 없음

**[ISSUE-009] 동료 인증 요청/수신 화면 완전 미구현**
- 위치: SCR-006, SCR-007
- 현상: DB 스키마(peer_verifications), RLS 정책, VerificationBadge 컴포넌트는 구현되어 있으나 실제 인증 요청·응답 UI 및 API 로직 코드 없음
- 영향: FR-003 기능의 유저 플로우 전체 미동작

**[ISSUE-010] 마켓 밸류 벤치마킹 UI 미구현**
- 위치: FR-002 완료 조건 — "동일 직무 타 사용자 대비 강점/약점 벤치마킹 익명 제공"
- 현상: metadata.positioning.strengths(강점 스킬)는 표시되나, 약점(weaknesses) 표시 없음. "내 연봉 10% 올리려면?" AI 분석 리포트 버튼 없음
- 코드 근거:
  ```typescript
  // MarketValueScreen.tsx L98-111 — strengths만 표시, weaknesses 미표시
  {marketValue.metadata.positioning.strengths?.length > 0 && (
    // 강점 스킬만 렌더링...
  )}
  ```

**[ISSUE-011] 실제 푸시 알림 발송 미구현**
- 위치: FR-006 — "분기 말 2주 전 푸시 알림 자동 발송"
- 현상: notification_settings UI(토글 스위치)는 구현되어 있으나 실제 알림 발송을 위한 Expo Notifications 권한 요청, 토큰 등록, 분기 스케줄러(Edge Function/Supabase pg_cron) 미구현

**[ISSUE-012] TimelineScreen이 네비게이션에 미등록**
- 위치: `AppNavigator.tsx`, `mobile/src/screens/Timeline/TimelineScreen.tsx`
- 현상: TimelineScreen.tsx 파일은 존재하나 AppNavigator에 탭 또는 스택으로 등록되지 않아 실제 접근 불가. HomeScreen 내에 성과 타임라인이 통합되어 TimelineScreen이 사실상 사용되지 않는 중복 파일임
- 개선 방안: TimelineScreen을 별도 탭/화면으로 등록하거나, 중복 파일로 판단되면 제거 후 HomeScreen 통합 유지

---

### Info — 참고 사항

**[ISSUE-013] demo-responses.ts의 필드명이 실제 Supabase 스키마와 불일치**
- 위치: `mobile/src/api/demo-responses.ts`
- 현상: 데모 데이터는 `order`, `text`, `isVerified`, `verificationCount` 등 camelCase 구조를 사용하나 실제 Supabase 스키마는 `seq`, `question`, `is_verified` 등 snake_case 사용
- 영향: 데모 모드(`EXPO_PUBLIC_DEMO_MODE=true`) 사용 시 UI 렌더링 불일치 가능성

**[ISSUE-014] market_value_score 필드가 스키마에 없음**
- 위치: `HomeScreen.tsx` L441, `supabase/schema.sql`
- 현상: HomeScreen 스탯 바에서 `profileData?.market_value_score`를 참조하나 profiles 테이블에 해당 컬럼 없음. market_value_snapshots.score 컬럼이 별도 테이블에 존재
- 코드 근거:
  ```typescript
  // HomeScreen.tsx L441 — profiles 테이블에 없는 컬럼 참조
  { value: profileData?.market_value_score ? `${profileData.market_value_score}` : '-', label: '마켓밸류' },
  ```
- 개선 방안: market_value_snapshots에서 최신 score를 조회하거나, profiles에 캐시 컬럼 추가 필요

**[ISSUE-015] checkin_count 필드가 profiles 스키마에 없음**
- 위치: `HomeScreen.tsx` L442
- 현상: `profileData?.checkin_count`를 참조하나 profiles 테이블에 해당 컬럼 없음. 항상 0 표시
- 코드 근거:
  ```typescript
  { value: profileData?.checkin_count ?? 0, label: '체크인' },
  ```
- 개선 방안: checkin_sessions 테이블에서 COUNT 쿼리로 집계하거나, profiles에 집계 캐시 컬럼 추가 필요

**[ISSUE-016] 비기능 요구사항 — WCAG 2.1 AA 접근성 부분 준수**
- 현상: `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, `hitSlop` 등 기본 접근성 속성은 적용되어 있으나 다음 항목 미확인:
  - 컬러 대비율 검증 미완료 (예: `rgba(255,255,255,0.45)` 텍스트)
  - TextInput에 `accessibilityLabel` 일부 미적용 (LoginScreen Input 컴포넌트)
  - VoiceOver/TalkBack 포커스 순서 검증 미완료

**[ISSUE-017] 보안 — 민감 정보 로그 노출 주의 필요**
- 위치: `HomeScreen.tsx` L417
- 현상: 에러 메시지를 사용자에게 그대로 노출하는 로직이 있어 Supabase 내부 에러 메시지가 Toast에 표시될 수 있음
- 코드 근거:
  ```typescript
  message: isDup ? '이미 이번 분기 체크인이 있어요!' : (msg || '체크인 생성에 실패했습니다.'),
  ```
  주석으로 "실제 에러 메시지를 표시해 디버깅 가능하도록"이라고 명시되어 있어 개발 편의를 위한 의도적 처리이나 프로덕션 배포 전 수정 필요

---

## 비기능 요구사항 검수

| 항목 | 요구사항 | 현재 상태 | 판정 |
|------|----------|----------|------|
| 성능 | 마켓 밸류 계산 5초 이내 | Edge Function 미배포로 측정 불가 | 미충족 |
| 성능 | AI 질문 생성 3초 이내 | Supabase RPC `create_checkin_session` 로컬 질문 삽입. 실 환경 미측정 | 조건부 |
| 보안 | AI 채팅 로그 서버 비저장 | FR-004 미구현. 해당 없음 | 해당 없음 |
| 보안 | 개인정보 암호화 저장 | Supabase 기본 암호화 적용. AES-256 확인 필요 | 조건부 |
| 가용성 | 서비스 uptime 99.9% | Supabase 관리형 서비스 의존. 별도 SLA 확인 필요 | 조건부 |
| 접근성 | WCAG 2.1 AA | 기본 속성 적용. 전체 검증 미완료 | 부분 충족 |
| 보안 | 동일인 과다 인증 가중치 제한 | peer_verifications 테이블만 존재. 어뷰징 방지 로직 미구현 | 미충족 |

---

## DB 스키마 검수

| 테이블 | 평가 | 비고 |
|--------|------|------|
| profiles | 양호 | updated_at 트리거, RLS 정책 완비. checkin_count, market_value_score 캐시 컬럼 부재 |
| skills | 양호 | pg_trgm 기반 검색 인덱스 적용 |
| profile_skills | 양호 | 다대다 연결 정규화 완료. UNIQUE 제약 적용 |
| checkin_sessions | 양호 | UNIQUE(user_id, quarter, year) 중복 방지. ENUM 타입 정의 |
| checkin_questions | 양호 | INSERT는 service_role만 허용(RLS 설계 올바름). 세션당 최대 4개 제약 |
| achievements | 양호 | Soft delete(deleted_at) 지원. RLS 정책 내 deleted_at IS NULL 필터 포함 |
| peer_verifications | 양호 | 자기 자신 인증 방지 CHECK 제약(`requester_id <> verifier_id`) 적용. 어뷰징 방지 가중치 로직은 애플리케이션 레이어 구현 필요 |
| market_value_snapshots | 양호 | metadata JSONB로 확장성 확보. salary_min <= salary_max CHECK 제약 |
| notification_settings | 양호 | 회원가입 트리거로 자동 생성. RLS 정책 완비 |
| notification_logs | 미존재 | notification.api.ts 주석에 "schema.sql에 미포함" 명시. 알림 발송 이력 추적 불가 |

---

## 액션 아이템

| 우선순위 | 항목 | 이슈 번호 | 담당 | 기한 |
|---------|------|----------|------|------|
| P0 | Supabase Edge Function `calculate-market-value` 구현 및 배포 | ISSUE-001 | 개발팀 | 즉시 |
| P0 | 체크인 완료 화면(SCR-003) 구현 — 완성도 애니메이션 + 마켓밸류 CTA | ISSUE-002 | 개발팀 | 즉시 |
| P0 | 체크인 완료 시 profiles.completeness 자동 갱신 로직 추가 | ISSUE-003 | 개발팀 | 즉시 |
| P1 | 프로필 수정 화면 구현 (직함, 회사, 경력 편집) | ISSUE-004 | 개발팀 | 이번 스프린트 |
| P1 | 기존 체크인 세션 재진입 플로우 구현 (임시 저장 복원) | ISSUE-008 | 개발팀 | 이번 스프린트 |
| P1 | HomeScreen 스탯 바 `market_value_score`, `checkin_count` 실제 데이터 연동 | ISSUE-014, ISSUE-015 | 개발팀 | 이번 스프린트 |
| P1 | 성과 수동 등록 UI(모달 또는 화면) 구현 | ISSUE-005 | 개발팀 | 이번 스프린트 |
| P2 | 동료 인증 요청/수신 화면(SCR-006, SCR-007) 및 API 구현 | ISSUE-009 | 개발팀 | 다음 스프린트 |
| P2 | 실제 푸시 알림 발송 구현 (Expo Notifications + 분기 스케줄러) | ISSUE-011 | 개발팀 | 다음 스프린트 |
| P2 | 마켓 밸류 약점 스킬, AI 분석 리포트 버튼 구현 | ISSUE-010 | 개발팀 | 다음 스프린트 |
| P2 | TimelineScreen 네비게이션 등록 또는 중복 파일 정리 | ISSUE-012 | 개발팀 | 다음 스프린트 |
| P3 | 음성 입력 기능 구현 | ISSUE-007 | 개발팀 | Phase 2 |
| P3 | 체크인 질문 스와이프 카드형 UX 전환 | ISSUE-006 | 개발팀 | Phase 2 |
| P3 | demo-responses.ts 필드명 Supabase 스키마 일치 보정 | ISSUE-013 | 개발팀 | 다음 스프린트 |
| P3 | 프로덕션 배포 전 에러 메시지 노출 방식 수정 | ISSUE-017 | 개발팀 | 배포 전 |
| P3 | WCAG 2.1 AA 컬러 대비율 전체 검증 | ISSUE-016 | 개발팀 | 배포 전 |

---

## 잘 구현된 사항 (긍정 평가)

- Supabase RLS 정책이 모든 테이블에 빠짐없이 적용되어 있으며 설계가 올바름
- `fn_handle_new_user` 트리거로 회원가입 시 profiles, notification_settings 자동 생성
- `requester_id <> verifier_id` CHECK 제약으로 자기 자신 인증 방지
- Reanimated 기반 진행률 바, 마켓 밸류 게이지, 프로필 완성도 바 애니메이션 구현
- Zustand 스토어를 통한 상태 관리 구조 일관성 유지
- 800ms 디바운스 자동 저장으로 사용자 데이터 손실 최소화
- Skeleton 로딩 컴포넌트로 로딩 상태 UX 처리
- 접근성 속성(accessibilityRole, accessibilityLabel, accessibilityState) 주요 컴포넌트에 적용
- 디자인 토큰(tokens.ts) 중앙화로 Stitch 브랜드 팔레트 일관 적용
- 한국어 블록 주석이 모든 파일 상단 및 주요 함수에 체계적으로 작성됨

---

## 다음 검수 권장 시점

**P0 이슈(Edge Function 배포, 완료 화면, completeness 갱신) 처리 완료 후 즉시 재검수 권장**

재검수 시 중점 확인 사항:
1. Edge Function 실제 동작 확인 및 응답 시간 p95 측정 (목표: 5초 이내)
2. 체크인 완료 → 완성도 스코어 갱신 → 마켓 밸류 화면 전환 전체 플로우 E2E 검증
3. Supabase RPC `create_checkin_session` 동작 확인 (기존 세션 중복 처리 포함)
