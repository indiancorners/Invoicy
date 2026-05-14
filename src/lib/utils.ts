import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function exportToPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const shadowContainer = document.createElement('div');
  shadowContainer.style.position = 'absolute';
  shadowContainer.style.left = '-9999px';
  shadowContainer.style.top = '0';
  shadowContainer.style.width = '794px';
  shadowContainer.style.backgroundColor = '#ffffff';
  shadowContainer.style.fontSize = '16px'; // Prevent Tailwind rem classes from scaling relative to unexpected root sizes
  document.body.appendChild(shadowContainer);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.boxShadow = 'none';
  clone.style.width = '794px';
  clone.style.margin = '0';
  clone.style.padding = '0';
  shadowContainer.appendChild(clone);

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('[class*="mix-blend"]').forEach(el => {
          (el as HTMLElement).style.mixBlendMode = 'normal';
        });
        clonedDoc.querySelectorAll('[class*="grayscale"]').forEach(el => {
          (el as HTMLElement).style.filter = 'none';
        });
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    if (shadowContainer.parentNode) {
      document.body.removeChild(shadowContainer);
    }
  }
}

export async function exportToPNG(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const shadowContainer = document.createElement('div');
  shadowContainer.style.position = 'absolute';
  shadowContainer.style.left = '-9999px';
  shadowContainer.style.top = '0';
  shadowContainer.style.width = '794px';
  shadowContainer.style.backgroundColor = '#ffffff';
  shadowContainer.style.fontSize = '16px'; // Lock base rem size
  document.body.appendChild(shadowContainer);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.boxShadow = 'none';
  clone.style.width = '794px';
  clone.style.margin = '0';
  clone.style.padding = '0';
  shadowContainer.appendChild(clone);

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('[class*="mix-blend"]').forEach(el => {
          (el as HTMLElement).style.mixBlendMode = 'normal';
        });
        clonedDoc.querySelectorAll('[class*="grayscale"]').forEach(el => {
          (el as HTMLElement).style.filter = 'none';
        });
      }
    });

    await new Promise<void>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Blob generation failed'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png', 1.0);
    });

  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  } finally {
    if (shadowContainer.parentNode) {
      document.body.removeChild(shadowContainer);
    }
  }
}
