import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Tailwind v4 oklch sanitization ──────────────────────────────────────────
// Tailwind v4 emits palette colors as oklch() which html2canvas (v1.4.x) can't
// parse. Canvas 2D fillStyle accepts oklch and normalises it to #rrggbb on
// read-back — we exploit this to convert any oklch value into a hex string.
const _cc = document.createElement('canvas');
_cc.width = _cc.height = 1;
const _ctx = _cc.getContext('2d')!;
function toRgb(v: string): string {
  try {
    _ctx.fillStyle = '#000';
    _ctx.fillStyle = v;
    return _ctx.fillStyle;
  } catch {
    return v;
  }
}

// Replace every oklch(...) call inside a CSS text blob with its hex equivalent.
function rewriteOklchInCss(css: string): string {
  return css.replace(/oklch\([^)]+\)/g, (m) => toRgb(m));
}

const COLOR_PROPS = [
  'color', 'background-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'outline-color', 'text-decoration-color', 'caret-color',
];

function patchOklch(doc: Document, root: HTMLElement) {
  const win = doc.defaultView ?? window;

  // 1) Inline computed style on every node — primary case for class-based colors.
  [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].forEach((el) => {
    if (!el.style) return;
    const cs = win.getComputedStyle(el);
    COLOR_PROPS.forEach((p) => {
      const v = cs.getPropertyValue(p);
      if (v && v.includes('oklch')) el.style.setProperty(p, toRgb(v));
    });
    const bgImg = cs.getPropertyValue('background-image');
    if (bgImg && bgImg.includes('oklch')) {
      // Rewrite gradients in-place rather than dropping them entirely.
      el.style.setProperty('background-image', rewriteOklchInCss(bgImg));
    }
  });

  // 2) Stylesheet rules — Tailwind v4 emits CSS custom properties on :root
  //    that resolve to oklch. Rewrite any rule that contains oklch so the
  //    cloned document never exposes a raw oklch token to html2canvas.
  Array.from(doc.styleSheets).forEach((sheet) => {
    let rules: CSSRuleList | null = null;
    try { rules = sheet.cssRules; } catch { return; /* CORS — skip */ }
    if (!rules) return;
    Array.from(rules).forEach((rule) => {
      const styleRule = rule as CSSStyleRule;
      if (!styleRule.style) return;
      if (!styleRule.cssText.includes('oklch')) return;
      try {
        for (let i = 0; i < styleRule.style.length; i++) {
          const name = styleRule.style.item(i);
          const value = styleRule.style.getPropertyValue(name);
          if (value && value.includes('oklch')) {
            styleRule.style.setProperty(
              name,
              rewriteOklchInCss(value),
              styleRule.style.getPropertyPriority(name)
            );
          }
        }
      } catch {
        // Fallback: inject a fresh <style> with the rewritten rule so it
        // wins over the original via cascade order.
        const style = doc.createElement('style');
        style.textContent = rewriteOklchInCss(styleRule.cssText);
        doc.head.appendChild(style);
      }
    });
  });
}

function patchMisc(root: HTMLElement) {
  // html2canvas can mis-render these — strip for export fidelity.
  root.querySelectorAll('[class*="mix-blend"]').forEach((n) =>
    (n as HTMLElement).style.setProperty('mix-blend-mode', 'normal'));
  root.querySelectorAll('[class*="grayscale"]').forEach((n) =>
    (n as HTMLElement).style.setProperty('filter', 'none'));
  root.querySelectorAll('[class*="rotate"]').forEach((n) =>
    (n as HTMLElement).style.setProperty('transform', 'none'));
}

function makeShadowContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.style.cssText =
    'position:fixed;top:0;left:0;width:794px;z-index:-1;pointer-events:none;background:#fff;font-size:16px;';
  document.body.appendChild(div);
  return div;
}

function prepareClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.boxShadow = 'none';
  clone.style.width = '794px';
  // CRITICAL: minHeight, not height. A hard height locks the inner flex
  // column into a 1123px box; when natural content is taller (retro theme is
  // ~1300-1500px), flex children compress and text visibly overlaps.
  clone.style.minHeight = '1123px';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.margin = '0';
  clone.style.padding = '0';
  return clone;
}

// Wait for fonts to load and the next two paints to commit, so html2canvas
// captures fully-rendered text rather than a still-loading frame.
async function waitForRender(): Promise<void> {
  await Promise.all([
    document.fonts.ready,
    document.fonts.load('400 16px Inter'),
    document.fonts.load('700 16px Inter'),
  ]).catch(() => { /* non-fatal — fonts may already be cached */ });
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
}

// Single source of truth for the capture pipeline — both exporters use this.
async function captureCanvas(elementId: string): Promise<HTMLCanvasElement> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(
      `Element #${elementId} not found — the invoice preview may not be mounted yet.`
    );
  }

  const shadowContainer = makeShadowContainer();
  const clone = prepareClone(element);
  shadowContainer.appendChild(clone);

  try {
    await waitForRender();

    return await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      logging: false,
      onclone: (doc, el) => {
        patchOklch(doc, el);
        patchMisc(el);
      },
    });
  } finally {
    if (shadowContainer.parentNode) document.body.removeChild(shadowContainer);
  }
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function exportToPDF(elementId: string, filename: string) {
  let canvas: HTMLCanvasElement;
  try {
    canvas = await captureCanvas(elementId);
  } catch (error) {
    console.error('[exportToPDF] capture failed:', error);
    throw error;
  }

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    // Convert mm → source-canvas pixels so we know how tall a single A4 page
    // is in the captured bitmap.
    const pxPerMm = canvas.width / pdfWidthMm;
    const pageHeightPx = Math.floor(pdfHeightMm * pxPerMm);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

    if (totalPages === 1) {
      const fullHeightMm = (canvas.height * pdfWidthMm) / canvas.width;
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG', 0, 0, pdfWidthMm, fullHeightMm, undefined, 'FAST'
      );
    } else {
      // Multi-page: slice the captured canvas vertically into page-sized chunks.
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      const pageCtx = pageCanvas.getContext('2d')!;

      for (let i = 0; i < totalPages; i++) {
        const sliceY = i * pageHeightPx;
        const sliceHeight = Math.min(pageHeightPx, canvas.height - sliceY);
        pageCanvas.height = sliceHeight;
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0, sliceY, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight,
        );
        const sliceHeightMm = (sliceHeight * pdfWidthMm) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(
          pageCanvas.toDataURL('image/png'),
          'PNG', 0, 0, pdfWidthMm, sliceHeightMm, undefined, 'FAST'
        );
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('[exportToPDF] PDF assembly failed:', error);
    throw error;
  }
}

// ─── PNG ─────────────────────────────────────────────────────────────────────

export async function exportToPNG(elementId: string, filename: string) {
  let canvas: HTMLCanvasElement;
  try {
    canvas = await captureCanvas(elementId);
  } catch (error) {
    console.error('[exportToPNG] capture failed:', error);
    throw error;
  }

  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
