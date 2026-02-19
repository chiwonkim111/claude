---
name: api-convention
description: REST API 설계 규칙 스킬. architect 에이전트가 API 명세를 작성할 때 URL 패턴, 응답 형식, 에러 코드 체계를 일관되게 적용합니다.
---

REST API를 설계할 때 아래 규칙을 반드시 따릅니다.

## URL 설계 규칙

### 기본 원칙
- URL은 **명사(리소스)**로 표현합니다. 동사 사용 금지.
- 리소스는 항상 **복수형**을 사용합니다.
- 단어 구분은 **kebab-case**를 사용합니다.
- URL에 버전을 포함합니다: `/api/v1/`

```
✅ GET  /api/v1/users
✅ GET  /api/v1/users/{id}
✅ POST /api/v1/users
✅ GET  /api/v1/users/{id}/orders

❌ GET  /api/v1/getUser
❌ POST /api/v1/user/create
❌ GET  /api/v1/userOrders
```

### HTTP 메서드 의미

| 메서드 | 용도 | 멱등성 | 예시 |
|--------|------|--------|------|
| `GET` | 조회 | O | `GET /users` |
| `POST` | 생성 | X | `POST /users` |
| `PUT` | 전체 수정 | O | `PUT /users/{id}` |
| `PATCH` | 부분 수정 | O | `PATCH /users/{id}` |
| `DELETE` | 삭제 | O | `DELETE /users/{id}` |

### 특수 액션 URL (동사가 불가피한 경우)
```
POST /api/v1/users/{id}/activate     -- 계정 활성화
POST /api/v1/auth/login              -- 로그인
POST /api/v1/auth/logout             -- 로그아웃
POST /api/v1/auth/refresh            -- 토큰 갱신
POST /api/v1/payments/{id}/cancel    -- 결제 취소
```

---

## 응답 형식 표준

모든 API 응답은 아래 구조를 따릅니다.

### 성공 응답
```json
{
  "success": true,
  "data": { },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### 목록 조회 응답 (페이지네이션 포함)
```json
{
  "success": true,
  "data": [ ],
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 실패 응답
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "details": [ ]
  },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### 유효성 검사 실패 응답 (422)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다.",
    "details": [
      { "field": "email", "message": "이메일 형식이 올바르지 않습니다." },
      { "field": "password", "message": "비밀번호는 8자 이상이어야 합니다." }
    ]
  }
}
```

---

## HTTP 상태 코드 사용 기준

| 코드 | 의미 | 사용 시점 |
|------|------|----------|
| `200` | OK | 조회/수정/삭제 성공 |
| `201` | Created | 리소스 생성 성공 |
| `204` | No Content | 응답 바디 없는 성공 (삭제 등) |
| `400` | Bad Request | 요청 형식 오류 |
| `401` | Unauthorized | 인증 필요 (토큰 없음/만료) |
| `403` | Forbidden | 권한 없음 (인증은 됐으나 접근 불가) |
| `404` | Not Found | 리소스 없음 |
| `409` | Conflict | 중복 데이터 (이메일 중복 등) |
| `422` | Unprocessable Entity | 유효성 검사 실패 |
| `429` | Too Many Requests | Rate Limit 초과 |
| `500` | Internal Server Error | 서버 내부 오류 |

---

## 에러 코드 체계

에러 코드는 `{도메인}_{상황}` 형식으로 정의합니다.

```
AUTH_INVALID_CREDENTIALS      -- 인증: 이메일/비밀번호 불일치
AUTH_TOKEN_EXPIRED            -- 인증: 토큰 만료
AUTH_TOKEN_INVALID            -- 인증: 토큰 변조/형식 오류
AUTH_ACCOUNT_LOCKED           -- 인증: 계정 잠금

USER_NOT_FOUND                -- 사용자: 존재하지 않음
USER_EMAIL_DUPLICATED         -- 사용자: 이메일 중복
USER_PERMISSION_DENIED        -- 사용자: 권한 없음

VALIDATION_ERROR              -- 공통: 유효성 검사 실패
RESOURCE_NOT_FOUND            -- 공통: 리소스 없음
INTERNAL_SERVER_ERROR         -- 공통: 서버 오류
RATE_LIMIT_EXCEEDED           -- 공통: 요청 한도 초과
```

---

## API 명세 작성 형식

```markdown
### POST /api/v1/auth/login

- **설명**: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급합니다.
- **인증**: 불필요
- **Rate Limit**: 분당 10회

**Request Body**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| email | string | ✅ | 사용자 이메일 |
| password | string | ✅ | 비밀번호 (8자 이상) |

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600
  }
}
```

**Error Cases**
| 상태 코드 | 에러 코드 | 상황 |
|----------|----------|------|
| 401 | AUTH_INVALID_CREDENTIALS | 이메일 또는 비밀번호 불일치 |
| 403 | AUTH_ACCOUNT_LOCKED | 5회 이상 실패로 계정 잠금 |
| 429 | RATE_LIMIT_EXCEEDED | 분당 10회 초과 |
```

---

## 인증 방식

- **Access Token**: JWT, 만료 1시간, `Authorization: Bearer {token}` 헤더
- **Refresh Token**: JWT, 만료 30일, HttpOnly Cookie 저장
- **보호된 엔드포인트**: 모든 요청에 Authorization 헤더 필수
- **토큰 갱신**: `POST /api/v1/auth/refresh` (Refresh Token 쿠키 자동 전송)
