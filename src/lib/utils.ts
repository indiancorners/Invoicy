import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// html2canvas + jsPDF are dynamically imported inside the export functions so
// they're code-split into a separate async chunk — not loaded on initial page
// view (they're ~200 KB gzip and only needed when a user actually exports).

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

// Any CSS Color 4 function html2canvas v1.4.x can't parse. Tailwind v4 emits
// oklch() for palette colors and color-mix(in oklab, …) for opacity modifiers
// (e.g. bg-flame/20), so we must catch all of these — not just oklch.
const UNSUPPORTED_COLOR_RE = /\b(?:oklch|oklab|lch|lab|color-mix|color|hwb)\(/i;
// A full color-function call, tolerating one level of nested parens so
// color-mix(in oklab, oklch(…) 50%, transparent) matches as a whole.
const COLOR_FN_RE = /(?:oklch|oklab|lch|lab|color-mix|color|hwb)\([^()]*(?:\([^()]*\)[^()]*)*\)/gi;

// Convert any unsupported color functions in a CSS value to rgb. Works for both
// single-color props (color, fill, …) and compound values (gradients, shadows).
function sanitizeColorValue(v: string): string {
  if (!v || !UNSUPPORTED_COLOR_RE.test(v)) return v;
  // Canvas resolves a single color AND color-mix() to rgb in one shot.
  const whole = toRgb(v);
  if (whole && !UNSUPPORTED_COLOR_RE.test(whole)) return whole;
  // Compound value — convert each color-function token individually.
  return v.replace(COLOR_FN_RE, (m) => {
    const c = toRgb(m);
    return c && !UNSUPPORTED_COLOR_RE.test(c) ? c : m;
  });
}

// Inline-override EVERY computed property whose value carries an unsupported
// color function, baking the rgb equivalent into the element's style attribute.
// MUST run against a fully-styled element (live document) — see captureCanvas.
function inlineSanitizeColors(root: HTMLElement, win: Window) {
  [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].forEach((el) => {
    if (!el.style) return;
    const cs = win.getComputedStyle(el);
    for (let i = 0; i < cs.length; i++) {
      const name = cs.item(i);
      const value = cs.getPropertyValue(name);
      if (value && UNSUPPORTED_COLOR_RE.test(value)) {
        const fixed = sanitizeColorValue(value);
        if (fixed !== value) {
          try { el.style.setProperty(name, fixed, cs.getPropertyPriority(name)); } catch { /* read-only */ }
        }
      }
    }
  });
}

// Rewrite stylesheet rules in the cloned doc — backstop for anything inline
// styles can't reach (::before/::after pseudo-elements, custom-property vars).
// Recurses into @layer/@media/@supports groups where Tailwind v4 nests rules.
function rewriteStylesheetColors(doc: Document) {
  const overrides: string[] = [];
  const seen = new Set<string>();
  const visit = (rules: CSSRuleList) => {
    Array.from(rules).forEach((rule) => {
      const styleRule = rule as CSSStyleRule;
      if (styleRule.style && UNSUPPORTED_COLOR_RE.test(styleRule.cssText)) {
        for (let i = 0; i < styleRule.style.length; i++) {
          const name = styleRule.style.item(i);
          const value = styleRule.style.getPropertyValue(name);
          if (!value || !UNSUPPORTED_COLOR_RE.test(value)) continue;
          const fixed = sanitizeColorValue(value);
          if (fixed === value) continue;
          // Custom properties: collect into a high-priority :root override so
          // var() references everywhere (incl. pseudo-elements) resolve to rgb.
          if (name.startsWith('--')) {
            if (!seen.has(name)) { overrides.push(`${name}:${fixed}`); seen.add(name); }
          } else {
            try { styleRule.style.setProperty(name, fixed, styleRule.style.getPropertyPriority(name)); } catch { /* ignore */ }
          }
        }
      }
      const grouping = (rule as CSSGroupingRule).cssRules;
      if (grouping) visit(grouping);
    });
  };
  Array.from(doc.styleSheets).forEach((sheet) => {
    let rules: CSSRuleList | null = null;
    try { rules = sheet.cssRules; } catch { return; /* CORS — skip */ }
    if (rules) visit(rules);
  });
  if (overrides.length) {
    const style = doc.createElement('style');
    style.textContent = `:root,:host{${overrides.join(';')}}`;
    doc.head.appendChild(style);
  }
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
    const html2canvas = (await import('html2canvas')).default;
    await waitForRender();

    // CRITICAL: sanitize colors on the LIVE, fully-styled clone BEFORE
    // html2canvas runs. Doing it only in onclone is unreliable — the cloned
    // iframe's stylesheets may not be applied when onclone fires, so
    // getComputedStyle returns initial (non-oklch) values and the patch finds
    // nothing to fix; html2canvas then applies styles, reads oklch, and throws.
    // Inlining rgb here bakes it into the style attribute, which html2canvas
    // reads regardless of timing.
    inlineSanitizeColors(clone, window);

    return await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      logging: false,
      onclone: (doc, el) => {
        // Backstop: re-run inline sanitization, plus rewrite stylesheet rules /
        // custom-property vars for anything inline styles can't reach.
        inlineSanitizeColors(el, doc.defaultView ?? window);
        rewriteStylesheetColors(doc);
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
    const { jsPDF } = await import('jspdf');
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
