import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { MenuItem } from '../types';
import { containsAmharic } from './amharicTyping';
import { generateHighResMenuQR } from './qrCodeHelper';

export interface PDFGenerationOptions {
  fileName?: string;
  restaurantName?: string;
  phone?: string;
  address?: string;
  website?: string;
  email?: string;
  menuItems?: MenuItem[];
  onProgress?: (progress: number, message: string) => void;
}

/**
 * Preloads any image URL and converts it into a safe Base64 Data URL.
 * This guarantees html2canvas and jsPDF render images without CORS errors or canvas tainting.
 */
export async function preloadAndConvertToBase64(url: string): Promise<string> {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 140;
        canvas.height = img.naturalHeight || img.height || 140;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas export tainted for image:', url, err);
      }
      resolve(url);
    };
    img.onerror = () => {
      // Fallback: try fetching with cors mode
      fetch(url, { mode: 'cors' })
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        })
        .catch(() => resolve(url));
    };
    img.src = url;
  });
}

/**
 * Renders text to jsPDF safely.
 * Standard jsPDF default fonts (Helvetica/Times) lack Ethiopic/Ge'ez glyphs, which causes
 * Amharic letters to be replaced with corrupted characters (like ` - -).
 * When text contains Amharic, this function renders it using an in-memory high-res canvas
 * with browser native font shaping, and embeds the crisp text image into the PDF.
 */
