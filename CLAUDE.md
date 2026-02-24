# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll 기반 개인 이력서/포트폴리오 웹사이트로, GitHub Pages에서 호스팅됩니다. 원격 테마 `sproogen/resume-theme`을 사용하며, 레이아웃과 스타일을 로컬에서 오버라이드합니다.

## Development Commands

```bash
# Docker로 개발 서버 실행 (권장)
docker-compose up
# → http://localhost:4000 에서 확인

# 로컬 Ruby 환경 사용 시
bundle install
bundle exec jekyll serve --livereload
```

배포는 `main` 브랜치에 push하면 GitHub Pages가 자동으로 처리합니다.

## Architecture

### 콘텐츠 구조

**모든 이력서 콘텐츠는 `_config.yml` 단일 파일에 저장됩니다.** 콘텐츠 수정 시 이 파일만 편집하면 됩니다.

`_config.yml`의 `content` 배열이 페이지 섹션을 정의합니다. 각 섹션은 `layout`(렌더링 방식)과 `content`(항목 배열)를 가집니다:

```yaml
content:
  - title: 섹션 제목
    layout: list          # list 또는 text → section-list.html 또는 section-text.html로 렌더링
    content:
      - layout: left      # 항목별 레이아웃: left, top-left, top-middle, top-right, right
        title: 항목 제목
        sub_title: 부제목
        caption: 기간
        skills: Go, Redis  # 기술 스택 표시 (선택)
        quote: 한줄 요약    # 이탤릭 인용문 (선택)
        description: |      # Markdown 지원
          - 상세 내용
```

### 렌더링 흐름

`index.md` → `_layouts/default.html` → `_config.yml`의 `content` 배열을 순회하며 `_includes/section-{layout}.html` 템플릿으로 렌더링합니다. 현재 `version: 2`를 사용하며, v1 템플릿(`_includes/v1/`)은 레거시입니다.

### 스타일 오버라이드

`_sass/modern-resume-theme.scss`가 엔트리포인트로, base/button/type/dark/icons를 import한 뒤 커스텀 스타일을 추가합니다. `layout-top-left` 등의 레이아웃 클래스가 여기서 정의됩니다.
