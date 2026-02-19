---
name: ux-optimization
description: 사용자 편의성을 위한 UI 로직 규칙. designer 에이전트가 로딩/에러 상태 피드백, 폼 유효성 검사, 애니메이션을 구현할 때 사용합니다.
---

# Instructions

- 로딩 상태(Loading State)와 에러 상태(Error State)에 대한 시각적 피드백(Skeleton UI, Toast 등)을 반드시 포함한다.
- 사용자의 입력이 필요한 폼(Form) 요소에는 실시간 유효성 검사 결과와 안내 문구를 한국어로 친절하게 제공한다.
- 페이지 전환이나 요소의 나타남/사라짐에는 부드러운 애니메이션(Transition)을 적용하여 심리적 안정감을 준다.

## 세부 규칙

### 1. 로딩 상태 처리

모든 비동기 데이터 요청에는 반드시 로딩 상태 UI를 제공한다.

#### Skeleton UI (콘텐츠 로딩)
```tsx
// 콘텐츠 형태를 유지한 Skeleton 컴포넌트
const CardSkeleton = () => (
  <div className="animate-pulse rounded-xl border p-4 space-y-3">
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
    <div className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
  </div>
)

// 사용: 데이터 로딩 중에는 Skeleton, 완료 시 실제 컨텐츠
{isLoading ? <CardSkeleton /> : <Card data={data} />}
```

#### 버튼 로딩 스피너
```tsx
<button disabled={isLoading} className="...">
  {isLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      처리 중...
    </>
  ) : '확인'}
</button>
```

---

### 2. 에러 상태 처리

#### Toast 알림 (비파괴적 피드백)
```tsx
// 성공 / 실패 / 경고 3가지 유형 제공
type ToastType = 'success' | 'error' | 'warning' | 'info'

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-success-500 text-white',
  error:   'bg-error-500 text-white',
  warning: 'bg-warning-500 text-white',
  info:    'bg-primary-500 text-white',
}

const TOAST_MESSAGES: Record<ToastType, string> = {
  success: '✅ 성공적으로 처리되었습니다.',
  error:   '❌ 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  warning: '⚠️ 주의가 필요한 항목이 있습니다.',
  info:    'ℹ️ 안내 메시지입니다.',
}
```

#### 빈 상태 (Empty State)
```tsx
// 데이터가 없을 때 안내 UI 제공 (빈 화면 방치 금지)
const EmptyState = ({ message, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">📭</div>
    <p className="text-neutral-500 mb-4">{message}</p>
    {onAction && (
      <button onClick={onAction} className="...">
        {actionLabel}
      </button>
    )}
  </div>
)
```

---

### 3. 폼 유효성 검사

#### 실시간 유효성 검사 + 한국어 안내 문구
```tsx
// 에러 메시지는 구체적이고 친절하게 한국어로 제공한다.
const ERROR_MESSAGES = {
  email: {
    required: '이메일을 입력해 주세요.',
    invalid:  '올바른 이메일 형식이 아닙니다. (예: example@email.com)',
  },
  password: {
    required: '비밀번호를 입력해 주세요.',
    minLength: '비밀번호는 8자 이상이어야 합니다.',
    pattern:  '영문, 숫자, 특수문자를 각 1개 이상 포함해야 합니다.',
  },
  nickname: {
    required: '닉네임을 입력해 주세요.',
    minLength: '닉네임은 2자 이상이어야 합니다.',
    maxLength: '닉네임은 20자 이하여야 합니다.',
    pattern:  '닉네임에는 특수문자를 사용할 수 없습니다.',
  },
}

// 폼 필드 컴포넌트 (에러 상태 시각화 포함)
const FormField = ({ label, error, ...props }: FormFieldProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {label}
    </label>
    <input
      className={cn(
        'w-full rounded-md border px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        error
          ? 'border-error-500 bg-red-50 dark:bg-red-900/10'
          : 'border-neutral-300 dark:border-neutral-600',
      )}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
      {...props}
    />
    {error && (
      <p id={`${props.id}-error`} role="alert" className="text-xs text-error-500">
        {error}
      </p>
    )}
  </div>
)
```

---

### 4. 애니메이션 및 트랜지션

모든 상태 변화(나타남/사라짐/이동)에 부드러운 트랜지션을 적용한다.

#### Tailwind 트랜지션 기본 규칙
```tsx
// 버튼, 링크 등 인터랙티브 요소
className="transition-colors duration-200 ease-in-out"

// 크기 변경이 있는 요소
className="transition-all duration-300 ease-in-out"

// 페이드 인/아웃
className="transition-opacity duration-200"
```

#### 모달 / 드로어 애니메이션
```tsx
// Framer Motion 사용 시
const modalVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1,    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.95, y: -10,
    transition: { duration: 0.15, ease: 'easeIn' } },
}

<AnimatePresence>
  {isOpen && (
    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

#### 페이지 전환 애니메이션
```tsx
// Next.js 페이지 전환
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
}
```

#### 애니메이션 접근성 주의사항
```tsx
// 사용자가 움직임 감소를 선호하는 경우 애니메이션 비활성화
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// Tailwind: motion-safe 변형 사용
className="motion-safe:transition-all motion-safe:duration-300"
```
