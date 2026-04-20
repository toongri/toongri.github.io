import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

// ============================================================
// 설정값
// ============================================================

const CONFIG = {
  url: 'http://localhost:4000',
  outputFile: 'resume.pdf',
  viewportWidth: 794,
  margin: { top: 11, right: 10, bottom: 11, left: 10 },
  deviceScaleFactor: 2,
};

const A4 = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  WIDTH_PX: 794,
  HEIGHT_PX: 1123,
};

// ============================================================
// 타입 정의
// ============================================================

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PdfConfig {
  outputFile: string;
  margin: MarginConfig;
  scale: number;
}

export interface PdfOptions {
  path: string;
  format: string;
  printBackground: boolean;
  scale: number;
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  displayHeaderFooter: boolean;
}

// ============================================================
// 순수 함수 (export — 테스트 가능)
// ============================================================

/**
 * PDF scale 계산
 * scale = (A4 픽셀 너비 중 여백 제외 콘텐츠 영역) / 뷰포트 너비
 */
export function calculateScale(
  viewportWidth: number,
  margin: { left: number; right: number }
): number {
  const marginHorizontalMm = margin.left + margin.right;
  const contentAreaWidthMm = A4.WIDTH_MM - marginHorizontalMm;
  const contentAreaWidthPx = (contentAreaWidthMm / A4.WIDTH_MM) * A4.WIDTH_PX;
  return contentAreaWidthPx / viewportWidth;
}

/**
 * PDF 렌더링을 위한 CSS 오버라이드 문자열 반환
 */
export function getCssOverrides(viewportWidth: number): string {
  return `
    html, body { min-width: ${viewportWidth}px !important; background: #fff !important; }
    .resume { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; min-height: auto !important; }
    footer { display: none !important; }
    @media print { * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
  `;
}

/**
 * Playwright page.pdf에 전달할 옵션 객체 반환
 */
export function buildPdfOptions(config: PdfConfig): PdfOptions {
  return {
    path: config.outputFile,
    format: 'A4',
    printBackground: true,
    scale: config.scale,
    margin: {
      top: `${config.margin.top}mm`,
      right: `${config.margin.right}mm`,
      bottom: `${config.margin.bottom}mm`,
      left: `${config.margin.left}mm`,
    },
    displayHeaderFooter: false,
  };
}

/**
 * 서버가 응답할 때까지 polling (1초 간격)
 */
export async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const startTime = Date.now();
  while (true) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      // 서버 미응답 — 계속 시도
    }
    if (Date.now() - startTime >= timeoutMs) {
      throw new Error(`Server did not respond within ${timeoutMs}ms: ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// ============================================================
// 메인 실행 함수
// ============================================================

async function main(): Promise<void> {
  const targetBranch = process.argv[2] ?? 'main';

  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(path.dirname(__filename), '..');

  const exec = (cmd: string) =>
    execSync(cmd, { cwd: projectRoot, stdio: 'inherit' });

  const execOutput = (cmd: string) =>
    execSync(cmd, { cwd: projectRoot, encoding: 'utf-8' }).trim();

  // 현재 브랜치 저장
  const originalBranch = execOutput('git rev-parse --abbrev-ref HEAD');
  console.log(`현재 브랜치: ${originalBranch}`);
  console.log(`대상 브랜치: ${targetBranch}`);

  try {
    // 대상 브랜치로 이동
    if (targetBranch !== originalBranch) {
      exec(`git checkout ${targetBranch}`);
    }

    // Docker 실행
    console.log('docker compose up -d 실행 중...');
    exec('docker compose up -d');

    // 서버 대기
    console.log('서버 응답 대기 중 (최대 60초)...');
    await waitForServer(CONFIG.url, 60000);
    console.log('서버 준비 완료');

    // Playwright PDF 생성
    console.log('PDF 생성 중...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      deviceScaleFactor: CONFIG.deviceScaleFactor,
      viewport: { width: CONFIG.viewportWidth, height: 800 },
    });
    const page = await context.newPage();

    await page.emulateMedia({ media: 'screen' });

    const cssOverrides = getCssOverrides(CONFIG.viewportWidth);
    await page.addInitScript((css) => {
      const injectStyle = () => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyle);
      } else {
        injectStyle();
      }
    }, cssOverrides);

    await page.goto(CONFIG.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise<void>((resolve) => {
                img.onload = img.onerror = () => resolve();
              })
          )
      );
    });

    // 동적 break-inside: 페이지 높이 대비 짧은 항목만 보호
    const marginVerticalMm = CONFIG.margin.top + CONFIG.margin.bottom;
    const contentHeightMm = A4.HEIGHT_MM - marginVerticalMm;
    const contentHeightPx = (contentHeightMm / A4.HEIGHT_MM) * A4.HEIGHT_PX;
    const scale = calculateScale(CONFIG.viewportWidth, CONFIG.margin);
    const pageHeightVp = contentHeightPx / scale;

    await page.evaluate((threshold) => {
      document.querySelectorAll<HTMLElement>('.layout, .project-card, #resume-content > section').forEach((el) => {
        if (el.getBoundingClientRect().height < threshold) {
          el.style.breakInside = 'avoid';
        } else {
          el.style.breakInside = 'auto';
        }
      });
    }, pageHeightVp * 0.55);

    // header-right 잘림 방지: text-align: right 상태에서 뷰포트 경계 잘림 방지
    await page.evaluate(() => {
      const resume = document.querySelector<HTMLElement>('.resume');
      const header = document.querySelector<HTMLElement>('.resume-header');
      if (!resume || !header) return;
      const pr = parseFloat(getComputedStyle(resume).paddingRight);
      if (pr > 0) {
        // 패딩이 있으면 헤더를 패딩 영역으로 확장
        header.style.setProperty('margin-right', `-${pr}px`, 'important');
      } else {
        // 패딩이 0이면 텍스트가 뷰포트 경계에 밀착 → 여유 확보
        header.style.setProperty('padding-right', '6px', 'important');
      }
    });

    const pdfOptions = buildPdfOptions({
      outputFile: CONFIG.outputFile,
      margin: CONFIG.margin,
      scale,
    });

    await page.pdf(pdfOptions);
    await browser.close();

    console.log(`완료: ${CONFIG.outputFile}`);
  } finally {
    // 항상 cleanup
    try {
      exec('docker compose down');
    } catch {
      console.error('docker compose down 실패 (무시)');
    }

    if (targetBranch !== originalBranch) {
      try {
        exec(`git checkout ${originalBranch}`);
      } catch {
        console.error(`git checkout ${originalBranch} 실패`);
      }
    }

  }
}

// 직접 실행 시에만 main 호출
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('generate-resume-pdf.ts') ||
    process.argv[1].endsWith('generate-resume-pdf.js'));

if (isMain) {
  main().catch((err) => {
    console.error('오류 발생:', err);
    process.exit(1);
  });
}
