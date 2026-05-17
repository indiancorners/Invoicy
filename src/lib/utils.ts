import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tailwind v4 encodes palette colors as oklch() which html2canvas can't parse.
// Canvas 2D fillStyle accepts oklch and normalises it to #rrggbb on read-back.
const _cc = document.createElement('canvas');
_cc.width = _cc.height = 1;
const _ctx = _cc.getContext('2d')!;
function toRgb(v: string): string {
  try {
    _ctx.fillStyle = '#000';
    _ctx.fillStyle = v;
    return _ctx.fillStyle; // returns #rrggbb
  } catch {
    return v;
  }
}

const COLOR_PROPS = [
  'color', 'background-color',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'outline-color', 'text-decoration-color', 'caret-color',
];

function patchOklch(doc: Document, root: HTMLElement) {
  const win = doc.defaultView ?? window;
  [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].forEach(el => {
    if (!el.style) return;
    const cs = win.getComputedStyle(el);
    COLOR_PROPS.forEach(p => {
      const v = cs.getPropertyValue(p);
      if (v && v.includes('oklch')) el.style.setProperty(p, toRgb(v));
    });
    // Gradients with oklch — strip them (html2canvas has limited gradient support)
    const bgImg = cs.getPropertyValue('background-image');
    if (bgImg && bgImg.includes('oklch')) el.style.setProperty('background-image', 'none');
  });
}

function patchMisc(root: HTMLElement) {
  root.querySelectorAll('[class*="mix-blend"]').forEach(n =>
    (n as HTMLElement).style.setProperty('mix-blend-mode', 'normal'));
  root.querySelectorAll('[class*="grayscale"]').forEach(n =>
    (n as HTMLElement).style.setProperty('filter', 'none'));
  root.querySelectorAll('[class*="rotate"]').forEach(n =>
    (n as HTMLElement).style.setProperty('transform', 'none'));
}

function makeShadowContainer(): HTMLDivElement {
  const div = document.createElement('div');
  // Fixed at (0,0) — browser guarantees rasterisation. z-index -1 keeps it
  // behind the export overlay (z-200) so the user never sees it.
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
  clone.style.height = '1123px';
  clone.style.overflow = 'visible';
  clone.style.margin = '0';
  clone.style.padding = '0';
  return clone;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found — invoice preview may not be mounted`);

  const shadowContainer = makeShadowContainer();
  const clone = prepareClone(element);
  shadowContainer.appendChild(clone);

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 350));

    const canvas = await html2canvas(clone, {
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

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (shadowContainer.parentNode) document.body.removeChild(shadowContainer);
  }
}

// ─── PNG ─────────────────────────────────────────────────────────────────────

export async function exportToPNG(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found — invoice preview may not be mounted`);

  const shadowContainer = makeShadowContainer();
  const clone = prepareClone(element);
  shadowContainer.appendChild(clone);

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 350));

    const canvas = await html2canvas(clone, {
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

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  } finally {
    if (shadowContainer.parentNode) document.body.removeChild(shadowContainer);
  }
}
