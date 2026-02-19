---
name: clean-architecture-rule
description: 클린 아키텍처 레이어별 구현 규칙 스킬. developer 에이전트가 각 레이어의 역할, 의존성 방향, 구현 패턴을 일관되게 적용할 때 사용합니다.
---

코드를 구현할 때 아래 클린 아키텍처 규칙을 반드시 따릅니다.

## 레이어 구조 및 의존성

```
┌─────────────────────────────────┐
│       Presentation Layer        │  Controller, Router, Request/Response DTO
├─────────────────────────────────┤
│       Application Layer         │  UseCase, Command, Query, Application DTO
├─────────────────────────────────┤
│         Domain Layer            │  Entity, ValueObject, Repository Interface, Domain Event
├─────────────────────────────────┤
│      Infrastructure Layer       │  Repository Impl, ORM, External API, Config
└─────────────────────────────────┘

의존성 방향: Presentation → Application → Domain ← Infrastructure
```

**핵심 원칙**: Domain Layer는 어떤 외부 레이어도 import하지 않습니다.

---

## Domain Layer 규칙

### Entity
- 고유 식별자(`id`)를 가진 비즈니스 핵심 객체입니다.
- 비즈니스 규칙과 불변식(Invariant)을 내부에 캡슐화합니다.
- ORM 모델이나 DB 구조에 의존하지 않습니다.
- 상태 변경은 반드시 메서드를 통해서만 수행합니다.

```typescript
// ✅ 올바른 Entity 예시
export class User {
  private constructor(
    private readonly _id: string,
    private _email: Email,           // Value Object
    private _nickname: string,
    private _status: UserStatus,
    private readonly _createdAt: Date,
  ) {}

  static create(email: string, nickname: string): User {
    // 비즈니스 규칙 검증
    if (!email || !nickname) throw new InvalidUserException('필수값 누락')
    return new User(
      generateId(),
      new Email(email),
      nickname,
      UserStatus.ACTIVE,
      new Date(),
    )
  }

  // 상태 변경 메서드 (직접 필드 수정 금지)
  suspend(): void {
    if (this._status === UserStatus.DELETED) {
      throw new InvalidUserException('삭제된 사용자는 정지할 수 없습니다.')
    }
    this._status = UserStatus.SUSPENDED
  }

  get id(): string { return this._id }
  get email(): string { return this._email.value }
  get status(): UserStatus { return this._status }
}
```

### Value Object
- 식별자 없이 값 자체로 동일성을 판단하는 객체입니다.
- 불변(Immutable)으로 구현합니다.
- 자체 유효성 검사 로직을 포함합니다.

```typescript
export class Email {
  private readonly _value: string

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailException(`올바르지 않은 이메일 형식: ${value}`)
    }
    this._value = value.toLowerCase()
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  get value(): string { return this._value }

  equals(other: Email): boolean {
    return this._value === other._value
  }
}
```

### Repository Interface
- Domain Layer에 인터페이스만 정의합니다. 구현체는 Infrastructure에 위치합니다.

```typescript
export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
```

### Domain Exception
```typescript
export class InvalidUserException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidUserException'
  }
}
```

---

## Application Layer 규칙

### UseCase
- 하나의 UseCase는 하나의 비즈니스 유스케이스만 처리합니다.
- Repository는 생성자 주입(DI)으로 받습니다.
- 트랜잭션 경계를 관리합니다.

```typescript
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,      // 인터페이스 주입
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // 1. 중복 검사
    const exists = await this.userRepository.findByEmail(command.email)
    if (exists) throw new UserEmailDuplicatedException(command.email)

    // 2. 비밀번호 해시
    const hashedPassword = await this.passwordHasher.hash(command.password)

    // 3. 도메인 객체 생성
    const user = User.create(command.email, command.nickname, hashedPassword)

    // 4. 저장
    await this.userRepository.save(user)

    return { userId: user.id }
  }
}

// Command DTO (입력)
export interface CreateUserCommand {
  email: string
  nickname: string
  password: string
}

// Result DTO (출력)
export interface CreateUserResult {
  userId: string
}
```

---

## Infrastructure Layer 규칙

### Repository 구현체
- Domain의 Repository 인터페이스를 구현합니다.
- ORM(TypeORM, Prisma 등) 또는 DB 쿼리를 직접 사용합니다.
- Domain Entity ↔ ORM 모델 변환을 담당합니다.

```typescript
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.dataSource
      .getRepository(UserEntity)
      .findOne({ where: { id } })

    if (!record) return null
    return this.toDomain(record)   // ORM 모델 → Domain Entity 변환
  }

  async save(user: User): Promise<void> {
    const entity = this.toEntity(user)   // Domain Entity → ORM 모델 변환
    await this.dataSource.getRepository(UserEntity).save(entity)
  }

  // ORM 모델 → Domain Entity
  private toDomain(record: UserEntity): User {
    return User.reconstitute(record.id, record.email, record.nickname, record.status)
  }

  // Domain Entity → ORM 모델
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity()
    entity.id = user.id
    entity.email = user.email
    entity.nickname = user.nickname
    entity.status = user.status
    return entity
  }
}
```

---

## Presentation Layer 규칙

### Controller
- 요청을 받아 UseCase에 위임하고 응답을 반환합니다.
- 비즈니스 로직을 포함하지 않습니다.
- 입력 유효성 검사는 DTO 레벨에서 처리합니다.

```typescript
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const command: CreateUserCommand = {
      email: req.body.email,
      nickname: req.body.nickname,
      password: req.body.password,
    }

    const result = await this.createUserUseCase.execute(command)

    res.status(201).json({ success: true, data: result })
  }
}
```

---

## 의존성 주입(DI) 규칙

- 구체 클래스가 아닌 **인터페이스에 의존**합니다.
- 생성자 주입을 기본으로 사용합니다.
- DI 컨테이너(NestJS의 `@Injectable`, tsyringe 등)를 활용합니다.

```typescript
// ❌ 잘못된 예: 구체 클래스에 의존
class CreateUserUseCase {
  private repo = new UserRepositoryImpl()  // 직접 생성 금지
}

// ✅ 올바른 예: 인터페이스에 의존
class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}  // 인터페이스 주입
}
```

---

## 레이어 간 import 금지 규칙

```
Domain    → 외부 레이어 import 금지 (Framework, ORM, HTTP 등)
Application → Infrastructure import 금지
Presentation → Domain 직접 접근 금지 (Application을 통해서만)
```
