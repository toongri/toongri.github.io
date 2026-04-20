# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Jekyll-based personal resume/portfolio website hosted on GitHub Pages. Uses the remote theme `sproogen/resume-theme` with local layout and style overrides. 실제 배포 사이트: https://toongri.github.io

이 프로젝트의 resume는 `_config.yml`이다.

## Development Commands

```bash
# Start dev server via Docker (recommended)
docker compose up
# → http://localhost:4000

# Local Ruby environment
bundle install
bundle exec jekyll serve --livereload
```

```bash
# PDF generation (convert resume to PDF)
bun run pdf                   # Generate PDF from main branch
bun run pdf feature-branch    # Generate PDF from a specific branch
bun test                      # Run tests
```

PDF generation flow: checkout target branch → serve Jekyll via Docker → convert to PDF via Playwright → produce `resume.pdf` → shut down Docker + restore branch.
Dependencies: bun, Docker, Playwright (Chromium).

Deployment is automatic via GitHub Pages when pushing to the `main` branch.

## Architecture

### Content Structure

**All resume content is stored in a single `_config.yml` file.** Edit this file to modify content. **_config.yml 수정 전 `docs/config-guide.md`를 반드시 확인할 것.**

The `content` array in `_config.yml` defines page sections. Each section has a `layout` (rendering method) and `content` (array of items):

```yaml
content:
  - title: Section Title
    layout: list          # list or text → rendered via section-list.html or section-text.html
    content:
      - title: Item Title
        sub_title: Subtitle
        caption: Period
        skills: Go, Redis  # Tech stack display (optional, 문제 해결 섹션 전용)
        quote: Summary      # Italic quote (optional, section-list.html에서만 출력)
        description: |      # Supports Markdown
          - Detail
```

Note: item-level `layout` 필드는 v2에서 사용하지 않는다. YAML에 작성해도 무시된다.

### Rendering Flow

`index.md` → `_layouts/default.html` → iterates through the `content` array in `_config.yml`, routing each section as follows:

1. `section.title == "문제 해결"` → `_includes/section-projects.html` (title 하드코딩, layout 값 무관)
2. `section.layout == "text"` → `_includes/section-text.html`
3. 그 외 → `_includes/section-list.html`

### Style Overrides

`_sass/modern-resume-theme.scss` is the entry point, importing base/button/type/dark/icons and adding custom styles.
