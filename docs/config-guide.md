# _config.yml 편집 가이드

이 문서는 AI 에이전트용 _config.yml 레퍼런스다. 수정 전 반드시 읽을 것.

---

## A. 전역 설정 필드

최상위 키 전체 목록. 렌더링 진입점: `_layouts/default.html` → `_includes/header.html`, `about.html`, 각 섹션 include.

| 키 | 타입 | 필수 | 설명 | 예시/기본값 |
|---|---|---|---|---|
| `repository` | string | 아니오 | GitHub 저장소 경로 (SEO 용도) | `"username/username.github.io"` |
| `favicon` | string | 아니오 | 파비콘 이미지 경로 | `"images/favicon.png"` |
| `name` | string | 예 | 이름. `<h1>`으로 렌더링 | `"홍길동"` |
| `title` | string | 예 | 직군 한 줄 설명. `name` 오른쪽에 표시 | `"백엔드 개발자"` |
| `website` | array | 아니오 | 링크 목록. 각 항목은 `{title, content}` 쌍 | 아래 참조 |
| `email_title` | string | 아니오 | 이메일 앞 레이블 | `"📧"` |
| `email` | string | 아니오 | 이메일 주소 | `"dev@example.com"` |
| `phone_title` | string | 아니오 | 전화 앞 레이블 | `"☎️"` |
| `phone` | string | 아니오 | 전화번호 | `"010-0000-0000"` |
| `github_username` | string | 아니오 | GitHub 사용자명 (주석 처리 가능) | `"username"` |
| `about_content` | string | 아니오 | 자기소개 본문. 마크다운 지원. `\|` literal block 권장 | 아래 참조 |
| `remote_theme` | string | 예 | Jekyll 원격 테마 | `"sproogen/resume-theme"` |
| `sass` | object | 예 | Sass 설정 (`sass_dir`, `style`) | `{sass_dir: _sass, style: compressed}` |
| `plugins` | array | 예 | Jekyll 플러그인 목록 | `[jekyll-seo-tag]` |
| `exclude` | array | 아니오 | 빌드 제외 경로 목록 | `["Gemfile", "Gemfile.lock", ...]` |
| `content` | array | 예 | 섹션 목록. 순서대로 렌더링 | 아래 참조 |

### website 배열 구조

```yaml
website:
  - title: "💻"          # 링크 앞에 표시되는 레이블 (생략 가능)
    content: https://github.com/username  # URL (필수)
  - title: "블로그"
    content: https://blog.example.com
```

렌더링 결과 (`header.html` line 18):
```html
<p>[title] <a href="[content]">[content]</a></p>
```

주의: `website`는 **반드시 배열**이어야 한다. 단일 문자열로 쓰면 `for` 루프가 동작하지 않는다.

### about_content

```yaml
about_content: |
  **첫 문단.** 마크다운 지원.

  두 번째 문단.
```

렌더링: `about.html`이 `{{ site.about_content | strip | markdownify }}`로 처리. `<div class="intro-divider">` 안에 삽입.

---

## B. content 배열 구조

`content`는 섹션 객체의 배열이다. 배열 인덱스 순서대로 페이지에 렌더링된다.

```yaml
content:
  - title: 섹션 제목          # 필수. <h3 class="section-title">으로 출력
    layout: list              # "list" 또는 "text"
    content: ...              # layout에 따라 타입이 다름 (아래 참조)
```

### 섹션 라우팅 (`default.html` lines 10-32)

`default.html`은 `section.title`을 기준으로 HTML `id`와 include 파일을 결정한다:

| section.title | HTML id | include 파일 |
|---|---|---|
| `"경력"` | `experience` | `section-list.html` |
| `"문제 해결"` | `projects` | **`section-projects.html`** (특수 처리) |
| `"기술"` | `skills` | 해당 layout에 따라 결정 |
| `"스터디 활동"` | `activities` | `section-list.html` |
| `"학력"` | `education` | `section-list.html` |
| 그 외 | `title | slugify` | layout에 따라 결정 |

**중요:** `"문제 해결"` 섹션은 layout 값과 무관하게 항상 `section-projects.html`로 렌더링된다. 다른 섹션은 `layout: "text"`이면 `section-text.html`, 나머지는 `section-list.html`을 사용한다.

### layout: "text" 섹션

