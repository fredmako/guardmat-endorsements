import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { ORG_NAME, CAMPAIGN_NAME, ENDORSEMENT_ID_PREFIX } from './constants';

interface EndorsementData {
  endorsementId: string;
  schoolName: string;
  parentName: string;
  message: string | null;
  verified: boolean;
  createdAt: string;
  verifiedAt: string | null;
}

// Brand colors
const GREEN = rgb(0.13, 0.55, 0.27);    // #228B45
const DARK_GREEN = rgb(0.08, 0.35, 0.16);
const AMBER = rgb(0.95, 0.68, 0.0);     // #F5AE00
const DARK = rgb(0.15, 0.15, 0.15);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_GRAY = rgb(0.95, 0.95, 0.95);
const WHITE = rgb(1, 1, 1);

export async function generateEndorsementPDF(data: EndorsementData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const { width, height } = page.getSize();
  const margin = 50;
  const contentWidth = width - margin * 2;

  // Fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // === HEADER BAND ===
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: GREEN,
  });

  // Accent line
  page.drawRectangle({
    x: 0,
    y: height - 125,
    width: width,
    height: 5,
    color: AMBER,
  });

  // Organization name
  page.drawText(ORG_NAME, {
    x: margin,
    y: height - 55,
    size: 11,
    font: helvetica,
    color: WHITE,
  });

  // Campaign name
  page.drawText(CAMPAIGN_NAME, {
    x: margin,
    y: height - 75,
    size: 16,
    font: helveticaBold,
    color: WHITE,
  });

  // Certificate label (right side)
  page.drawText('CERTIFICATE OF ENDORSEMENT', {
    x: width - margin - 200,
    y: height - 55,
    size: 10,
    font: helvetica,
    color: WHITE,
  });

  page.drawText(new Date(data.createdAt).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), {
    x: width - margin - 200,
    y: height - 72,
    size: 9,
    font: helvetica,
    color: WHITE,
  });

  // === TITLE ===
  let y = height - 170;

  page.drawText('Certificate of Endorsement', {
    x: margin,
    y: y,
    size: 28,
    font: timesRomanBold,
    color: DARK_GREEN,
  });

  y -= 20;

  page.drawText('This certifies that', {
    x: margin,
    y: y,
    size: 12,
    font: helvetica,
    color: GRAY,
  });

  y -= 35;

  // === ENDORSER NAME ===
  page.drawText(data.parentName, {
    x: margin,
    y: y,
    size: 24,
    font: timesRomanBold,
    color: DARK,
  });

  y -= 20;

  page.drawText('has endorsed the', {
    x: margin,
    y: y,
    size: 12,
    font: helvetica,
    color: GRAY,
  });

  y -= 30;

  // === SCHOOL NAME ===
  page.drawText(data.schoolName, {
    x: margin,
    y: y,
    size: 20,
    font: timesRomanBold,
    color: GREEN,
  });

  y -= 25;

  page.drawText('as part of the Guardmat Community School Feeding Initiative, demonstrating', {
    x: margin,
    y: y,
    size: 11,
    font: helvetica,
    color: GRAY,
  });

  y -= 18;

  page.drawText('commitment to supporting school feeding programs for primary school pupils in Kisii County.', {
    x: margin,
    y: y,
    size: 11,
    font: helvetica,
    color: GRAY,
  });

  // === MESSAGE (if present) ===
  if (data.message) {
    y -= 35;

    // Quote box
    page.drawRectangle({
      x: margin,
      y: y - 50,
      width: contentWidth,
      height: 55,
      color: LIGHT_GRAY,
      borderColor: GREEN,
      borderWidth: 1,
    });

    page.drawText(`"${data.message}"`, {
      x: margin + 15,
      y: y - 15,
      size: 11,
      font: timesRoman,
      color: DARK,
      maxWidth: contentWidth - 30,
      lineHeight: 16,
    });

    y -= 70;
  }

  // === ENDORSEMENT ID BOX ===
  y -= 20;

  page.drawRectangle({
    x: margin,
    y: y - 45,
    width: contentWidth,
    height: 50,
    color: LIGHT_GRAY,
    borderColor: GREEN,
    borderWidth: 1.5,
  });

  page.drawText('Endorsement ID:', {
    x: margin + 15,
    y: y - 15,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  page.drawText(data.endorsementId, {
    x: margin + 15,
    y: y - 32,
    size: 14,
    font: helveticaBold,
    color: DARK_GREEN,
  });

  // Verification status
  const statusText = data.verified ? 'VERIFIED' : 'PENDING';
  const statusColor = data.verified ? GREEN : AMBER;

  page.drawText(statusText, {
    x: width - margin - 80,
    y: y - 25,
    size: 12,
    font: helveticaBold,
    color: statusColor,
  });

  // === DETAILS TABLE ===
  y -= 80;

  const details = [
    { label: 'Endorsement ID', value: data.endorsementId },
    { label: 'School', value: data.schoolName },
    { label: 'Endorsed By', value: data.parentName },
    { label: 'Date', value: new Date(data.createdAt).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })},
    { label: 'Status', value: data.verified ? 'Verified' : 'Pending' },
  ];

  if (data.verifiedAt) {
    details.push({
      label: 'Verified On',
      value: new Date(data.verifiedAt).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    });
  }

  for (const detail of details) {
    // Label
    page.drawText(detail.label + ':', {
      x: margin,
      y: y,
      size: 10,
      font: helvetica,
      color: GRAY,
    });

    // Value
    page.drawText(detail.value, {
      x: margin + 120,
      y: y,
      size: 11,
      font: helveticaBold,
      color: DARK,
    });

    // Separator line
    page.drawLine({
      start: { x: margin, y: y - 8 },
      end: { x: width - margin, y: y - 8 },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });

    y -= 25;
  }

  // === VERIFICATION SECTION ===
  y -= 20;

  page.drawRectangle({
    x: margin,
    y: y - 60,
    width: contentWidth,
    height: 65,
    color: LIGHT_GRAY,
  });

  page.drawText('How to Verify', {
    x: margin + 15,
    y: y - 15,
    size: 11,
    font: helveticaBold,
    color: DARK_GREEN,
  });

  page.drawText('Visit guardmat-endorsements.vercel.app/verify', {
    x: margin + 15,
    y: y - 32,
    size: 10,
    font: helvetica,
    color: DARK,
  });

  page.drawText(`and enter the Endorsement ID: ${data.endorsementId}`, {
    x: margin + 15,
    y: y - 47,
    size: 10,
    font: helvetica,
    color: GRAY,
  });

  // === FOOTER ===
  const footerY = 60;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: 40,
    color: GREEN,
  });

  page.drawText(ORG_NAME, {
    x: margin,
    y: 22,
    size: 9,
    font: helvetica,
    color: WHITE,
  });

  page.drawText('Kisii County, Kenya', {
    x: margin,
    y: 10,
    size: 8,
    font: helvetica,
    color: WHITE,
  });

  // Footer right
  page.drawText('guardmat-endorsements.vercel.app', {
    x: width - margin - 180,
    y: 22,
    size: 9,
    font: helvetica,
    color: WHITE,
  });

  page.drawText(new Date().toLocaleDateString('en-KE'), {
    x: width - margin - 180,
    y: 10,
    size: 8,
    font: helvetica,
    color: WHITE,
  });

  // === DISCLAIMER ===
  page.drawText(
    'This certificate represents community endorsement and support for the school feeding initiative.',
    {
      x: margin,
      y: 55,
      size: 8,
      font: helvetica,
      color: GRAY,
    }
  );

  page.drawText(
    'It does not constitute an official school approval or government endorsement.',
    {
      x: margin,
      y: 45,
      size: 8,
      font: helvetica,
      color: GRAY,
    }
  );

  return pdfDoc.save();
}

