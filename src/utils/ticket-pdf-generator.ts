import jsPDF from "jspdf";
import QRCode from "qrcode";
import { APP_LOGO } from "@/constants/app-assets";

export interface TicketPdfData {
  id: string;
  guestName: string;
  guestEmail: string;
  ticketName: string;
  amount: number;
  paymentStatus?: string;
  eventTitle?: string;
  eventStart?: string;
  eventEnd?: string;
  venueAddress?: string;
}

const BRAND_ORANGE: [number, number, number] = [240, 119, 18];
const PRIMARY_DARK: [number, number, number] = [15, 23, 42];
const TEXT_GRAY: [number, number, number] = [100, 116, 139];
const BORDER_GRAY: [number, number, number] = [226, 232, 240];
const SURFACE_GRAY: [number, number, number] = [248, 250, 252];
const ALT_ROW: [number, number, number] = [245, 247, 250];
const GREEN: [number, number, number] = [22, 163, 74];
const GREEN_BG: [number, number, number] = [220, 252, 231];
const AMBER: [number, number, number] = [161, 84, 10];
const AMBER_BG: [number, number, number] = [254, 243, 199];

const toStatusMeta = (status?: string) => {
  if (String(status || "").toLowerCase() === "paid")
    return { label: "Payment: Paid", fg: GREEN, bg: GREEN_BG };
  return { label: "Payment: Pending", fg: AMBER, bg: AMBER_BG };
};

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

const generateQRDataUrl = (text: string): Promise<string> =>
  QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: "#0F172A", light: "#FFFFFF" },
  });

const formatDateTime = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const safeText = (value?: string) => value?.trim() || "N/A";

