# AI 에이전트 팀 사용자 가이드

> 버전: v1.0
> 작성일: 2026-02-19
> 작성자: doc-writer agent

이 가이드는 Claude Code 기반의 AI 에이전트 팀을 처음 사용하는 팀원을 위한 문서입니다.
기획부터 QA까지 전 개발 사이클을 에이전트와 함께 진행하는 방법을 설명합니다.

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-02-19 | 최초 작성 |

---

## 목차

1. [빠른 시작](#1-빠른-시작)
2. [에이전트 팀 소개](#2-에이전트-팀-소개)
3. [개발 사이클 전체 흐름](#3-개발-사이클-전체-흐름)
4. [에이전트별 사용 방법](#4-에이전트별-사용-방법)
5. [스킬 목록 및 설명](#5-스킬-목록-및-설명)
6. [자주 쓰는 명령어](#6-자주-쓰는-명령어)
7. [산출물 구조](#7-산출물-구조)
8. [FAQ](#8-faq)

---

## 1. 빠른 시작

### 요구 사항
- [Claude Code](https://claude.ai/claude-code) CLI 설치
- 프로젝트 루트에 `CLAUDE.md` 파일 존재 확인

### 첫 프로젝트 시작하기

```bash
# 1. Claude Code 실행
claude

# 2. 서비스 기획 시작
@planner 새로운 중고거래 플랫폼을 기획해줘.

# 3. 아키텍처 설계
@architect docs/PLAN.md를 기반으로 DB 스키마와 API를 설계해줘.

# 4. 구현
@developer 사용자 인증 기능을 구현해줘.
@designer 로그인/회원가입 화면을 구현해줘.

# 5. QA 검수
/check
```

> 각 단계는 순서대로 진행합니다. 이전 단계의 산출물 문서가 없으면 다음 단계를 시작하지 않습니다.

---

## 2. 에이전트 팀 소개

이 프로젝트는 역할별로 전문화된 6명의 AI 에이전트로 구성됩니다.

| 에이전트 | 호출 방법 | 한 줄 역할 |
|---------|----------|----------|
| **planner** | `@planner` | 서비스 기획 및 PRD 작성 |
| **architect** | `@architect` | DB 스키마 · API · 폴더 구조 설계 |
| **designer** | `@designer` | GUI 컴포넌트 및 디자인 시스템 구현 |
| **developer** | `@developer` | 클린 아키텍처 기반 코드 구현 |
| **qa** | `@qa` 또는 `/check` | 기획-코드 일치성 검수 및 QA 리포트 |
| **doc-writer** | `@doc-writer` | 기술 문서 및 사용자 가이드 작성 |

---

## 3. 개발 사이클 전체 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                       개발 사이클                            │
│                                                             │
│  1. 기획         2. 설계         3. 구현        4. 검수     │
│                                                             │
│  @service-  →  @architect  →  @designer   →  @qa-         │
│   planner                     @developer    inspector      │
│                                                             │
│  docs/           docs/          src/          docs/        │
│  PLAN.md         ARCHITECTURE.md              QA_REPORT.md │
└─────────────────────────────────────────────────────────────┘
```

### 단계별 선행 조건

| 단계 | 에이전트 | 필요한 선행 문서 |
|------|---------|----------------|
| 1. 기획 | planner | 없음 (첫 시작) |
| 2. 설계 | architect | `docs/PLAN.md` ✅ |
| 3. 구현 | designer / developer | `docs/PLAN.md` ✅ `docs/ARCHITECTURE.md` ✅ |
| 4. 검수 | qa | `docs/PLAN.md` ✅ 구현 코드 ✅ |

> ⚠️ 선행 문서 없이 다음 단계 에이전트를 호출하면, 에이전트가 먼저 이전 단계를 완료할 것을 안내합니다.

---

## 4. 에이전트별 사용 방법

### 4-1. planner — 서비스 기획

**역할**: 사용자 아이디어를 PRD로 구체화합니다.

**산출물**: `docs/PLAN.md`

**사용 예시**:
```
@planner 배달 중개 앱을 기획해줘.

@planner 기존 PLAN.md에 '즐겨찾기' 기능을 추가해줘.

@planner 사용자 페르소나를 더 구체적으로 다듬어줘.
```

**적용 스킬**:
- `prd-template` — 문서 구조를 10개 섹션으로 표준화
- `persona` — 공감 지도 기반 페르소나 정의
- `priority-framework` — MoSCoW 분류 + RICE 점수 우선순위 산정

---

### 4-2. architect — 시스템 설계

**역할**: `docs/PLAN.md`를 읽고 DB · API · 폴더 구조를 설계합니다.

**산출물**: `docs/ARCHITECTURE.md`

**사용 예시**:
```
@architect PLAN.md를 기반으로 전체 아키텍처를 설계해줘.

@architect users 테이블에 소셜 로그인 컬럼을 추가해줘.

@architect 결제 API 명세를 추가해줘.
```

**적용 스킬**:
- `db-schema-convention` — snake_case 명명, 공통 컬럼, 인덱스 전략, Mermaid ERD
- `api-convention` — RESTful URL, 표준 응답 형식, 에러 코드 체계

---

### 4-3. designer — UI/UX 구현

**역할**: 화면 목록과 컴포넌트를 Mobile First로 구현합니다.

**산출물**: `src/components/`, `src/styles/`

**사용 예시**:
```
@designer 로그인 페이지 컴포넌트를 만들어줘.

@designer Button, Input, Card 공통 컴포넌트를 만들어줘.

@designer 다크모드를 지원하는 디자인 토큰을 정의해줘.
```

**적용 스킬**:
- `design-token` — 색상·타이포·간격·그림자 CSS 변수 체계
- `component-spec` — Props 인터페이스, 상태 정의, Compound Pattern
- `design-system-consistency` — Tailwind 테마 우선, WCAG 다크모드 대비
- `responsive-first` — Mobile First, 터치 타겟 44×44px
- `ux-optimization` — Skeleton UI, Toast, 한국어 폼 유효성 검사, 애니메이션

---

### 4-4. developer — 코드 구현

**역할**: 클린 아키텍처(Domain → Application → Infrastructure → Presentation) 기반으로 구현합니다.

**산출물**: `src/` 전체 레이어

**사용 예시**:
```
@developer 회원가입 기능을 클린 아키텍처로 구현해줘.

@developer UserRepository에 소셜 로그인 메서드를 추가해줘.

@developer CreateUserUseCase 단위 테스트를 작성해줘.
```

**적용 스킬**:
- `clean-architecture-rule` — Entity / UseCase / Repository / Controller 패턴
- `test-convention` — AAA 패턴, Mock 작성, 레이어별 커버리지 기준

---

### 4-5. qa — QA 검수

**역할**: `docs/PLAN.md`와 실제 코드를 비교하여 구현율을 산출하고 리포트를 작성합니다.

**산출물**: `docs/QA_REPORT.md`

**사용 예시**:
```
# 방법 1: 직접 명령
/check

# 방법 2: 에이전트 호출
@qa 현재 구현 상태를 검수해줘.
```

**적용 스킬**:
- `qa-checklist` — 기능 / 보안 / 성능 / 접근성 / 테스트 커버리지 검수
- `bug-report-template` — Critical · High · Medium · Low · Info 심각도 분류

**구현율 판정 기준**:
| 구현율 | 등급 | 의미 |
|--------|------|------|
| 90~100% | ✅ PASS | 배포 승인 가능 |
| 70~89% | ⚠️ CONDITIONAL | Critical 이슈 해결 후 재검수 |
| 50~69% | 🔴 FAIL | 주요 기능 구현 후 재검수 |
| 0~49% | ❌ BLOCK | 구현 단계로 복귀 |

---

### 4-6. doc-writer — 문서 작성

**역할**: 프로젝트 문서, 사용자 가이드, README 등을 작성합니다.

**사용 예시**:
```
@doc-writer API 엔드포인트 사용 가이드를 docs/API_GUIDE.md에 작성해줘.

@doc-writer 신규 팀원을 위한 온보딩 문서를 만들어줘.
```

---

## 5. 스킬 목록 및 설명

스킬은 에이전트가 작업 시 자동으로 적용하는 전문 규칙집입니다.

### 공통 스킬

| 스킬 | 설명 |
|------|------|
| `korean-comment` | 모든 코드에 한국어 주석 작성 (파일 상단·클래스·함수 필수) |

### planner 스킬

| 스킬 | 설명 |
|------|------|
| `prd-template` | PRD 10개 섹션 표준 템플릿 (FR ID 체계, 완료 조건 포함) |
| `persona` | 공감 지도 + 안티 페르소나 포함 사용자 정의 방법론 |
| `priority-framework` | MoSCoW 판단 트리 → RICE 점수 산출 → Quick Win 원칙 |

### architect 스킬

| 스킬 | 설명 |
|------|------|
| `db-schema-convention` | 명명 규칙, 공통 컬럼, 인덱스 전략, Mermaid ERD 형식 |
| `api-convention` | RESTful URL 패턴, 표준 JSON 응답, 에러 코드 체계 |

### designer 스킬

| 스킬 | 설명 |
|------|------|
| `design-token` | 색상·타이포·간격·그림자·z-index CSS 변수 전체 체계 |
| `component-spec` | Props 인터페이스, 상태 목록, Compound Pattern 규칙 |
| `design-system-consistency` | Tailwind 테마 우선, WCAG 다크모드 대비, Variant 상수 맵 |
| `responsive-first` | Mobile First 작성 순서, 터치 타겟 44×44px, 반응형 Grid |
| `ux-optimization` | Skeleton UI, Toast, 한국어 폼 에러 메시지, Framer Motion |

### developer 스킬

| 스킬 | 설명 |
|------|------|
| `clean-architecture-rule` | 4개 레이어 구현 규칙, Entity/UseCase/Repository 패턴, DI 원칙 |
| `test-convention` | AAA 패턴, describe/it 네이밍, Mock 작성, 커버리지 기준 |

### qa 스킬

| 스킬 | 설명 |
|------|------|
| `qa-checklist` | 기능·보안·성능·접근성·테스트 5개 영역 체크리스트 |
| `bug-report-template` | BUG / MISMATCH / MISSING 이슈 리포트 형식 |

---

## 6. 자주 쓰는 명령어

### QA 검수 실행
```
/check
```
`qa` 에이전트를 즉시 호출하여 전체 검수를 실행하고 `docs/QA_REPORT.md`를 생성합니다.

### 특정 에이전트 호출
```
@{에이전트명} {요청 내용}

예시:
@planner 결제 기능을 추가 기획해줘.
@architect 결제 테이블 스키마를 추가해줘.
@developer 결제 UseCase를 구현해줘.
@designer 결제 화면 컴포넌트를 만들어줘.
```

### 여러 에이전트 협업 요청
```
@architect @developer 로그인 기능 설계부터 구현까지 진행해줘.
```

---

## 7. 산출물 구조

모든 에이전트의 산출물은 아래 구조로 관리됩니다.

```
프로젝트 루트/
│
├── CLAUDE.md                  ← 에이전트 운영 규칙 (자동 로드)
│
├── docs/                      ← 모든 문서 산출물
│   ├── PLAN.md                ← planner 산출물 (PRD)
│   ├── ARCHITECTURE.md        ← architect 산출물 (DB·API·폴더 구조)
│   ├── QA_REPORT.md           ← qa 산출물 (검수 리포트)
│   └── GUIDE.md               ← doc-writer 산출물 (이 파일)
│
├── src/                       ← developer / designer 산출물
│   ├── domain/                ← Entity, Value Object, Repository Interface
│   ├── application/           ← UseCase, Command, Query DTO
│   ├── infrastructure/        ← Repository 구현체, ORM, 외부 연동
│   ├── presentation/          ← Controller, Router, Request/Response DTO
│   ├── components/            ← UI 컴포넌트
│   └── styles/                ← 디자인 토큰, 글로벌 스타일
│
└── .claude/
    ├── agents/                ← 에이전트 정의 파일
    │   ├── planner.md
    │   ├── architect.md
    │   ├── designer.md
    │   ├── developer.md
    │   ├── qa.md
    │   └── doc_writer.md
    └── skills/                ← 스킬 정의 파일 (12개)
        ├── korean_comment.md
        ├── prd_template.md
        ├── persona.md
        ├── priority_framework.md
        ├── db_schema_convention.md
        ├── api_convention.md
        ├── design_token.md
        ├── component_spec.md
        ├── design_system_consistency.md
        ├── responsive_first.md
        ├── ux_optimization.md
        ├── clean_architecture_rule.md
        ├── test_convention.md
        ├── qa_checklist.md
        └── bug_report_template.md
```

---

## 8. FAQ

**Q. 에이전트를 호출했는데 "PLAN.md가 없다"고 합니다.**
> A. 개발 사이클 순서를 지켜야 합니다. 먼저 `@planner`로 기획을 완료하고 `docs/PLAN.md`가 생성된 후 다음 단계로 진행하세요.

**Q. `/check` 결과 구현율이 낮게 나옵니다.**
> A. `docs/PLAN.md`에 정의된 기능 중 아직 구현되지 않은 항목이 있습니다. QA 리포트의 `MISSING` 항목을 확인하고 `@developer` 또는 `@designer`에게 구현을 요청하세요.

**Q. 기존 코드 스타일과 다르게 구현됩니다.**
> A. 에이전트를 호출하기 전 "기존 코드 패턴을 유지해줘"라고 명시하세요. 에이전트는 기존 코드를 먼저 읽고 패턴을 파악한 뒤 작업합니다.

**Q. 에이전트가 여러 파일을 수정했는데 어떤 파일이 바뀌었는지 모르겠습니다.**
> A. 모든 에이전트는 작업 완료 후 생성·수정된 파일 목록을 요약 보고합니다. 또는 `git diff`로 변경 사항을 확인하세요.

**Q. 새로운 스킬이나 에이전트를 추가하고 싶습니다.**
> A. `.claude/agents/` 또는 `.claude/skills/` 폴더에 마크다운 파일을 추가하고 `CLAUDE.md`에 에이전트 역할과 호출 조건을 등록하세요.

**Q. 여러 에이전트가 같은 파일을 수정하면 충돌이 나지 않나요?**
> A. 각 에이전트는 담당 섹션만 수정하도록 설계되어 있습니다. `docs/PLAN.md`는 planner와 developer(구현 완료 체크박스)만 수정하고, 나머지 문서도 담당 에이전트가 명확히 분리되어 있습니다.
