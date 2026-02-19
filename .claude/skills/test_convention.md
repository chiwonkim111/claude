---
name: test-convention
description: 테스트 코드 작성 규칙 스킬. developer 에이전트가 단위 테스트, 통합 테스트, E2E 테스트를 일관된 형식과 원칙으로 작성할 때 사용합니다.
---

테스트 코드를 작성할 때 아래 규칙을 반드시 따릅니다.

## 테스트 종류 및 범위

| 종류 | 대상 | 도구 | 비율 |
|------|------|------|------|
| **단위 테스트** | Domain Entity, UseCase, 유틸 함수 | Jest / Vitest | 70% |
| **통합 테스트** | Repository, API 엔드포인트 | Jest + Supertest | 20% |
| **E2E 테스트** | 핵심 사용자 시나리오 | Playwright / Cypress | 10% |

---

## 테스트 파일 위치 규칙

```
src/
├── modules/
│   └── users/
│       ├── users.service.ts
│       └── __tests__/              -- 같은 모듈 내 테스트 폴더
│           ├── users.service.spec.ts    -- 단위 테스트
│           └── users.integration.spec.ts -- 통합 테스트
tests/
└── e2e/
    └── auth.e2e.spec.ts            -- E2E 테스트
```

---

## 테스트 명세 작성 규칙 (AAA 패턴)

**Arrange → Act → Assert** 순서로 작성합니다.

```typescript
describe('CreateUserUseCase', () => {
  describe('execute', () => {
    it('유효한 이메일과 닉네임으로 사용자를 생성하면 userId를 반환한다.', async () => {
      // Arrange: 테스트 환경 준비
      const mockUserRepository = createMockUserRepository()
      const mockPasswordHasher = createMockPasswordHasher()
      const useCase = new CreateUserUseCase(mockUserRepository, mockPasswordHasher)

      const command = {
        email: 'test@example.com',
        nickname: '테스트유저',
        password: 'Password123!',
      }

      // Act: 실행
      const result = await useCase.execute(command)

      // Assert: 검증
      expect(result.userId).toBeDefined()
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
    })
  })
})
```

---

## describe / it 네이밍 규칙

```typescript
describe('{클래스명 또는 함수명}', () => {
  describe('{메서드명}', () => {
    it('{조건}이면 {결과}한다.', () => { ... })
    it('{조건}일 때 {예외}를 던진다.', () => { ... })
  })
})
```

**예시:**
```typescript
describe('User Entity', () => {
  describe('create', () => {
    it('유효한 이메일과 닉네임을 입력하면 ACTIVE 상태의 User를 생성한다.')
    it('이메일 형식이 올바르지 않으면 InvalidEmailException을 던진다.')
    it('닉네임이 비어 있으면 InvalidUserException을 던진다.')
  })

  describe('suspend', () => {
    it('ACTIVE 상태의 User를 정지하면 상태가 SUSPENDED로 변경된다.')
    it('이미 DELETED 상태인 User를 정지하면 InvalidUserException을 던진다.')
  })
})
```

---

## Mock 작성 규칙

### Repository Mock
```typescript
const createMockUserRepository = (): jest.Mocked<UserRepository> => ({
  findById:    jest.fn(),
  findByEmail: jest.fn(),
  save:        jest.fn(),
  delete:      jest.fn(),
})
```

### Mock 초기화
```typescript
describe('CreateUserUseCase', () => {
  let mockUserRepository: jest.Mocked<UserRepository>
  let useCase: CreateUserUseCase

  beforeEach(() => {
    // 각 테스트 전에 Mock 초기화 (테스트 간 오염 방지)
    mockUserRepository = createMockUserRepository()
    useCase = new CreateUserUseCase(mockUserRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})
```

---

## 예외 테스트 작성 규칙

```typescript
// 비동기 예외 테스트
it('이메일이 중복되면 UserEmailDuplicatedException을 던진다.', async () => {
  // Arrange
  mockUserRepository.findByEmail.mockResolvedValue(existingUser)

  // Act & Assert
  await expect(useCase.execute(command)).rejects.toThrow(UserEmailDuplicatedException)
})

// 동기 예외 테스트
it('잘못된 이메일 형식이면 InvalidEmailException을 던진다.', () => {
  expect(() => new Email('invalid-email')).toThrow(InvalidEmailException)
})
```

---

## 통합 테스트 (API 엔드포인트)

```typescript
describe('POST /api/v1/users', () => {
  it('유효한 요청으로 사용자를 생성하면 201과 userId를 반환한다.', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({
        email: 'test@example.com',
        nickname: '테스트유저',
        password: 'Password123!',
      })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.userId).toBeDefined()
  })

  it('이미 존재하는 이메일로 요청하면 409를 반환한다.', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({ email: 'existing@example.com', nickname: '중복', password: 'Password123!' })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('USER_EMAIL_DUPLICATED')
  })
})
```

---

## 테스트 커버리지 기준

| 레이어 | 목표 커버리지 | 필수 테스트 항목 |
|--------|-------------|----------------|
| Domain (Entity, VO) | 90% 이상 | 생성, 상태 변경, 예외 케이스 전체 |
| Application (UseCase) | 85% 이상 | 정상 흐름, 예외 흐름 |
| Infrastructure | 70% 이상 | 주요 쿼리, 연동 |
| Presentation | 70% 이상 | 응답 코드, 형식 |

---

## 테스트 작성 금지 사항

- 테스트끼리 상태를 공유하지 않습니다 (각 테스트는 독립적).
- 실제 외부 서비스(DB, API)에 의존하는 단위 테스트 금지 (Mock 사용).
- `it.only` / `describe.only`를 커밋에 포함하지 않습니다.
- 테스트 내부에서 `console.log`를 남기지 않습니다.
- `expect` 없는 빈 테스트를 작성하지 않습니다.