export const generateTicketPDF = async (ticket: TicketPdfData) => {
  // ── Layout constants ───────────────────────────────────────────────
  const PAGE_W   = 210;
  const margin   = 13;
  const cardX    = margin;
  const cardY    = 55;
  const cardW    = PAGE_W - margin * 2;
  const leftBarW = 6;
  const innerX   = cardX + leftBarW + 6;  // content left edge
  const innerR   = cardX + cardW - 6;     // content right edge
  const labelColW = 26;                    // fixed label column width
  const valueX   = innerX + labelColW;    // fixed value start
  const valueMaxW = innerR - valueX - 2;
  const rowInnerW = innerR - innerX;
  const amountBoxH = 22;
  const stubH     = 0;
  const footerArea = 24; // gap below card bottom for footer

  const rows = [
    { label: "Name",   value: safeText(ticket.guestName) },
    { label: "Email",  value: safeText(ticket.guestEmail) },
    { label: "Event",  value: safeText(ticket.eventTitle) },
    { label: "Ticket", value: safeText(ticket.ticketName) },
    { label: "Starts", value: formatDateTime(ticket.eventStart) },
    { label: "Ends",   value: formatDateTime(ticket.eventEnd) },
    { label: "Venue",  value: safeText(ticket.venueAddress) },
  ];

  // ── Pre-measure text to compute card height ────────────────────────
  const m = new jsPDF({ unit: "mm", format: [PAGE_W, 400] });
  m.setFontSize(9.5);
  let totalRowH = 0;
  for (const row of rows) {
    const lines = m.splitTextToSize(row.value, valueMaxW);
    totalRowH += Math.max(8, lines.length * 5.5 + 4);
  }
  //   9  = top padding inside card
  //  10  = "EVENT TICKET" header block
  //  10  = ATTENDEE section header
  //   2  = gap after rows
  //   6  = dashed separator
  //   7  = gap after amount box
  //   4  = bottom padding
  const cardH = 9 + 10 + 10 + totalRowH + 2 + 6 + amountBoxH + 7 + stubH + 4;
  const PAGE_H = cardY + cardH + footerArea;

  // ── Create real doc with correct page height ───────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [PAGE_W, PAGE_H] });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load assets
  let logoImg: HTMLImageElement | null = null;
  try { logoImg = await loadImage(APP_LOGO.url); } catch { logoImg = null; }

  const safeId = (ticket.id || "").slice(0, 8).toUpperCase() || "TICKET";
  let qrDataUrl: string | null = null;
  const qrUrl = `${window.location.origin}/guest-ticket-payment/${ticket.id || safeId}`;
  try { qrDataUrl = await generateQRDataUrl(qrUrl); } catch { qrDataUrl = null; }

  // ── HEADER ─────────────────────────────────────────────────────────
  doc.setFillColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
  doc.rect(0, 0, pageWidth, 47, "F");

  if (logoImg) {
    const logoW = 38;
    const logoH = (logoImg.height / logoImg.width) * logoW;
    doc.addImage(logoImg, "PNG", margin, 8, logoW, logoH);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("CATER DIRECTLY", margin, 20);
  }

  // QR code — header, right-aligned
  const qrSize = 20;
  const qrX = pageWidth - margin - qrSize;
  const qrY = 10;
  if (qrDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "F");
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
  }

  // Orange stripe
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.rect(0, 42, pageWidth, 5, "F");

  // ── CARD ───────────────────────────────────────────────────────────
  // White background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "F");
  // Orange left bar
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.roundedRect(cardX, cardY, leftBarW, cardH, 4, 4, "F");
  doc.rect(cardX + 3, cardY, leftBarW - 3, cardH, "F");
  // Card border
  doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "S");

  // ── "EVENT TICKET" header row ──────────────────────────────────────
  let curY = cardY + 9;
  const statusMeta = toStatusMeta(ticket.paymentStatus);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text("EVENT TICKET", innerX, curY);

  // Payment status badge — card top-right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const badgePadX = 4;
  const badgeH    = 7;
  const badgeW    = doc.getTextWidth(statusMeta.label) + badgePadX * 2;
  const badgeX    = innerR - badgeW;
  const badgeY    = curY - 5;
  doc.setFillColor(statusMeta.bg[0], statusMeta.bg[1], statusMeta.bg[2]);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
  doc.setTextColor(statusMeta.fg[0], statusMeta.fg[1], statusMeta.fg[2]);
  doc.text(statusMeta.label, badgeX + badgePadX, badgeY + 4.8);

  curY += 4;
  doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
  doc.setLineWidth(0.3);
  doc.line(innerX, curY, innerR, curY);
  curY += 5;

  // ── ATTENDEE section header ───────────────────────────────────────
  doc.setFillColor(SURFACE_GRAY[0], SURFACE_GRAY[1], SURFACE_GRAY[2]);
  doc.roundedRect(innerX, curY, rowInnerW, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text("ATTENDEE", innerX + 3, curY + 4.8);
  curY += 10;

  // ── Rows ──────────────────────────────────────────────────────────
  rows.forEach((row, i) => {
    doc.setFontSize(9.5);
    const lines  = doc.splitTextToSize(row.value, valueMaxW);
    const rH     = Math.max(8, lines.length * 5.5 + 4);
    const rowTop = curY;                 // top of background rect
    const textY  = rowTop + rH / 2 + 1.5; // baseline centered in row

    if (i % 2 !== 0) {
      doc.setFillColor(ALT_ROW[0], ALT_ROW[1], ALT_ROW[2]);
      doc.rect(innerX, rowTop, rowInnerW, rH, "F");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(row.label, innerX + 2, textY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    doc.text(lines, valueX, textY);

    curY += rH;
  });

  // ── Dashed separator ──────────────────────────────────────────────
  doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
  doc.setLineDashPattern([2, 2], 0);
  doc.setLineWidth(0.35);
  doc.line(innerX, curY, innerR, curY);
  doc.setLineDashPattern([], 0);
  curY += 5;

  // ── Amount box ────────────────────────────────────────────────────
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(innerX, curY, rowInnerW, amountBoxH, 3, 3, "F");
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.4);
  doc.roundedRect(innerX, curY, rowInnerW, amountBoxH, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(29, 78, 216);
  const amountLabel = String(ticket.paymentStatus || "").toLowerCase() === "paid" ? "Total Paid" : "Total Due";
  doc.text(amountLabel, innerX + 6, curY + 13.5);

  doc.setFontSize(20);
  doc.text(formatAmount(ticket.amount), innerR - 4, curY + 13.5, { align: "right" });
  curY += amountBoxH + 7;

  // ── FOOTER — always outside the card ──────────────────────────────
  const footerY = pageHeight - 8;
  doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text("Thank you for choosing Cater Directly.", margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
  doc.text("Cater Directly - Premium Catering Services", pageWidth - margin, footerY, {
    align: "right",
  });

  doc.save(`Ticket-${safeId}.pdf`);
};
