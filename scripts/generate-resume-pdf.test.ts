import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import {
  calculateScale,
  getCssOverrides,
  buildPdfOptions,
  waitForServer,
} from './generate-resume-pdf';

describe('calculateScale', () => {
  test('기본 설정으로 올바른 scale 값을 반환한다', () => {
    // A4: 794px wide, margin left+right = 20mm
    // contentAreaWidthMm = 210 - 20 = 190
    // contentAreaWidthPx = (190 / 210) * 794 ≈ 718.095...
    // scale = 718.095... / 1100 ≈ 0.6528...
    const scale = calculateScale(1100, { left: 10, right: 10 });
    expect(scale).toBeCloseTo(0.6528, 3);
  });

  test('여백이 0일 때 scale은 A4 픽셀 너비를 뷰포트로 나눈 값이다', () => {
    // contentAreaWidthPx = (210/210) * 794 = 794
    // scale = 794 / 1100 ≈ 0.7218...
    const scale = calculateScale(1100, { left: 0, right: 0 });
    expect(scale).toBeCloseTo(794 / 1100, 5);
  });

  test('뷰포트 너비가 작을수록 scale이 커진다', () => {
    const scaleWide = calculateScale(1200, { left: 10, right: 10 });
    const scaleNarrow = calculateScale(800, { left: 10, right: 10 });
    expect(scaleNarrow).toBeGreaterThan(scaleWide);
  });
});

describe('getCssOverrides', () => {
  test('min-width 규칙이 뷰포트 너비로 포함된다', () => {
    const css = getCssOverrides(1100);
    expect(css).toContain('min-width: 1100px !important');
  });

  test('footer를 숨기는 규칙이 포함된다', () => {
    const css = getCssOverrides(1100);
    expect(css).toContain('footer');
    expect(css).toContain('display: none !important');
  });

  test('.resume width 100% 규칙이 포함된다', () => {
    const css = getCssOverrides(1100);
    expect(css).toContain('.resume');
    expect(css).toContain('width: 100% !important');
  });

  test('@media print 색상 보정 규칙이 포함된다', () => {
    const css = getCssOverrides(1100);
    expect(css).toContain('@media print');
    expect(css).toContain('print-color-adjust: exact !important');
  });

  test('뷰포트 너비가 다르면 min-width도 달라진다', () => {
    const css900 = getCssOverrides(900);
    expect(css900).toContain('min-width: 900px !important');
  });
});

describe('buildPdfOptions', () => {
  const baseConfig = {
    outputFile: 'resume.pdf',
    margin: { top: 10, right: 10, bottom: 10, left: 10 },
    scale: 0.65,
  };

  test('format이 A4이다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.format).toBe('A4');
  });

  test('printBackground가 true이다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.printBackground).toBe(true);
  });

  test('displayHeaderFooter가 false이다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.displayHeaderFooter).toBe(false);
  });

  test('margin 값이 mm 단위 문자열로 변환된다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.margin).toEqual({
      top: '10mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    });
  });

  test('scale이 그대로 전달된다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.scale).toBeCloseTo(0.65, 5);
  });

  test('path가 outputFile로 설정된다', () => {
    const options = buildPdfOptions(baseConfig);
    expect(options.path).toBe('resume.pdf');
  });
});

describe('waitForServer', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('서버가 200을 반환하면 즉시 resolve된다', async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response('ok', { status: 200 }))
    );

    await expect(waitForServer('http://localhost:4000', 5000)).resolves.toBeUndefined();
  });

  test('서버가 계속 실패하면 타임아웃 후 reject된다', async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error('ECONNREFUSED')));

    await expect(waitForServer('http://localhost:4000', 100)).rejects.toThrow();
  });

  test('처음 실패 후 두 번째에 성공하면 resolve된다', async () => {
    let callCount = 0;
    globalThis.fetch = mock(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('ECONNREFUSED'));
      }
      return Promise.resolve(new Response('ok', { status: 200 }));
    });

    await expect(waitForServer('http://localhost:4000', 5000)).resolves.toBeUndefined();
    expect(callCount).toBe(2);
  });
});