export async function generateBulkEndorsePDF(endorsements: EndorsementData[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = { width: 595.28, height: 841.89 };
  const margin = 50;

  // Title page
  const titlePage = pdfDoc.addPage([width, height]);
  const titleHeight = titlePage.getSize().height;

  titlePage.drawRectangle({
    x: 0,
    y: titleHeight - 200,
    width: width,
    height: 200,
    color: GREEN,
  });

  titlePage.drawRectangle({
    x: 0,
    y: titleHeight - 205,
    width: width,
    height: 5,
    color: AMBER,
  });

  titlePage.drawText(ORG_NAME, {
    x: margin,
    y: titleHeight - 80,
    size: 14,
    font: helveticaBold,
    color: WHITE,
  });

  titlePage.drawText('Endorsement Report', {
    x: margin,
    y: titleHeight - 120,
    size: 32,
    font: helveticaBold,
    color: WHITE,
  });

  titlePage.drawText(CAMPAIGN_NAME, {
    x: margin,
    y: titleHeight - 160,
    size: 14,
    font: helvetica,
    color: WHITE,
  });

  titlePage.drawText(`Generated: ${new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`, {
    x: margin,
    y: titleHeight - 240,
    size: 12,
    font: helvetica,
    color: DARK,
  });

  titlePage.drawText(`Total Endorsements: ${endorsements.length}`, {
    x: margin,
    y: titleHeight - 265,
    size: 12,
    font: helvetica,
    color: DARK,
  });

  // Summary stats
  const verified = endorsements.filter(e => e.verified).length;
  const pending = endorsements.length - verified;
  const schools = new Set(endorsements.map(e => e.schoolName)).size;

  titlePage.drawText(`Verified: ${verified}  |  Pending: ${pending}  |  Schools: ${schools}`, {
    x: margin,
    y: titleHeight - 290,
    size: 11,
    font: helvetica,
    color: GRAY,
  });

  // Individual endorsement pages
  for (const data of endorsements) {
    const page = pdfDoc.addPage([width, height]);
    const pageHeight = page.getSize().height;

    // Header
    page.drawRectangle({
      x: 0,
      y: pageHeight - 80,
      width: width,
      height: 80,
      color: GREEN,
    });

    page.drawRectangle({
      x: 0,
      y: pageHeight - 83,
      width: width,
      height: 3,
      color: AMBER,
    });

    page.drawText(ORG_NAME, {
      x: margin,
      y: pageHeight - 35,
      size: 9,
      font: helvetica,
      color: WHITE,
    });

    page.drawText('Certificate of Endorsement', {
      x: margin,
      y: pageHeight - 55,
      size: 14,
      font: helveticaBold,
      color: WHITE,
    });

    page.drawText(data.endorsementId, {
      x: width - margin - 150,
      y: pageHeight - 35,
      size: 9,
      font: helvetica,
      color: WHITE,
    });

    // Content
    let y = pageHeight - 120;

    page.drawText(data.parentName, {
      x: margin,
      y: y,
      size: 20,
      font: helveticaBold,
      color: DARK,
    });

    y -= 25;

    page.drawText('has endorsed', {
      x: margin,
      y: y,
      size: 11,
      font: helvetica,
      color: GRAY,
    });

    y -= 25;

    page.drawText(data.schoolName, {
      x: margin,
      y: y,
      size: 16,
      font: helveticaBold,
      color: GREEN,
    });

    y -= 30;

    page.drawText(`Date: ${new Date(data.createdAt).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`, {
      x: margin,
      y: y,
      size: 10,
      font: helvetica,
      color: DARK,
    });

    y -= 20;

    page.drawText(`Status: ${data.verified ? 'Verified' : 'Pending'}`, {
      x: margin,
      y: y,
      size: 10,
      font: helvetica,
      color: data.verified ? GREEN : AMBER,
    });

    if (data.message) {
      y -= 30;
      page.drawText(`"${data.message}"`, {
        x: margin,
        y: y,
        size: 10,
        font: helvetica,
        color: GRAY,
        maxWidth: width - margin * 2,
      });
    }

    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: GREEN,
    });

    page.drawText('guardmat-endorsements.vercel.app', {
      x: margin,
      y: 12,
      size: 8,
      font: helvetica,
      color: WHITE,
    });
  }

  return pdfDoc.save();
}