`content`가 **문자열**이어야 한다.

```yaml
- title: 기술
  layout: text
  content: |
    Kotlin, Spring Boot, JPA, Go, Redis, Kafka
```

렌더링 (`section-text.html`):
```html
<div class="layout">
  <div class="content">
    [마크다운 변환된 content]
  </div>
</div>
```

### layout: "list" 섹션

`content`가 **아이템 객체의 배열**이어야 한다.

```yaml
- title: 학력
  layout: list
  content:
    - title: OO대학교
      caption: 2013.03 ~ 2020.08
      description: 컴퓨터공학과 학사
```

---

## C. 아이템 필드 (layout: list 및 문제 해결 섹션)

### section-list.html 아이템 필드

| 필드 | 타입 | 필수 | 렌더링 동작 |
|---|---|---|---|
| `title` | string | 예 | `<h4>{{ item.title }}</h4>` |
| `sub_title` | string | 아니오 | `<p><b>{{ item.sub_title }}</b></p>`. 없으면 출력 안 됨 |
| `caption` | string | 아니오 | `<p class="meta-period">{{ item.caption }}</p>`. 없으면 출력 안 됨 |
| `quote` | string | 아니오 | `<p class="experience-quote">{{ item.quote }}</p>`. 없으면 출력 안 됨 |
| `description` | string | 아니오 | `{{ item.description \| strip \| markdownify }}`. `<div class="content">` 안에 삽입 |

`section-list.html`의 실제 DOM 구조:

```html
<div class="layout keep-together">
  <div class="details">
    <h4>[title]</h4>
    <p class="meta-period">[caption]</p>      <!-- caption 있을 때만 -->
    <p><b>[sub_title]</b></p>                  <!-- sub_title 있을 때만 -->
    <p class="experience-quote">[quote]</p>    <!-- quote 있을 때만 -->
  </div>
  <div class="content">
    [description 마크다운 변환]
  </div>
</div>
```

### section-projects.html 아이템 필드 ("문제 해결" 섹션 전용)

| 필드 | 타입 | 필수 | 렌더링 동작 |
|---|---|---|---|
| `title` | string | 예 | `<h4 class="project-title">{{ item.title }}</h4>` |
| `sub_title` | string | 아니오 | `<span class="project-subtitle">{{ item.sub_title }}</span>`. 없으면 블록 전체 출력 안 됨 |
| `caption` | string | 아니오 | `<p class="project-side-meta">{{ item.caption }}</p>` |
| `skills` | string | 아니오 | `<p class="project-stack-line">{{ item.skills }}</p>`. 없으면 출력 안 됨 |
| `description` | string | 아니오 | `{{ item.description \| strip \| markdownify }}`. `<div class="project-content">` 안에 삽입 |

`section-projects.html`의 실제 DOM 구조:

```html
<article class="project-card keep-together">
  <div class="project-head">
    <h4 class="project-title">[title]</h4>
    <div class="project-side-info">
      <p class="project-side-meta">[caption]</p>
    </div>
  </div>
  <p class="project-meta-line project-subtitle-line">  <!-- sub_title 있을 때만 -->
    <span class="project-subtitle">[sub_title]</span>
  </p>
  <p class="project-stack-line">[skills]</p>           <!-- skills 있을 때만 -->
  <div class="project-content">
    [description 마크다운 변환]
  </div>
</article>
```

---

## D. 섹션 라우팅 상세

`default.html`은 섹션을 다음 우선순위로 include 파일에 라우팅한다:

1. `section.title == "문제 해결"` → `section-projects.html` (title 하드코딩, layout 값 무관)
2. `section.layout == "text"` → `section-text.html`
3. 그 외 → `section-list.html`

### section-list.html

모든 아이템을 동일한 2-column 구조(`.details` + `.content`)로 렌더링:

- `.details` div: title → caption → sub_title → quote 순서로 표시
- `.content` div: description 마크다운 렌더링

### section-projects.html ("문제 해결" 섹션)

모든 아이템을 `<article class="project-card">` 구조로 렌더링. `quote` 필드는 이 템플릿에서 출력되지 않는다.

### section-text.html

섹션 전체 content 문자열을 단일 `<div class="content">` 안에 렌더링. 아이템 배열 구조 없음.

---

