---
name: design-token
description: 디자인 토큰 정의 및 관리 규칙 스킬. designer 에이전트가 색상, 타이포그래피, 간격, 그림자 등 디자인 시스템의 기반 변수를 일관되게 정의할 때 사용합니다.
---

디자인 토큰을 정의할 때 아래 규칙과 구조를 따릅니다.

## 토큰 명명 규칙

```
--{카테고리}-{속성}-{단계/변형}

예시:
--color-primary-500
--font-size-lg
--spacing-4
--radius-md
--shadow-lg
--duration-fast
```

---

## 색상 토큰

### 팔레트 (Primitive Tokens)
```css
:root {
  /* Primary (브랜드 메인 색상) */
  --color-primary-50:  #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;  /* 기본값 */
  --color-primary-600: #2563EB;  /* hover */
  --color-primary-700: #1D4ED8;  /* active */
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Neutral (회색 계열) */
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-300: #D1D5DB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-500: #6B7280;
  --color-neutral-600: #4B5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  /* Semantic (의미 기반 색상) */
  --color-success-500: #22C55E;
  --color-warning-500: #F59E0B;
  --color-error-500:   #EF4444;
  --color-info-500:    #3B82F6;
}
```

### 시맨틱 토큰 (Semantic Tokens)
```css
:root {
  /* 배경 */
  --color-bg-default:   var(--color-neutral-0);
  --color-bg-subtle:    var(--color-neutral-50);
  --color-bg-muted:     var(--color-neutral-100);

  /* 텍스트 */
  --color-text-primary:   var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-disabled:  var(--color-neutral-400);
  --color-text-inverse:   var(--color-neutral-0);

  /* 보더 */
  --color-border-default: var(--color-neutral-200);
  --color-border-strong:  var(--color-neutral-300);

  /* 인터랙티브 */
  --color-interactive-default: var(--color-primary-500);
  --color-interactive-hover:   var(--color-primary-600);
  --color-interactive-active:  var(--color-primary-700);
}
```

---

## 타이포그래피 토큰

```css
:root {
  /* Font Family */
  --font-family-sans:  'Pretendard', -apple-system, sans-serif;
  --font-family-mono:  'JetBrains Mono', 'Courier New', monospace;

  /* Font Size (1rem = 16px 기준) */
  --font-size-xs:   0.75rem;    /* 12px */
  --font-size-sm:   0.875rem;   /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg:   1.125rem;   /* 18px */
  --font-size-xl:   1.25rem;    /* 20px */
  --font-size-2xl:  1.5rem;     /* 24px */
  --font-size-3xl:  1.875rem;   /* 30px */
  --font-size-4xl:  2.25rem;    /* 36px */

  /* Font Weight */
  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* Line Height */
  --line-height-tight:  1.25;
  --line-height-normal: 1.5;
  --line-height-loose:  1.75;

  /* Letter Spacing */
  --letter-spacing-tight:  -0.025em;
  --letter-spacing-normal:  0em;
  --letter-spacing-wide:    0.025em;
}
```

---

## 간격 토큰 (4px 배수 시스템)

```css
:root {
  --spacing-px:  1px;
  --spacing-0:   0;
  --spacing-1:   0.25rem;   /* 4px */
  --spacing-2:   0.5rem;    /* 8px */
  --spacing-3:   0.75rem;   /* 12px */
  --spacing-4:   1rem;      /* 16px */
  --spacing-5:   1.25rem;   /* 20px */
  --spacing-6:   1.5rem;    /* 24px */
  --spacing-8:   2rem;      /* 32px */
  --spacing-10:  2.5rem;    /* 40px */
  --spacing-12:  3rem;      /* 48px */
  --spacing-16:  4rem;      /* 64px */
  --spacing-20:  5rem;      /* 80px */
  --spacing-24:  6rem;      /* 96px */
}
```

---

## 기타 토큰

```css
:root {
  /* Border Radius */
  --radius-none: 0;
  --radius-sm:   0.25rem;    /* 4px */
  --radius-md:   0.5rem;     /* 8px */
  --radius-lg:   0.75rem;    /* 12px */
  --radius-xl:   1rem;       /* 16px */
  --radius-2xl:  1.5rem;     /* 24px */
  --radius-full: 9999px;     /* 완전한 원/알약 */

  /* Shadow */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

  /* Z-Index */
  --z-index-base:    0;
  --z-index-raised:  10;
  --z-index-dropdown: 100;
  --z-index-sticky:  200;
  --z-index-overlay: 300;
  --z-index-modal:   400;
  --z-index-toast:   500;

  /* Transition */
  --duration-fast:   100ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --easing-default:  cubic-bezier(0.4, 0, 0.2, 1);
  --easing-in:       cubic-bezier(0.4, 0, 1, 1);
  --easing-out:      cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 다크모드 토큰

```css
[data-theme='dark'] {
  --color-bg-default:   var(--color-neutral-900);
  --color-bg-subtle:    var(--color-neutral-800);
  --color-bg-muted:     var(--color-neutral-700);

  --color-text-primary:   var(--color-neutral-0);
  --color-text-secondary: var(--color-neutral-400);
  --color-text-disabled:  var(--color-neutral-600);

  --color-border-default: var(--color-neutral-700);
  --color-border-strong:  var(--color-neutral-600);
}
```

---

## 토큰 사용 규칙

- 컴포넌트에서 색상, 간격, 타이포그래피를 사용할 때 **반드시 토큰 변수를 사용**합니다.
- 임의의 하드코딩된 값(`#3B82F6`, `16px`) 사용을 금지합니다.
- 새로운 색상이 필요할 경우 먼저 팔레트에 추가하고 시맨틱 토큰으로 연결합니다.
- Tailwind CSS 사용 시 `tailwind.config.js`에 토큰 값을 연동합니다.
