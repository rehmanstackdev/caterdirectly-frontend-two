import jsPDF from "jspdf";
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

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

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

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const toStatusLabel = (status?: string) => {
  if (!status) return "PENDING";
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "PAID";
  if (normalized === "payment_intent_created") return "AWAITING PAYMENT";
  return normalized.replace(/_/g, " ").toUpperCase();
};

const safeText = (value?: string) => value?.trim() || "N/A";

export const generateTicketPDF = async (ticket: TicketPdfData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 220],
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(APP_LOGO.url);
  } catch {
    logoImg = null;
  }

  // Top brand area
  doc.setFillColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
  doc.rect(0, 0, pageWidth, 66, "F");
  doc.setFillColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.rect(0, 60, pageWidth, 6, "F");

  if (logoImg) {
    const logoWidth = 42;
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
    doc.addImage(logoImg, "PNG", margin, 10, logoWidth, logoHeight);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("CATER DIRECTLY", margin, 24);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  doc.text(safeText(ticket.eventTitle), pageWidth - margin, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);

  const statusLabel = toStatusLabel(ticket.paymentStatus);
  const statusWidth = doc.getTextWidth(statusLabel) + 12;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - statusWidth, 32, statusWidth, 10, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.text(statusLabel, pageWidth - margin - statusWidth / 2, 38.5, { align: "center" });

  // Main container card (dynamic border for short custom pages)
  const mainY = 74;

  // Left and right info blocks
  const columnGap = 8;
  const colWidth = (contentWidth - columnGap) / 2;
  const leftX = margin + 6;
  const detailsWidth = contentWidth - 12;
  const blockTop = mainY + 10;

  const drawSection = (x: number, y: number, width: number, title: string) => {
    doc.setFillColor(SURFACE_GRAY[0], SURFACE_GRAY[1], SURFACE_GRAY[2]);
    doc.roundedRect(x, y, width, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
    doc.text(title, x + 3, y + 6.8);
  };

  drawSection(leftX, blockTop, detailsWidth, "ATTENDEE");
  let leftY = blockTop + 16;

  const drawRow = (x: number, y: number, label: string, value: string, width: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
    doc.text(label, x, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
    const lines = doc.splitTextToSize(value, width - 30);
    doc.setFontSize(11);
    doc.text(lines, x + 26, y);
    return Math.max(8, lines.length * 5.5 + 1.5);
  };

  leftY += drawRow(leftX, leftY, "Name", safeText(ticket.guestName), detailsWidth);
  leftY += drawRow(leftX, leftY, "Email", safeText(ticket.guestEmail), detailsWidth);
  leftY += drawRow(leftX, leftY, "Ticket", safeText(ticket.ticketName), detailsWidth);
  leftY += drawRow(leftX, leftY, "Starts", formatDateTime(ticket.eventStart), detailsWidth);
  leftY += drawRow(leftX, leftY, "Ends", formatDateTime(ticket.eventEnd), detailsWidth);

  // Venue strip
  const venueY = leftY + 4;
  doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
  doc.line(margin + 8, venueY - 4, margin + contentWidth - 8, venueY - 4);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.setFontSize(11);
  doc.text("Venue", margin + 10, venueY + 3);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
  const venueLines = doc.splitTextToSize(safeText(ticket.venueAddress), contentWidth - 30);
  doc.text(venueLines, margin + 28, venueY + 3);

  // Amount callout
  const amountBoxY = venueY + Math.max(8, venueLines.length * 6 + 4) + 6;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin + 8, amountBoxY, contentWidth - 16, 26, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.setFontSize(13);
  doc.text("Ticket Price", margin + 12, amountBoxY + 15);
  doc.setFontSize(22);
  doc.text(formatAmount(ticket.amount), margin + contentWidth - 12, amountBoxY + 15, { align: "right" });

  const detailsBottom = Math.min(pageHeight - 18, amountBoxY + 34);
  doc.setDrawColor(BORDER_GRAY[0], BORDER_GRAY[1], BORDER_GRAY[2]);
  doc.roundedRect(margin, mainY, contentWidth, detailsBottom - mainY, 4, 4, "S");

  // Bottom brand footer
  const footerY = pageHeight - 14;
  doc.setDrawColor(BRAND_ORANGE[0], BRAND_ORANGE[1], BRAND_ORANGE[2]);
  doc.setLineWidth(0.6);
  doc.line(margin, footerY - 7, pageWidth - margin, footerY - 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
  doc.text("Thank you for choosing Cater Directly.", margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2]);
  doc.text("Cater Directly - Premium Catering Services", pageWidth - margin, footerY, {
    align: "right",
  });

  const safeId = ticket.id ? ticket.id.slice(0, 8) : "ticket";
  doc.save(`Ticket-${safeId}.pdf`);
};

