function renderSafeText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number; // in pt
    fontStyle?: 'bold' | 'normal' | 'italic';
    textColor?: [number, number, number]; // RGB
    align?: 'left' | 'right' | 'center';
    maxWidth?: number;
  } = {}
) {
  if (!text) return;
  const {
    fontSize = 8,
    fontStyle = 'normal',
    textColor = [25, 25, 25],
    align = 'left',
    maxWidth,
  } = options;

  let displayText = text;
  if (maxWidth && displayText.length > 40) {
    displayText = displayText.slice(0, 38) + '...';
  }

  // If text contains Amharic, render via browser 2D canvas font engine for 100% correct glyphs!
  if (containsAmharic(displayText)) {
    try {
      const scale = 3; // 300 DPI high resolution
      const pxFontSize = Math.round(fontSize * 1.333 * scale);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      const fontStr = `${fontStyle === 'bold' ? 'bold' : 'normal'} ${pxFontSize}px "Inter", "Segoe UI", "Nyala", "Noto Sans Ethiopic", "Abyssinica SIL", sans-serif`;
      ctx.font = fontStr;
      const textMetrics = ctx.measureText(displayText);
      const textWidthPx = Math.ceil(textMetrics.width) + 12;
      const textHeightPx = Math.ceil(pxFontSize * 1.45);

      canvas.width = textWidthPx;
      canvas.height = textHeightPx;

      ctx.font = fontStr;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgb(${textColor[0]}, ${textColor[1]}, ${textColor[2]})`;
      ctx.fillText(displayText, 3, textHeightPx / 2);

      const dataUrl = canvas.toDataURL('image/png');
      const textWidthMm = (textWidthPx / (96 * scale)) * 25.4;
      const textHeightMm = (textHeightPx / (96 * scale)) * 25.4;

      let drawX = x;
      if (align === 'right') {
        drawX = x - textWidthMm;
      } else if (align === 'center') {
        drawX = x - textWidthMm / 2;
      }

      const drawY = y - textHeightMm * 0.72;
      pdf.addImage(dataUrl, 'PNG', drawX, drawY, textWidthMm, textHeightMm);
      return;
    } catch (err) {
      console.warn('Amharic canvas text render error, falling back:', err);
    }
  }

  // Standard Latin text via native vector font
  pdf.setFont('helvetica', fontStyle);
  pdf.setFontSize(fontSize);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(displayText, x, y, { align });
}

/**
 * Generates an ultra high-quality A4 PDF of the restaurant menu with all product photos embedded.
 * Uses html2canvas with pre-converted base64 images, and seamlessly falls back
 * to direct vector jsPDF rendering with embedded product photos and Amharic text support.
 */
export async function downloadMenuPDF(
  container: HTMLElement | string | null,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const {
    restaurantName = 'Cafe Lina Luxury Coffee & Restaurant',
    phone = '+251 900 123 456',
    address = 'Bole Road, Addis Ababa, Ethiopia',
    website = 'www.cafelina.com',
    email = 'info@cafelina.com',
    menuItems = [],
    onProgress,
  } = options;

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName =
    options.fileName ||
    `${restaurantName.replace(/[^a-zA-Z0-9]/g, '')}_Menu_${dateStr}.pdf`;

  onProgress?.(10, 'Initializing menu document and photos...');

  // Resolve target element by reference or container ID
  let targetElement: HTMLElement | null = null;
  if (typeof container === 'string') {
    targetElement = document.getElementById(container);
  } else if (container instanceof HTMLElement) {
    targetElement = container;
  }

  if (!targetElement) {
    targetElement =
      document.getElementById('cafelina-product-costing-canvas-container') ||
      document.getElementById('cafelina-product-costing-canvas-template') ||
      document.getElementById('cafelina-printable-menu-target') ||
      document.getElementById('cafelina-product-costing-print-target') ||
      document.getElementById('cafelina-preview-print-target') ||
      document.getElementById('cafelina-menu-print-target');
  }

  let mountedClone: HTMLElement | null = null;

  if (targetElement) {
    try {
      // If target element is hidden (e.g. display: none in print wrapper), clone it and mount visible offscreen
      let activeElement = targetElement;
      const isHidden =
        targetElement.offsetWidth === 0 ||
        targetElement.offsetHeight === 0 ||
        window.getComputedStyle(targetElement).display === 'none';

      if (isHidden) {
        mountedClone = targetElement.cloneNode(true) as HTMLElement;
        mountedClone.id = 'temp-pdf-export-clone';
        mountedClone.style.display = 'block';
        mountedClone.style.position = 'fixed';
        mountedClone.style.left = '-9999px';
        mountedClone.style.top = '0px';
        mountedClone.style.width = '794px';
        mountedClone.style.zIndex = '-9999';
        mountedClone.style.opacity = '1';
        mountedClone.style.visibility = 'visible';
        mountedClone.style.background = '#FFFDF9';
        document.body.appendChild(mountedClone);
        activeElement = mountedClone;
      }

      onProgress?.(20, 'Embedding high-resolution product photos into document...');

      // Convert all <img> tags inside activeElement to Base64 data URLs to prevent CORS issues
      const imgs = Array.from(activeElement.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          const src = img.getAttribute('src');
          if (src && !src.startsWith('data:')) {
            try {
              const b64 = await preloadAndConvertToBase64(src);
              if (b64 && b64.startsWith('data:')) {
                img.src = b64;
                img.removeAttribute('srcset');
              }
            } catch (err) {
              console.warn('Image convert warning:', src, err);
            }
          }
        })
      );

      // Give browser brief tick to finish painting base64 images
      await new Promise((r) => setTimeout(r, 120));

      const pageElements = Array.from(
        activeElement.querySelectorAll<HTMLElement>('[data-menu-page="true"]')
      );
      const targets = pageElements.length > 0 ? pageElements : [activeElement];

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      let renderedAtLeastOnePage = false;

      for (let i = 0; i < targets.length; i++) {
        const pageEl = targets[i];
        const progressPercent = Math.round(25 + ((i + 1) / targets.length) * 65);
        onProgress?.(
          progressPercent,
          `Rendering high-definition page ${i + 1} of ${targets.length} with photos...`
        );

        // Crucial: allowTaint MUST be false so toDataURL never throws SecurityError
        const canvas = await html2canvas(pageEl, {
          scale: 1.8,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#FFFDF9',
          onclone: (_clonedDoc, clonedEl) => {
            clonedEl.style.transform = 'none';
            clonedEl.style.opacity = '1';
            clonedEl.style.visibility = 'visible';
            clonedEl.style.display = 'block';
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.94);

        if (renderedAtLeastOnePage) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        renderedAtLeastOnePage = true;
      }

      if (renderedAtLeastOnePage) {
        onProgress?.(95, 'Saving your professional PDF with photos...');
        pdf.save(fileName);
        onProgress?.(100, 'Complete!');
        return;
      }
    } catch (htmlCanvasError) {
      console.warn('html2canvas pipeline failed, using direct vector PDF fallback with photos:', htmlCanvasError);
    } finally {
      if (mountedClone && document.body.contains(mountedClone)) {
        document.body.removeChild(mountedClone);
      }
    }
  }

  // =========================================================================
  // BULLETPROOF DIRECT VECTOR PDF GENERATOR (With embedded product photos & Amharic font support)
  // =========================================================================
  onProgress?.(50, 'Building professional printable menu PDF with photos & Amharic text...');
  await generateDirectVectorPDF(fileName, {
    restaurantName,
    phone,
    address,
    website,
    email,
    menuItems,
    onProgress,
  });
}

/**
 * Direct jsPDF Vector Generator:
 * Generates an elegant, publication-grade multi-page restaurant menu
 * with royal crest, category headers, prices, descriptions, embedded product photos,
 * and Amharic text rendered cleanly with browser font shaping.
 */
async function generateDirectVectorPDF(
  fileName: string,
  options: PDFGenerationOptions
): Promise<void> {
  const {
    restaurantName = 'Cafe Lina Luxury Coffee & Restaurant',
    phone = '+251 900 123 456',
    address = 'Bole Road, Addis Ababa, Ethiopia',
    website = 'www.cafelina.com',
    menuItems = [],
    onProgress,
  } = options;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Pre-load all menu item photos to Base64
  onProgress?.(60, 'Loading and embedding product photos into vector PDF...');
  const imageCache = new Map<string, string>();
  await Promise.all(
    menuItems.map(async (item) => {
      if (item.image && !imageCache.has(item.image)) {
        try {
          const b64 = await preloadAndConvertToBase64(item.image);
          if (b64 && b64.startsWith('data:')) {
            imageCache.set(item.image, b64);
          }
        } catch {
          // ignore
        }
      }
    })
  );

  // Generate Live High-Resolution QR Code pointing to live website by default
  let qrDataUrl = '';
  let liveDisplayUrl = website;
  try {
    const qrResult = await generateHighResMenuQR();
    qrDataUrl = qrResult.dataUrl;
    liveDisplayUrl = qrResult.displayUrl;
  } catch (qrErr) {
    console.warn('QR code generation failed, using fallback:', qrErr);
    try {
      const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://cafelina.com';
      qrDataUrl = await QRCode.toDataURL(`${origin}/?tab=menu`, {
        width: 300,
        margin: 1,
        color: { dark: '#1E1E1E', light: '#FFFFFF' },
      });
      liveDisplayUrl = origin.replace(/^https?:\/\//, '');
    } catch {
      // ignore
    }
  }

  // Helper to draw gold border frame & corner accents
  const drawPageBorder = (pageNumber: number, totalPagesCount: number) => {
    // Outer border
    pdf.setDrawColor(212, 175, 55); // Gold
    pdf.setLineWidth(0.6);
    pdf.rect(margin, margin, contentWidth, pageHeight - margin * 2);

    // Inner thin border
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.2);
    pdf.rect(margin + 2, margin + 2, contentWidth - 4, pageHeight - margin * 2 - 4);

    // Corner Ornaments
    const cornerSize = 5;
    pdf.setLineWidth(1.0);
    pdf.setDrawColor(107, 29, 29); // Burgundy

    // Top-left corner
    pdf.line(margin - 1, margin - 1, margin + cornerSize, margin - 1);
    pdf.line(margin - 1, margin - 1, margin - 1, margin + cornerSize);

    // Top-right corner
    pdf.line(pageWidth - margin + 1, margin - 1, pageWidth - margin - cornerSize, margin - 1);
    pdf.line(pageWidth - margin + 1, margin - 1, pageWidth - margin + 1, margin + cornerSize);

    // Bottom-left corner
    pdf.line(margin - 1, pageHeight - margin + 1, margin + cornerSize, pageHeight - margin + 1);
    pdf.line(margin - 1, pageHeight - margin + 1, margin - 1, pageHeight - margin - cornerSize);

    // Bottom-right corner
    pdf.line(pageWidth - margin + 1, pageHeight - margin + 1, pageWidth - margin - cornerSize, pageHeight - margin + 1);
    pdf.line(pageWidth - margin + 1, pageHeight - margin + 1, pageWidth - margin + 1, pageHeight - margin - cornerSize);

    // Bottom Running Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${restaurantName} • Official Restaurant Menu`, margin + 4, pageHeight - margin - 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(107, 29, 29);
    pdf.text(`Page ${pageNumber} of ${totalPagesCount}`, pageWidth - margin - 4, pageHeight - margin - 5, {
      align: 'right',
    });
  };

  // Group items by category
  const categoriesMap: { [cat: string]: MenuItem[] } = {};
  menuItems.forEach((item) => {
    const cat = item.category || 'Specialties';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(item);
  });

  const categoryNames = Object.keys(categoriesMap);
  const catsPerPage = Math.ceil(categoryNames.length / 2) || 1;
  const page1Cats = categoryNames.slice(0, catsPerPage);
  const page2Cats = categoryNames.slice(catsPerPage);
  const totalPages = page2Cats.length > 0 ? 2 : 1;

  // ==========================================
  // PAGE 1: Grand Header + Demo QR + Categories
  // ==========================================
  drawPageBorder(1, totalPages);

  // Royal Monogram Crest
  pdf.setDrawColor(212, 175, 55);
  pdf.setFillColor(255, 253, 249);
  pdf.circle(pageWidth / 2, margin + 10, 8, 'FD');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(107, 29, 29);
  pdf.text('CL', pageWidth / 2, margin + 11.5, { align: 'center' });

  // Subtitle
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(107, 29, 29);
  pdf.text('ARTISAN ROASTERY • FINE DINING • BAKERY', pageWidth / 2, margin + 22, { align: 'center' });

  // Main Restaurant Name
  pdf.setFont('times', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(26, 26, 26);
  pdf.text(restaurantName.toUpperCase(), pageWidth / 2, margin + 30, { align: 'center' });

  // Address & Phone Bar
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`${address}  •  ${phone}  •  VAT Inclusive`, pageWidth / 2, margin + 36, { align: 'center' });

  // Thin separator
  pdf.setDrawColor(212, 175, 55);
  pdf.setLineWidth(0.4);
  pdf.line(margin + 10, margin + 39, pageWidth - margin - 10, margin + 39);

  // DEMO QR CODE BOX (Hero Banner on Page 1)
  if (qrDataUrl) {
    const qrBoxY = margin + 41;
    pdf.setFillColor(252, 249, 242);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin + 4, qrBoxY, contentWidth - 8, 20, 2, 2, 'FD');

    // QR Image
    pdf.addImage(qrDataUrl, 'PNG', margin + 6, qrBoxY + 1.5, 17, 17);

    // QR Text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(107, 29, 29);
    pdf.text('LIVE QR CODE: SCAN FOR MOBILE MENU & ORDERING', margin + 27, qrBoxY + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(70, 70, 70);
    pdf.text('Point your smartphone camera to view live prices, ingredients, photos & order online.', margin + 27, qrBoxY + 10.5);
    pdf.setTextColor(107, 29, 29);
    pdf.text(`${liveDisplayUrl}/?tab=menu`, margin + 27, qrBoxY + 15);
  }

  // Draw Page 1 Categories
  let currentY = qrDataUrl ? margin + 65 : margin + 45;
  drawCategoriesSection(pdf, page1Cats, categoriesMap, currentY, margin, contentWidth, pageHeight, imageCache);

  // ==========================================
  // PAGE 2 (If items remain): Categories + Grand Footer
  // ==========================================
  if (page2Cats.length > 0) {
    pdf.addPage('a4', 'portrait');
    drawPageBorder(2, totalPages);

    // Mini Page 2 Header
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(107, 29, 29);
    pdf.text('CAFE LINA  |  Artisan Culinary Menu (Continued)', margin + 6, margin + 10);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.3);
    pdf.line(margin + 6, margin + 12, pageWidth - margin - 6, margin + 12);

    currentY = margin + 17;
    drawCategoriesSection(pdf, page2Cats, categoriesMap, currentY, margin, contentWidth, pageHeight - 34, imageCache);

    // Grand Thank You Footer with Secondary QR
    const footerY = pageHeight - margin - 30;
    pdf.setFillColor(252, 249, 242);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(margin + 4, footerY, contentWidth - 8, 23, 2, 2, 'FD');

    if (qrDataUrl) {
      pdf.addImage(qrDataUrl, 'PNG', pageWidth - margin - 24, footerY + 2, 19, 19);
    }

    pdf.setFont('times', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(107, 29, 29);
    pdf.text('THANK YOU FOR DINING WITH US AT CAFE LINA', margin + 8, footerY + 6);

    pdf.setFont('times', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    pdf.text('"Every cup tells a story of Ethiopian heritage. Every dish is crafted with devotion."', margin + 8, footerY + 10.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Phone: ${phone}  |  Address: ${address}`, margin + 8, footerY + 15);
    pdf.text(`Website: ${liveDisplayUrl}  |  Email: ${options.email || 'info@cafelina.com'}`, margin + 8, footerY + 19);
  }

  onProgress?.(95, 'Finalizing PDF download...');
  pdf.save(fileName);
  onProgress?.(100, 'Complete!');
}

/**
 * Helper to render categories and items with embedded photos in a 2-column layout
 */
function drawCategoriesSection(
  pdf: jsPDF,
  cats: string[],
  categoriesMap: { [cat: string]: MenuItem[] },
  startY: number,
  margin: number,
  contentWidth: number,
  maxY: number,
  imageCache: Map<string, string>
) {
  let y = startY;
  const colWidth = (contentWidth - 6) / 2;

  cats.forEach((catName) => {
    if (y > maxY - 25) return;

    const items = categoriesMap[catName] || [];
    if (items.length === 0) return;

    // Category Header (Amharic-safe!)
    renderSafeText(pdf, catName.toUpperCase(), margin + 4, y, {
      fontSize: 10.5,
      fontStyle: 'bold',
      textColor: [107, 29, 29],
    });

    pdf.setDrawColor(212, 175, 55); // Gold line
    pdf.setLineWidth(0.25);
    pdf.line(margin + 4, y + 1.5, margin + contentWidth - 4, y + 1.5);
    y += 5.5;

    // Render items in 2 columns
    for (let i = 0; i < items.length; i += 2) {
      if (y > maxY - 15) break;

      const item1 = items[i];
      const item2 = items[i + 1];

      // Col 1
      renderSingleItemWithPhoto(pdf, item1, margin + 4, y, colWidth - 4, imageCache);

      // Col 2
      if (item2) {
        renderSingleItemWithPhoto(pdf, item2, margin + 4 + colWidth + 2, y, colWidth - 4, imageCache);
      }

      y += 14; // Space for photo + name + price + description
    }

    y += 2.5;
  });
}

function renderSingleItemWithPhoto(
  pdf: jsPDF,
  item: MenuItem,
  x: number,
  y: number,
  width: number,
  imageCache: Map<string, string>
) {
  const photoSize = 12; // 12mm x 12mm
  const photoX = x;
  const photoY = y - 1;

  // 1. PRODUCT PHOTO EMBEDDING
  const base64Img = item.image ? imageCache.get(item.image) : null;
  if (base64Img) {
    try {
      pdf.setDrawColor(212, 175, 55); // Gold border
      pdf.setLineWidth(0.25);
      pdf.roundedRect(photoX, photoY, photoSize, photoSize, 1.2, 1.2, 'S');
      pdf.addImage(base64Img, 'JPEG', photoX + 0.2, photoY + 0.2, photoSize - 0.4, photoSize - 0.4);
    } catch {
      drawLuxuryPlaceholder(pdf, photoX, photoY, photoSize);
    }
  } else {
    drawLuxuryPlaceholder(pdf, photoX, photoY, photoSize);
  }

  const textX = x + photoSize + 2.5;
  const textWidth = width - photoSize - 2.5;

  // 2. ITEM NAME (Amharic-safe!)
  renderSafeText(pdf, item.name, textX, y + 2, {
    fontSize: 8.2,
    fontStyle: 'bold',
    textColor: [25, 25, 25],
    maxWidth: textWidth - 18,
  });

  // 3. PRICE
  const priceStr = `${item.price} ${item.currency || 'ETB'}`;
  renderSafeText(pdf, priceStr, x + width, y + 2, {
    fontSize: 8.2,
    fontStyle: 'bold',
    textColor: [107, 29, 29],
    align: 'right',
  });

  // 4. DESCRIPTION
  const desc = item.description || (item.ingredients ? item.ingredients.slice(0, 3).join(', ') : '');
  if (desc) {
    renderSafeText(pdf, desc, textX, y + 5.8, {
      fontSize: 6.8,
      fontStyle: 'normal',
      textColor: [100, 100, 100],
      maxWidth: textWidth,
    });
  }

  // 5. INGREDIENTS OR AMHARIC NAME (Amharic-safe!)
  if (item.nameAmharic && !item.name.includes(item.nameAmharic)) {
    renderSafeText(pdf, item.nameAmharic, textX, y + 9.5, {
      fontSize: 6.8,
      fontStyle: 'bold',
      textColor: [107, 29, 29],
      maxWidth: textWidth,
    });
  } else if (item.ingredients && item.ingredients.length > 0) {
    const ingText = item.ingredients.slice(0, 3).join(', ');
    renderSafeText(pdf, ingText, textX, y + 9.5, {
      fontSize: 6.2,
      fontStyle: 'normal',
      textColor: [125, 125, 125],
      maxWidth: textWidth,
    });
  }
}

function drawLuxuryPlaceholder(pdf: jsPDF, x: number, y: number, size: number) {
  pdf.setDrawColor(212, 175, 55);
  pdf.setFillColor(252, 249, 242);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(x, y, size, size, 1.2, 1.2, 'FD');

  const centerX = x + size / 2;
  const centerY = y + size / 2;
  pdf.setDrawColor(107, 29, 29);
  pdf.setLineWidth(0.2);
  pdf.circle(centerX, centerY, size * 0.38, 'S');

  pdf.setFont('times', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(107, 29, 29);
  pdf.text('CL', centerX, centerY + 1.1, { align: 'center' });
}
