---
name: api-convention
description: Supabase 클라이언트 API 설계 규칙 스킬. developer/architect 에이전트가 API 레이어 함수, RPC, Edge Function 명세를 일관되게 작성할 때 적용합니다.
---

Supabase 기반 API를 설계·구현할 때 아래 규칙을 반드시 따릅니다.

## API 레이어 함수 명명 규칙

```
{동사}{명사}  →  camelCase

조회: get{리소스}       getProfile, getAchievements, getSessions
생성: create{리소스}    createSession, createAchievement
수정: update{리소스}    updateProfile, updateAnswer
삭제: delete{리소스}    deleteAchievement (soft delete 포함)
계산: calculate{명사}   calculateMarketValue
검증: verify{명사}      verifyAchievement
```

---

## 함수 반환 타입 규칙

모든 API 함수는 Supabase의 `{ data, error }` 구조를 그대로 반환합니다.

```typescript
// ✅ 올바른 예: { data, error } 반환
export const getProfile = () =>
  supabase.from('profiles').select('*').single()
// 반환 타입: Promise<{ data: Profile | null; error: PostgrestError | null }>

// ✅ 올바른 예: RPC 함수
export const createSession = async (): Promise<{
  data: CheckinSession | null
  error: PostgrestError | AuthError | null
}> => {
  const { data, error } = await supabase.rpc('create_checkin_session', { ... })
  if (error) return { data: null, error }
  return { data: Array.isArray(data) ? data[0] : data, error: null }
}

// ❌ 잘못된 예: 에러를 삼키고 데이터만 반환
export const getProfile = async () => {
  const { data } = await supabase.from('profiles').select('*').single()
  return data  // error 정보 손실
}
```

---

## Supabase 쿼리 패턴

### SELECT (조회)

```typescript
// 단일 레코드
supabase.from('profiles').select('*').eq('user_id', uid).single()

// 목록 (RLS가 자동으로 본인 데이터만 필터링)
supabase.from('achievements').select('*').is('deleted_at', null)

// JOIN (관계 테이블 포함)
supabase
  .from('profile_skills')
  .select('id, level, skills(id, name, category)')

// 정렬 + 페이지네이션
supabase
  .from('achievements')
  .select('*')
  .order('started_at', { ascending: false })
  .limit(20)
  .range(0, 19)

// 조건 필터 종류
.eq('column', value)           // 같음
.neq('column', value)          // 다름
.is('deleted_at', null)        // NULL 체크
.in('status', ['A', 'B'])     // IN 조건
.gte('year', 2023)             // >= 조건
.like('name', '%검색어%')      // LIKE 검색
```

### INSERT (생성)

```typescript
// 단일 삽입 + 결과 반환
supabase
  .from('achievements')
  .insert({ user_id: uid, title, description })
  .select()
  .single()

// UPSERT (충돌 시 업데이트)
supabase
  .from('profiles')
  .upsert({ user_id: uid, job_title }, { onConflict: 'user_id' })
  .select()
  .single()
```

### UPDATE (수정)

```typescript
// 조건부 업데이트
supabase
  .from('profiles')
  .update({ job_title, bio, updated_at: new Date().toISOString() })
  .eq('user_id', uid)
  .select()
  .single()
```

### DELETE (삭제)

```typescript
// Soft Delete (권장)
supabase
  .from('achievements')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', achievementId)

// Hard Delete (불가역 — 주의 사용)
supabase.from('table').delete().eq('id', id)
```

---

## RPC (PostgreSQL 함수) 명세 작성 형식

```markdown
### RPC: create_checkin_session

- **설명**: 분기 체크인 세션을 생성하고 AI 질문을 자동 삽입합니다.
- **보안**: SECURITY DEFINER (RLS 우회, 질문 INSERT 허용)
- **권한**: authenticated 유저만 호출 가능

**파라미터**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| p_quarter | checkin_quarter | 'Q1' \| 'Q2' \| 'Q3' \| 'Q4' |
| p_year | integer | 연도 (2000~2100) |

**반환**: `SETOF checkin_sessions` → 클라이언트에서 `data[0]`으로 접근

**에러 케이스**
| 에러 코드 | 상황 |
|----------|------|
| 23505 | 동일 분기 세션 중복 (unique violation) |
| PGRST301 | 인증 토큰 없음 |
```

---

## Edge Function 명세 작성 형식

```markdown
### Edge Function: calculate-market-value

- **설명**: AI 기반 마켓밸류 점수와 연봉 범위를 계산하여 스냅샷을 저장합니다.
- **인증**: Supabase Auth JWT 필수 (Authorization 헤더 자동 전달)
- **서비스 롤**: 내부에서 service_role 키로 DB 접근 (RLS 우회)

**요청 Body**: 없음 (JWT에서 user_id 추출)

**응답 200**
```json
{
  "score": 84.5,
  "salary_min": 7500,
  "salary_max": 9500,
  "hire_probability": 82.0
}
```

**클라이언트 호출**
```typescript
const { data, error } = await supabase.functions.invoke('calculate-market-value')
```
```

---

## 에러 처리 규칙

### Supabase 에러 타입

| 에러 타입 | 발생 상황 | 처리 방법 |
|----------|----------|----------|
| `PostgrestError` | DB 쿼리 실패 | `error.code`로 분기 |
| `AuthError` | 인증 실패/만료 | 로그아웃 후 로그인으로 이동 |
| `FunctionsHttpError` | Edge Function 오류 | `error.context.json()` 파싱 |

### 주요 PostgreSQL 에러 코드

```typescript
// 자주 쓰는 에러 코드
'23505'   // unique_violation (중복 데이터)
'23503'   // foreign_key_violation (참조 오류)
'42501'   // insufficient_privilege (RLS 차단)
'PGRST116' // 0 rows returned (.single() 실패)
'PGRST301' // JWT 만료 또는 없음

// Screen에서 에러 분기 예시
if (error?.code === '23505') {
  setToast({ type: 'info', message: '이미 이번 분기 체크인이 있어요!' })
} else {
  setToast({ type: 'error', message: error?.message ?? '오류가 발생했습니다.' })
}
```

---

## 실시간 구독 패턴 (필요 시)

```typescript
// src/api/realtime.api.ts
export const subscribeToVerifications = (
  achievementId: string,
  callback: (payload: RealtimePayload) => void,
) =>
  supabase
    .channel(`verifications:${achievementId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'peer_verifications',
      filter: `achievement_id=eq.${achievementId}`,
    }, callback)
    .subscribe()

// 구독 해제 (cleanup)
export const unsubscribe = (channel: RealtimeChannel) =>
  supabase.removeChannel(channel)
```
