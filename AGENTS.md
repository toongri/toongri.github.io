# Repository Guidelines

## Project Structure & Module Organization
This repository is a GitHub Pages Jekyll resume site.

- `_config.yml`: primary source of site content (profile, career, projects, skills, footer flags).
- `_includes/`: reusable Liquid partials (header, footer, section renderers, analytics snippets).
- `_layouts/`: page-level templates (`default.html`).
- `_sass/` and `assets/main.scss`: theme and style overrides.
- `assets/js/index.js`: minimal client-side behavior.
- `images/`: static image assets (favicon, profile photo).
- `index.md`: entry page content/front matter.

## Build, Test, and Development Commands
- `docker-compose up`: run local dev server in Docker at `http://localhost:4000`.
- `bundle install`: install Ruby gems for local (non-Docker) development.
- `bundle exec jekyll serve --livereload`: run local server with live reload.
- `bundle exec jekyll build`: production-style build into `_site/` (use as a validation step before PR).

## Coding Style & Naming Conventions
- Use existing formatting per file type: 2 spaces for YAML in `_config.yml`, 4 spaces in HTML/Liquid templates.
- Keep Liquid includes kebab-case and descriptive (example: `section-list.html`, `gtm_head.html`).
- Prefer small, focused edits: content changes in `_config.yml`; markup changes in `_includes/`/`_layouts/`; styling in `_sass/`.
- Keep JS minimal and framework-free unless there is a clear need.

## Testing Guidelines
There is no dedicated automated test suite in this repository.

- Treat `bundle exec jekyll build` as the baseline validation check.
- Manually verify key pages/sections in `jekyll serve` after template or config changes.
- For UI edits, confirm responsive behavior and check for Liquid render errors in server logs.

## Commit & Pull Request Guidelines
- Follow the current commit pattern: `type: short summary` (examples in history: `docs: ...`, `chore: ...`).
- Keep commits scoped to one concern (content, layout, style, or tooling).
- PRs should include:
  - concise description of what changed and why,
  - linked issue/context if applicable,
  - screenshots for visible UI/content changes,
  - confirmation that `bundle exec jekyll build` succeeded.
