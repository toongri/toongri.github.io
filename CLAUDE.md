# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jekyll 기반 개인 이력서/포트폴리오 웹사이트로, GitHub Pages에서 호스팅됩니다.

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

- **`_config.yml`**: 모든 이력서 콘텐츠(경력, 기술, 프로젝트 등)가 이 단일 파일에 저장됩니다. 콘텐츠 수정 시 이 파일만 편집하면 됩니다.
- **`_sass/`**: 스타일 커스터마이징. 원격 테마(`sproogen/resume-theme`)를 사용하므로 레이아웃 파일은 로컬에 없고, 스타일 오버라이드로 커스터마이징합니다.
- **`_includes/`**: 템플릿 조각들 (헤더, 푸터, 섹션 등)
