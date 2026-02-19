---
name: design-system-consistency
description: UI 일관성을 위한 디자인 시스템 준수 규칙. designer 에이전트가 컴포넌트를 구현할 때 스타일 일관성, Tailwind 테마 시스템, 다크모드 대비를 지키도록 합니다.
---

# Instructions

- 모든 컴포넌트는 현대적이고 깔끔한(Clean & Modern) 스타일을 지향한다.
- Tailwind CSS를 사용할 경우, 임의의 수치보다는 테마 확장(Theme Extend)에 정의된 컬러 팔레트와 간격(Spacing) 시스템을 우선 사용한다.
- 다크 모드와 라이트 모드 사이의 대비(Contrast)가 웹 접근성 가이드라인(WCAG)을 준수하도록 설계한다.

## 세부 규칙

### 스타일 일관성
- 컴포넌트 간 동일한 역할의 요소(버튼, 입력창, 카드 등)는 동일한 디자인 토큰을 사용한다.
- 임의의 색상 코드(`#3B82F6`, `rgb(...)`) 직접 사용을 금지하고 `design-token` 스킬에 정의된 CSS 변수 또는 Tailwind 테마 값을 사용한다.
- 아이콘은 프로젝트 내 단일 라이브러리(예: lucide-react, heroicons)로 통일한다.

### Tailwind 테마 우선 사용
```tsx
// ❌ 임의 수치 사용 금지
<div className="bg-[#3B82F6] mt-[13px] text-[15px]" />

// ✅ 테마 토큰 사용
<div className="bg-primary-500 mt-3 text-sm" />
```

### 다크모드 대비 준수
- 모든 텍스트 요소에 `dark:` 변형을 함께 작성한다.
- 라이트/다크 모드 모두 WCAG AA 기준(일반 텍스트 4.5:1, 대형 텍스트 3:1) 이상의 색상 대비를 유지한다.

```tsx
// ✅ 다크모드 대응 예시
<p className="text-neutral-900 dark:text-neutral-50">
  본문 텍스트
</p>
<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
  카드 컨테이너
</div>
```

### 컴포넌트 스타일 변형(Variant) 원칙
- 동일 컴포넌트의 스타일 변형은 `variant` prop으로 제어하고, 조건부 클래스는 상수 맵으로 관리한다.

```tsx
const VARIANT_STYLES = {
  primary:   'bg-primary-500 text-white hover:bg-primary-600',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  ghost:     'bg-transparent text-primary-500 hover:bg-primary-50',
  danger:    'bg-error-500 text-white hover:bg-red-600',
} as const
```