## E. YAML 작성 규칙

### 들여쓰기

- 2 spaces 사용. 탭 사용 금지.
- 배열 항목(`-`)은 부모 키에서 2칸 들여쓰기.

```yaml
content:
  - title: 섹션 제목       # 4칸 (content 키에서 2칸 + - 에서 1칸 = 항목 본문은 4칸)
    layout: list
    content:
      - title: 항목 제목   # 6칸
```

### 블록 스칼라

| 기호 | 이름 | 동작 | 권장 사용처 |
|---|---|---|---|
| `\|` | literal block scalar | 줄바꿈을 그대로 유지 | `description`, `about_content` |
| `>` | folded scalar | 줄바꿈을 공백으로 변환 (단락 사이 빈 줄은 유지) | `quote` |

```yaml
description: |
  첫 번째 줄
  두 번째 줄        # 줄바꿈 유지됨

quote: >
  이 긴 문장은
  한 줄로 합쳐진다  # "이 긴 문장은 한 줄로 합쳐진다"로 렌더링
```

### 특수문자 처리

콜론(`:`)이 포함된 문자열은 따옴표로 감싸야 한다:

```yaml
title: "문제: 해결 과정"    # 콜론 포함 시 따옴표 필요
caption: 2024.01 ~ 2025.12  # 콜론 없으면 따옴표 불필요
```

### description 마크다운

```yaml
description: |
  **굵은 글씨**

  단락 구분은 빈 줄 하나 필요 (마크다운 규칙)

  - 목록 항목 1
  - 목록 항목 2
```

단락 사이에 빈 줄이 없으면 연속된 텍스트로 붙어서 렌더링된다.

---

## F. 주의사항 (흔한 실수)

### 1. YAML 들여쓰기 오류

가장 빈번한 실수. 섹션 레벨(content 배열 최상위)과 아이템 레벨(content 내부 배열) 혼동.

```yaml
# 잘못된 예 — 아이템이 섹션 레벨에 있음
content:
  - title: 경력
    layout: list
  - title: A사             # 오류: 이건 섹션 객체처럼 파싱됨

# 올바른 예
content:
  - title: 경력
    layout: list
    content:
      - title: A사         # 아이템은 content 하위에
```

### 2. website는 배열

```yaml
# 잘못된 예
website: https://github.com/username

# 올바른 예
website:
  - title: "💻"
    content: https://github.com/username
```

### 3. skills는 쉼표 구분 문자열 (배열 아님)

```yaml
# 잘못된 예
skills:
  - Go
  - Redis

# 올바른 예
skills: Go, Redis, PostgreSQL
```

### 4. section-list.html의 렌더링 순서

`.details` div 내부 순서는 코드에 고정되어 있다: title → caption → sub_title → quote. YAML의 필드 순서가 달라도 출력 순서는 바뀌지 않는다.

### 5. "문제 해결" 섹션에서 quote 필드는 렌더링되지 않음

`section-projects.html`은 `quote`를 참조하지 않는다. "문제 해결" 섹션 아이템에 `quote`를 써도 출력되지 않는다.

---

## G. 완성된 섹션 예시 (더미 데이터)

### layout: text 섹션

```yaml
- title: 기술
  layout: text
  content: |
    Kotlin, Spring Boot, JPA, Go, PostgreSQL, Redis, Kafka
```

### layout: list 섹션 (경력)

```yaml
- title: 경력
  layout: list
  content:
    - title: A회사
      sub_title: Backend Engineer
      caption: 2024.01 ~ 2025.12
      quote: >
        서비스 한 줄 설명
      description: |
        - 성과 1 **수치 포함**
        - 성과 2
```

### 문제 해결 섹션

```yaml
- title: 문제 해결
  layout: list
  content:
    - title: 프로젝트 제목
      sub_title: 핵심 성과 한 줄
      caption: A회사 · 2024.06
      skills: Go, Redis, PostgreSQL
      description: |
        **문제**

        문제 설명.

        **해결 과정**
        - 접근법 1
        - 접근법 2

        **결과**
        - 성과 수치
```

### 스터디/학력 섹션 (layout 생략 가능)

```yaml
- title: 학력
  layout: list
  content:
    - title: OO대학교
      caption: 2013.03 ~ 2020.08
      description: 컴퓨터공학과 학사
```
