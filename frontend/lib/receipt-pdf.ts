import type { ReceiptData } from "@/types";
import { jsPDF } from "jspdf";

const PRIMARY: [number, number, number] = [124, 58, 237];
const MUTED: [number, number, number] = [107, 114, 128];
const TEXT: [number, number, number] = [17, 24, 39];

const STATUS_COLOR: Record<string, [number, number, number]> = {
  succeeded: [5, 150, 105],
  pending: [217, 119, 6],
  failed: [220, 38, 38],
  canceled: [107, 114, 128],
  expired: [107, 114, 128],
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export const generateReceiptPdf = (data: ReceiptData): Blob => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const left = 50;
  const right = pageWidth - 50;

  // Header — brand block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...PRIMARY);
  doc.text(data.platform.name, left, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Learning Management System", left, 88);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...TEXT);
  doc.text("Payment Receipt", right, 70, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Issued ${formatDate(new Date())}`, right, 88, { align: "right" });

  doc.setDrawColor(229, 231, 235);
  doc.line(left, 110, right, 110);

  let y = 140;

  const section = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT);
    doc.text(title, left, y);
    doc.setDrawColor(229, 231, 235);
    doc.line(left, y + 4, right, y + 4);
    y += 22;
  };

  const row = (
    label: string,
    value: string,
    color: [number, number, number] = TEXT,
  ) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(label, left, y);
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(value, left + 150, y);
    y += 20;
  };

  section("Billed To");
  row("Name", data.user.name);
  row("Email", data.user.email);

  y += 6;
  section("Course");
  row("Course Name", data.course.title);
  row("Instructor", data.instructor.name);

  y += 6;
  section("Transaction");
  row("Transaction ID", data.transactionId || "—");
  row("Amount", formatMoney(data.amount, data.currency));
  row("Payment Date", formatDate(data.paidAt));
  row("Status", data.status.toUpperCase(), STATUS_COLOR[data.status] || TEXT);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 50;
  doc.setDrawColor(229, 231, 235);
  doc.line(left, footerY, right, footerY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `This is an electronically generated receipt from ${data.platform.name}.`,
    pageWidth / 2,
    footerY + 16,
    { align: "center" },
  );

  return doc.output("blob");
};

export const downloadReceipt = (data: ReceiptData, filename?: string) => {
  const blob = generateReceiptPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `receipt-${data.transactionId || "payment"}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
