# GEMINI.md

This file provides context and instructions for Gemini CLI when working in this repository.

## Project Overview

A Jekyll-based personal resume/portfolio website hosted on GitHub Pages. It uses a customized version of the `sproogen/resume-theme` to display a professional resume.

- **Primary Technologies:** Jekyll (Static Site Generator), Ruby, Liquid, SASS.
- **Hosting:** GitHub Pages.
- **Design:** Modern, responsive resume layout with dark mode support.

## Architecture

The project follows a standard Jekyll structure but heavily relies on `_config.yml` for content and customizes a remote theme.

### Key Files & Directories

- **`_config.yml`**: **Critical File.** This is the single source of truth for all resume content. It contains:
    - Personal information (name, contact, social links).
    - Resume sections (Work Experience, Projects, Skills, Education, Study activities).
    - Layout configurations (uses `version: 2` custom logic).
- **`_layouts/default.html`**: The main template that iterates through `site.content` in `_config.yml` to render sections dynamically.
- **`_includes/`**: Contains HTML fragments for different section layouts (e.g., `section-list.html`, `section-text.html`) and site components (header, footer, about).
- **`_sass/`**: Contains styling overrides. `modern-resume-theme.scss` is the main entry point for custom styles.
- **`assets/main.scss`**: The main SCSS file that imports the theme and custom styles.
- **`images/`**: Stores images like `profile.jpeg` and `favicon.png`.
- **`index.md`**: The entry point of the site, which uses the `default` layout.

### Content Management

To update the resume, modify the `content` list in `_config.yml`. Each item in the list supports different layouts:
- `left`, `right`, `top`, `top-left`, `top-middle`, `top-right`.

## Development Commands

### Environment Setup

The project can be run via Docker or a local Ruby environment.

#### Docker (Recommended)
```bash
# Start development server
docker-compose up
# Access at http://localhost:4000
```

#### Local Ruby
```bash
# Install dependencies
bundle install

# Run Jekyll server with livereload
bundle exec jekyll serve --livereload
```

### Building & Testing

- **Build:** `bundle exec jekyll build`
- **Linting:** Currently no specific linter is configured, but SCSS and HTML should follow standard conventions.

## Development Conventions

1.  **Content-First:** Always prefer updating `_config.yml` for content changes before touching HTML/Liquid files.
2.  **Style Overrides:** Add custom styles to `_sass/modern-resume-theme.scss` or create new partials in `_sass/` and import them.
3.  **Clean Liquid:** Keep logic in `_includes` simple. Use Liquid filters for data manipulation.
4.  **No Direct Commits to Main:** Follow standard PR workflows if collaborating, although this is primarily a personal repository.
5.  **GitHub Actions:** Deployment is handled automatically by GitHub Pages when pushing to the `main` branch.
