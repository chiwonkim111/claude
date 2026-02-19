---
name: command-develop
description: 사용자가 /develop 입력 시 실행되는 개발 워크플로우
---

# Workflow

사용자가 "/develop" 명령을 내리면 다음 단계를 수행한다:

1. `docs/PLAN.md`를 읽고 `developer` 에이전트가 코드를 구현한다.
2. 구현 시 `korean-comment` 및 `clean-architecture-rule` 스킬을 강제 적용한다.
3. `doc-writer` 에이전트가 관련 API 문서를 최신화한다.
