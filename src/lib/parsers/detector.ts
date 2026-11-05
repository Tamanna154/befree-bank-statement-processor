import { PDFTypeDetectionResult } from '../types';

export function analyzePDFContent(text: string, pageCount: number = 1): PDFTypeDetectionResult {
  const trimmed = text.trim();
  const totalChars = trimmed.length;
  const charsPerPage = totalChars / Math.max(pageCount, 1);

  // If text density is very low or almost empty, it's an image/scanned PDF
  const isImageBased = charsPerPage < 65 || totalChars < 80;

  if (isImageBased) {
    return {
      type: 'IMAGE_BASED_SCANNED',
      confidence: totalChars === 0 ? 0.99 : 0.92,
      extractedTextLength: totalChars,
      pageCount,
      hasRasterImages: true,
      ocrRequired: true,
      details: totalChars === 0
        ? `No digital text stream found across ${pageCount} page(s). Detected scanned image layer; OCR pipeline engaged.`
        : `Extremely low text density (${Math.round(charsPerPage)} chars/page). Scanned document artifacts detected; OCR pipeline engaged.`
    };
  }

  return {
    type: 'TEXT_BASED',
    confidence: Math.min(0.95 + (totalChars / 5000) * 0.04, 0.99),
    extractedTextLength: totalChars,
    pageCount,
    hasRasterImages: false,
    ocrRequired: false,
    details: `High digital text density (${Math.round(charsPerPage)} chars/page) across ${pageCount} page(s). Direct digital text stream extraction pipeline used.`
  };
}
