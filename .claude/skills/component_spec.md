---
name: component-spec
description: UI 컴포넌트 명세 작성 규칙 스킬. designer 에이전트가 컴포넌트를 구현할 때 Props 인터페이스, 상태 정의, 사용 예시를 일관된 형식으로 작성합니다.
---

컴포넌트를 구현할 때 아래 명세 형식과 규칙을 따릅니다.

## 컴포넌트 파일 구조

```
src/components/{ComponentName}/
├── {ComponentName}.tsx          -- 컴포넌트 본체
├── {ComponentName}.types.ts     -- Props 타입 정의 (복잡할 경우 분리)
├── {ComponentName}.module.css   -- CSS Modules (필요 시)
└── index.ts                     -- 외부 공개용 re-export
```

---

## 컴포넌트 파일 내부 구조

```tsx
// 1. 외부 라이브러리 import
import { forwardRef } from 'react'

// 2. 내부 모듈 import
import { cn } from '@/utils/cn'

// 3. 타입 정의
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 시각적 스타일 변형 */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg'
  /** 로딩 중 여부 (true이면 비활성화 + 스피너 표시) */
  isLoading?: boolean
  /** 버튼 전체 너비 여부 */
  fullWidth?: boolean
}

// 4. 내부 상수
const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
} as const

// 5. 컴포넌트 정의
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          // 기본 스타일
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // 크기
          SIZE_CLASSES[size],
          // 전체 너비
          fullWidth && 'w-full',
          // 비활성화
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {isLoading && <span className="mr-2 animate-spin">⏳</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

// 6. export default
export default Button
```

---

## Props 인터페이스 작성 규칙

- 모든 Props에 **JSDoc 한국어 주석**을 작성합니다.
- 선택적 Props(`?`)에는 반드시 기본값을 명시합니다.
- HTML 기본 속성을 확장할 때는 `extends React.{Element}HTMLAttributes<HTML{Element}Element>` 패턴을 사용합니다.
- `children`이 필요한 경우 `React.ReactNode` 타입을 사용합니다.

```tsx
export interface CardProps {
  /** 카드 제목 */
  title: string
  /** 카드 본문 내용 */
  description?: string
  /** 카드 내부에 렌더링할 자식 요소 */
  children?: React.ReactNode
  /** 카드 클릭 시 실행할 콜백 */
  onClick?: () => void
  /** 카드 로딩 상태 (true이면 스켈레톤 표시) */
  isLoading?: boolean
  /** 추가 CSS 클래스 */
  className?: string
}
```

---

## 컴포넌트 상태 정의 규칙

각 컴포넌트가 가질 수 있는 **시각적 상태**를 명확히 정의합니다.

```markdown
### Button 컴포넌트 상태

| 상태 | 설명 | 시각적 처리 |
|------|------|------------|
| default | 기본 상태 | 기본 색상 |
| hover | 마우스 오버 | 배경 어둡게 |
| active | 클릭 중 | 더 어둡게 + 살짝 축소 |
| focus | 키보드 포커스 | 파란 테두리 ring |
| disabled | 비활성화 | 반투명(opacity-50) + 커서 변경 |
| loading | 로딩 중 | 스피너 표시 + 비활성화 |
```

---

## 컴포넌트 명세서 작성 형식

```markdown
## [ComponentName] 컴포넌트

> 컴포넌트의 역할을 한 줄로 설명합니다.

### Props

| Prop | 타입 | 기본값 | 필수 | 설명 |
|------|------|--------|------|------|
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | - | 시각적 스타일 변형 |
| size | 'sm' \| 'md' \| 'lg' | 'md' | - | 컴포넌트 크기 |
| isLoading | boolean | false | - | 로딩 상태 여부 |
| onClick | () => void | - | - | 클릭 이벤트 핸들러 |

### 상태 목록
- default / hover / active / focus / disabled / loading

### 사용 예시

```tsx
// 기본 사용
<Button>확인</Button>

// 로딩 상태
<Button isLoading>처리 중...</Button>

// 전체 너비 + danger 변형
<Button variant="danger" fullWidth onClick={handleDelete}>
  삭제하기
</Button>
```

### 접근성
- `aria-disabled`: disabled 또는 isLoading 시 true
- `aria-busy`: isLoading 시 true
- 키보드: Enter / Space 키로 클릭 가능
- Focus: `focus-visible` 스타일로 키보드 포커스 표시
```

---

## Compound Component 패턴 (복잡한 컴포넌트용)

관련 컴포넌트를 하나의 네임스페이스로 묶을 때 사용합니다.

```tsx
// 사용 예시
<Card>
  <Card.Header>제목</Card.Header>
  <Card.Body>본문</Card.Body>
  <Card.Footer>
    <Button>확인</Button>
  </Card.Footer>
</Card>

// 구현
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border bg-white shadow-sm">{children}</div>
)

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b p-4 font-semibold">{children}</div>
)

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4">{children}</div>
)

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="border-t p-4">{children}</div>
)
```
