---
name: responsive-first
description: 다양한 디바이스 대응을 위한 레이아웃 규칙. designer 에이전트가 모든 화면을 모바일 우선으로 설계하고 터치 환경을 고려한 레이아웃을 구현할 때 사용합니다.
---

# Instructions

- 모든 화면 구현 시 'Mobile First' 전략을 채택한다.
- Flexbox와 Grid를 활용하여 기기 해상도에 따라 레이아웃이 유연하게 변하도록 작성한다.
- 버튼과 입력창 등 상호작용 요소는 모바일 터치 환경을 고려하여 충분한 크기(최소 44×44px)를 확보한다.

## 세부 규칙

### 브레이크포인트 적용 순서
반드시 모바일 기본값을 먼저 작성하고 큰 화면으로 확장한다.

```tsx
// ✅ Mobile First 작성 순서
<div className="
  flex flex-col          /* 모바일: 세로 배치 */
  md:flex-row            /* 태블릿: 가로 배치 */
  gap-4
  md:gap-8
">
  <aside className="w-full md:w-64 lg:w-72" />
  <main className="flex-1" />
</div>
```

### 터치 타겟 최소 크기 (44×44px)
모든 인터랙티브 요소는 터치 타겟을 최소 44×44px 이상으로 확보한다.

```tsx
// ✅ 터치 타겟 확보
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  확인
</button>

// 아이콘 버튼의 경우 패딩으로 타겟 확장
<button className="p-3" aria-label="메뉴 열기">
  <MenuIcon className="w-5 h-5" />
</button>
```

### 반응형 Grid 패턴
```tsx
// 카드 그리드: 모바일 1열 → 태블릿 2열 → 데스크탑 3열
<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items.map(item => <CardItem key={item.id} {...item} />)}
</ul>

// 사이드바 레이아웃: 모바일 전체 → 데스크탑 사이드바 고정
<div className="flex flex-col lg:flex-row min-h-screen">
  <nav className="w-full lg:w-64 lg:shrink-0" />
  <main className="flex-1 p-4 lg:p-8" />
</div>
```

### 이미지 반응형 처리
```tsx
// Next.js Image 사용 시
<Image
  src="/hero.jpg"
  alt="히어로 이미지"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
  className="object-cover"
/>

// 일반 img 사용 시
<img
  src="/hero.jpg"
  alt="히어로 이미지"
  className="w-full h-auto"
  loading="lazy"
/>
```

### 모바일 전용 / 데스크탑 전용 요소 처리
```tsx
// 모바일에서만 표시
<div className="block md:hidden">모바일 메뉴</div>

// 태블릿 이상에서만 표시
<div className="hidden md:block">사이드바 네비게이션</div>
```

### 폰트 크기 반응형
```tsx
// 모바일에서 작게, 데스크탑에서 크게
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  페이지 제목
</h1>
<p className="text-sm md:text-base leading-relaxed">
  본문 텍스트
</p>
```
