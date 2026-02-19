# CLAUDE.md — 프로젝트 AI 에이전트 운영 규칙

이 파일은 Claude Code가 프로젝트를 시작할 때 자동으로 읽는 설정 파일입니다.
아래 규칙과 에이전트 구성을 항상 준수하여 작업합니다.

---

## 에이전트 구성 overview

```
.claude/
├── agents/
│   ├── service_planner.md  → 서비스 기획 및 요구사항 정의
│   ├── architect.md        → DB 스키마 / API 명세 / 폴더 구조 설계
│   ├── designer.md         → GUI 컴포넌트 및 디자인 시스템 구현
│   ├── developer.md        → 클린 아키텍처 기반 코드 구현
│   └── qa_inspector.md     → 코드 품질 및 기획 일치성 검수
└── skills/
    └── korean_comment.md   → 한국어 주석 작성 규칙 (전 에이전트 공통 적용)
```

---

## 개발 사이클 및 에이전트 호출 순서

모든 작업은 아래 순서를 따릅니다. 단계를 건너뛰지 않습니다.

```
1. service-planner  →  기획 및 요구사항 정의  →  docs/PLAN.md
        ↓
2. architect        →  시스템 설계            →  docs/ARCHITECTURE.md
        ↓
3. designer         →  GUI / 컴포넌트 구현    →  src/components/
   developer        →  비즈니스 로직 구현     →  src/
        ↓
4. qa-inspector     →  검수 및 구현율 산출    →  docs/QA_REPORT.md
```

> designer와 developer는 3단계에서 병렬로 작업할 수 있습니다.
> 단, 각자 `docs/ARCHITECTURE.md`의 폴더 구조를 반드시 따릅니다.

---

## 에이전트별 역할 및 호출 규칙

### 1. service-planner
- **역할**: 서비스 기획, 사용자 스토리, PRD 작성
- **입력**: 사용자 아이디어 또는 요구사항
- **출력**: `docs/PLAN.md`
- **호출 조건**: 새로운 서비스 또는 기능을 시작할 때, 요구사항이 불명확할 때
- **호출 금지**: `docs/PLAN.md`가 이미 완성된 상태에서 코드 구현을 요청할 때

### 2. architect
- **역할**: DB 스키마, API 명세, 프로젝트 폴더 구조 설계
- **입력**: `docs/PLAN.md`
- **출력**: `docs/ARCHITECTURE.md`
- **호출 조건**: 기획이 완료된 후 개발 착수 전, 기술 스택 또는 구조 변경이 필요할 때
- **호출 금지**: `docs/PLAN.md`가 없는 상태에서 설계 시작 금지

### 3. designer
- **역할**: UI 컴포넌트, 디자인 시스템, 반응형 레이아웃 구현
- **입력**: `docs/PLAN.md`, `docs/ARCHITECTURE.md`
- **출력**: `src/components/`, `src/styles/`
- **호출 조건**: 화면 구현, 컴포넌트 추가, 스타일 작업이 필요할 때
- **준수 사항**:
  - Mobile First 반응형 설계 필수
  - WCAG 2.1 AA 접근성 기준 준수
  - `docs/ARCHITECTURE.md`의 폴더 구조 준수

### 4. developer
- **역할**: 클린 아키텍처 기반 비즈니스 로직, API, DB 연동 코드 구현
- **입력**: `docs/PLAN.md`, `docs/ARCHITECTURE.md`
- **출력**: `src/` (Domain / Application / Infrastructure / Presentation 레이어)
- **호출 조건**: 기능 구현, API 연동, 비즈니스 로직 작성이 필요할 때
- **준수 사항**:
  - 레이어 의존성 방향 엄수 (Domain ← Application ← Infrastructure ← Presentation)
  - SOLID 원칙 준수
  - 구현 완료 후 `docs/PLAN.md` 체크박스 업데이트

### 5. qa-inspector
- **역할**: 기획서와 코드 비교 분석, 구현율 산출, QA 리포트 작성
- **입력**: `docs/PLAN.md`, `docs/ARCHITECTURE.md`, 전체 소스코드
- **출력**: `docs/QA_REPORT.md`
- **호출 조건**: `/check` 명령 입력 시 즉시 실행
- **호출 권장 시점**:
  - 주요 기능 구현 완료 후
  - PR 또는 배포 전
  - 스프린트 종료 시점

---

## 공통 적용 규칙

### 한국어 주석 (korean_comment 스킬)

모든 에이전트가 코드를 작성하거나 수정할 때 반드시 한국어 주석을 작성합니다.

- 파일 상단, 클래스, 함수/메서드에 한국어 블록 주석 필수
- 복잡한 비즈니스 로직에는 인라인 한국어 주석 추가
- 변수명·함수명·클래스명은 영어 유지
- 영어 태그 한국어 변환: `TODO` → `할 일`, `FIXME` → `수정 필요`, `NOTE` → `참고`

### 문서 관리 규칙

| 문서 | 담당 에이전트 | 수정 시점 |
|------|-------------|----------|
| `docs/PLAN.md` | service-planner | 기획 변경 또는 기능 구현 완료 시 |
| `docs/ARCHITECTURE.md` | architect | 설계 변경 시 |
| `docs/QA_REPORT.md` | qa-inspector | `/check` 실행 시 |

- 모든 문서는 상단에 **변경 이력** 테이블을 유지합니다.
- 문서를 덮어쓰지 않고 해당 섹션만 수정합니다.

### 코드 품질 기준

- 함수/메서드는 20줄을 초과하지 않도록 분리합니다.
- 매직 넘버와 하드코딩된 문자열은 상수로 추출합니다.
- 환경변수는 코드에 직접 작성하지 않고 config 모듈을 통해 주입합니다.
- 보안: SQL Injection, XSS, 민감 정보 로그 노출 금지

### 에이전트 간 협업 원칙

- 이전 단계의 산출물 문서를 반드시 먼저 읽고 작업을 시작합니다.
- 문서와 실제 구현이 충돌할 경우 사용자에게 보고하고 판단을 구합니다.
- 단계 완료 후 다음 단계 에이전트 호출을 사용자에게 제안합니다.

---

## /check 명령

```
/check
```

`qa-inspector` 에이전트를 즉시 호출하여 아래를 수행합니다:

1. `docs/PLAN.md` 요구사항 파싱
2. 전체 코드 탐색 및 기능별 구현 상태 분류
3. 구현율 0~100% 점수 산출
4. `docs/QA_REPORT.md` 리포트 저장

---

## 주의사항

- `docs/PLAN.md` 없이 architect, developer, designer, qa-inspector를 호출하지 않습니다.
- `docs/ARCHITECTURE.md` 없이 developer, designer를 호출하지 않습니다.
- 에이전트가 산출물을 저장할 때 기존 파일을 통째로 덮어쓰지 않습니다.
- 모든 에이전트는 작업 완료 후 반드시 저장된 파일 목록을 사용자에게 보고합니다.
