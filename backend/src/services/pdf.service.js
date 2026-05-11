import PDFDocument from 'pdfkit';

const BRAND = 'EDUCART';
const PRIMARY = '#1d4ed8';
const MUTED = '#6b7280';
const TEXT = '#111827';

const STATUS_COLOR = {
  succeeded: '#059669',
  pending: '#d97706',
  failed: '#dc2626',
  canceled: '#6b7280',
  expired: '#6b7280',
};

const formatMoney = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const drawRow = (doc, label, value, options = {}) => {
  const y = doc.y;
  doc.fillColor(MUTED).fontSize(10).text(label, 50, y, { width: 150 });
  doc.fillColor(options.color || TEXT).fontSize(11).text(value, 200, y, { width: 350 });
  doc.moveDown(0.6);
};

const drawSectionTitle = (doc, title) => {
  doc.moveDown(0.5);
  doc.fillColor(TEXT).fontSize(12).font('Helvetica-Bold').text(title, 50);
  doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica');
};

/**
 * Builds a payment receipt PDF and pipes it to the provided writable stream.
 * Returns the PDFDocument so the caller can attach error handlers if needed.
 */
export const buildReceiptPdf = ({ payment, user, course, instructor }, stream) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(stream);

  // Header — swap this block for `doc.image(path, ...)` once a PNG logo is available
  doc.fillColor(PRIMARY).fontSize(28).font('Helvetica-Bold').text(BRAND, 50, 50);
  doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('Learning Management System', 50, 82);

  doc
    .fillColor(TEXT)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Payment Receipt', 50, 120, { align: 'right' });
  doc
    .fillColor(MUTED)
    .fontSize(10)
    .font('Helvetica')
    .text(`Receipt #${payment._id}`, 50, 148, { align: 'right' });

  doc.moveTo(50, 175).lineTo(545, 175).strokeColor('#e5e7eb').stroke();
  doc.y = 190;

  drawSectionTitle(doc, 'Billed To');
  drawRow(doc, 'Name', user.name);
  drawRow(doc, 'Email', user.email);

  drawSectionTitle(doc, 'Course');
  drawRow(doc, 'Course Name', course.title);
  drawRow(doc, 'Instructor', instructor?.name || '—');

  drawSectionTitle(doc, 'Transaction');
  drawRow(doc, 'Transaction ID', payment.transactionId || payment.stripePaymentIntentId || '—');
  drawRow(doc, 'Amount', formatMoney(payment.amount, payment.currency));
  drawRow(doc, 'Payment Date', formatDate(payment.paidAt || payment.createdAt));
  drawRow(doc, 'Status', payment.status.toUpperCase(), {
    color: STATUS_COLOR[payment.status] || TEXT,
  });

  const footerY = 760;
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#e5e7eb').stroke();
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .text(
      `Generated on ${formatDate(new Date())} · This is an electronically generated receipt.`,
      50,
      footerY + 8,
      { align: 'center', width: 495 }
    );

  doc.end();
  return doc;
};
