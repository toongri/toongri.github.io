# toongri.github.io

Jekyll 기반 개인 이력서 사이트.

실제 배포 사이트: https://toongri.github.io/

---

## 사용법

이력서가 어떻게 작성되는지 관심 갖지 마세요. Claude Code에게 맡기세요.

### 처음 시작

기존 이력서가 있다면 그대로 전달하세요. _config.yml에 반영해줍니다.

```
이 PDF를 이력서에 반영해줘. {PDF 파일 첨부}

이 링크의 이력서를 참고해서 반영해줘. {URL}

이 내용으로 이력서 만들어줘. {텍스트}
```

### 기본 사용

완성된 이력서를 보고 싶으면 이력서 보여달라고 하세요. http://localhost:4000 으로 보입니다.

PDF를 달라고 하세요. `resume.pdf`로 떨어집니다. 파일명을 요청해도 됩니다.

### 스킬

세 가지 기능만 기억하세요: `review-resume`, `resume-apply`, `sisyphus`

### review-resume

이력서 리뷰를 요청하세요. 자기소개, 경력, 문제 해결 등 섹션별로 평가하고 개선점을 제시합니다.

리뷰 과정에서 인터뷰를 통해 여러 대안들을 note에 기록해둡니다. 이후 JD에 맞춰 note에서 적절한 레퍼런스를 가져올 수 있습니다.

```
/review-resume 지금 내 resume을 평가해줘.

/review-resume @외부resume을 평가해줘.
```

### resume-apply

JD(채용공고)를 전달하면, 이력서 리뷰부터 PDF 생성 및 보관까지 하나의 프로세스로 관리합니다.

JD마다 브랜치가 생성되어 보관됩니다. 이전 지원 이력이 다음 이력서 작성의 레퍼런스가 됩니다.

```
/resume-apply jd 줄게. {겁나 긴 실제 jd내용}

/resume-apply 시작하자. {jd 링크 or jd 텍스트}
```

### sisyphus

회사 리서치를 요구하세요. 이력서 리디자인을 요구하세요. review-resume, resume-apply 커스텀을 요구하세요.

```
/sisyphus 자간이 마음에 안들어 키워줘.

/sisyphus toss bank의 핵심 가치를 research 해줘.
```

---

## 그럼에도 불구하고 직접 실행시키고 싶은 당신에게

```bash
# 로컬에서 이력서 확인
docker compose up
# → http://localhost:4000

# PDF 생성
bun run pdf
# → resume.pdf

# 특정 브랜치 기준 PDF
bun run pdf feature-branch
```

의존성: bun, Docker, Playwright (Chromium)

---

## GitHub Pages

`main` 브랜치에 push하면 GitHub Pages를 통해 자동으로 사이트에 반영됩니다.
