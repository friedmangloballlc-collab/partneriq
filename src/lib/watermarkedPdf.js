import jsPDF from "jspdf";

/**
 * Generates a watermarked PDF document with the viewer's name on every page.
 *
 * @param {Object} opts
 * @param {string}   opts.title       - Document title shown in the header
 * @param {Array}    opts.content     - Array of section objects: { heading, rows }
 *                                     rows is an array of [label, value] pairs
 * @param {string}   opts.viewerName  - Name of the person viewing (used for watermark + footer)
 * @param {string}   opts.viewerEmail - Email of the viewer (shown in footer)
 * @param {string}   [opts.subtitle]  - Optional subtitle below the title
 * @returns {jsPDF}  The constructed jsPDF document (not yet saved)
 */
export function generateWatermarkedPDF({ title, content = [], viewerName, viewerEmail, subtitle }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN_X = 18;
  const FOOTER_H = 22;
  const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 5;

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // ── Helper: add watermark on the current page ───────────────────────────────
  function addWatermark() {
    doc.saveGraphicsState();
    doc.setTextColor(210, 215, 230);
    doc.setFontSize(44);
    doc.setFont("helvetica", "bold");
    // Diagonal text centred on the page
    doc.text(viewerName || "CONFIDENTIAL", PAGE_W / 2, PAGE_H / 2, {
      align: "center",
      angle: 45,
    });
    // Second, smaller watermark below
    doc.setFontSize(20);
    doc.text("CONFIDENTIAL", PAGE_W / 2, PAGE_H / 2 + 32, {
      align: "center",
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  // ── Helper: draw footer on the current page ─────────────────────────────────
  function addFooter(pageNum, totalPages) {
    doc.setFillColor(248, 250, 252);
    doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, "F");
    doc.setDrawColor(220, 225, 240);
    doc.line(0, PAGE_H - FOOTER_H, PAGE_W, PAGE_H - FOOTER_H);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text(`Confidential — Prepared for ${viewerName}`, MARGIN_X, PAGE_H - FOOTER_H + 7);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`${viewerEmail || ""}  |  ${dateStr}`, MARGIN_X, PAGE_H - FOOTER_H + 13);

    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - MARGIN_X, PAGE_H - FOOTER_H + 7, { align: "right" });
    doc.text("dealstage.io", PAGE_W - MARGIN_X, PAGE_H - FOOTER_H + 13, { align: "right" });
  }

  // ── Helper: draw the page header band ──────────────────────────────────────
  function addHeader() {
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, PAGE_W, 48, "F");

    // Confidential badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN_X, 8, 52, 8, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENTIAL", MARGIN_X + 3, 13.2);

    // Date on right
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 255);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, PAGE_W - MARGIN_X, 13.2, { align: "right" });

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title || "Data Room", MARGIN_X, 30);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(200, 200, 255);
      doc.text(subtitle, MARGIN_X, 40);
    }
  }

  // ── Count total pages (two-pass approach) ───────────────────────────────────
  // We render all sections to figure out how many pages we need, then render for real.
  // For simplicity we do a single-pass and patch the footer in a post-process step.
  // jsPDF does not support true two-pass, so we accumulate pages dynamically.

  let currentY = 0;
  let pageCount = 1;

  function ensureSpace(neededMM) {
    if (currentY + neededMM > CONTENT_BOTTOM) {
      doc.addPage();
      pageCount++;
      addWatermark();
      addHeader();
      currentY = 56;
    }
  }

  // ── First page setup ────────────────────────────────────────────────────────
  addHeader();
  addWatermark();
  currentY = 56;

  // ── Render content sections ─────────────────────────────────────────────────
  content.forEach((section) => {
    if (!section) return;

    // Section heading
    ensureSpace(16);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text((section.heading || "").toUpperCase(), MARGIN_X, currentY);
    doc.setDrawColor(220, 225, 240);
    doc.line(MARGIN_X, currentY + 2, PAGE_W - MARGIN_X, currentY + 2);
    currentY += 10;

    // Rows
    const rows = Array.isArray(section.rows) ? section.rows : [];
    rows.forEach(([label, value]) => {
      ensureSpace(10);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(String(label) + ":", MARGIN_X, currentY);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      // Wrap long values
      const safeValue = String(value ?? "—");
      const lines = doc.splitTextToSize(safeValue, PAGE_W - MARGIN_X - 60);
      lines.forEach((line, li) => {
        if (li > 0) ensureSpace(8);
        doc.text(line, MARGIN_X + 55, currentY);
        if (li < lines.length - 1) currentY += 7;
      });
      currentY += 8;
    });

    currentY += 6; // gap between sections
  });

  // ── Patch footers onto every page ──────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  return doc;
}

/**
 * Convenience: build a PDF from data-room entry arrays and immediately trigger download.
 *
 * @param {Object} opts
 * @param {string}  opts.roomTitle    - e.g. "Talent Deal Intelligence Room"
 * @param {Array}   opts.entries      - data_room_entries rows
 * @param {string}  opts.viewerName
 * @param {string}  opts.viewerEmail
 * @param {string}  [opts.roomType]   - "talent_deals" | "brand_campaigns" | "agency_engagements"
 */
export function exportDataRoomPDF({ roomTitle, entries, viewerName, viewerEmail, roomType }) {
  const fmtMoney = (n) => {
    if (!n && n !== 0) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  };

  const fmtDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Summary section
  const totalValue = entries.reduce((s, e) => s + (e.deal_value || 0), 0);
  const summaryRows = [
    ["Total Entries", String(entries.length)],
    ["Total Value", fmtMoney(totalValue)],
    ["Average Value", entries.length ? fmtMoney(totalValue / entries.length) : "—"],
    ["Room Type", roomType || "—"],
    ["Export Date", new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
  ];

  // Entry sections
  const entrySections = entries.map((e, i) => {
    const baseRows = [
      ["Title", e.title || "Untitled"],
      ["Brand", e.brand_name || "—"],
      ["Talent / Creator", e.talent_name || "—"],
      ["Type", e.deal_type || "—"],
      ["Platform", e.platform || "—"],
      ["Value", fmtMoney(e.deal_value)],
      ["Status", e.status || "—"],
      ["Start Date", fmtDate(e.start_date)],
      ["End Date", fmtDate(e.end_date)],
      ["Deliverables", e.deliverables || "—"],
      ["Notes", e.notes || "—"],
    ];

    const pm = e.performance_metrics;
    if (pm && typeof pm === "object") {
      if (pm.impressions) baseRows.push(["Impressions", Number(pm.impressions).toLocaleString()]);
      if (pm.reach)       baseRows.push(["Reach",       Number(pm.reach).toLocaleString()]);
      if (pm.clicks)      baseRows.push(["Clicks",      Number(pm.clicks).toLocaleString()]);
      if (pm.conversions) baseRows.push(["Conversions", Number(pm.conversions).toLocaleString()]);
      if (pm.engagement_rate) baseRows.push(["Engagement Rate", `${pm.engagement_rate}%`]);
      if (pm.roas)        baseRows.push(["ROAS", `${pm.roas}x`]);
      if (pm.fee_earned)  baseRows.push(["Fee Earned",  fmtMoney(pm.fee_earned)]);
    }

    return { heading: `Entry ${i + 1}: ${e.title || e.brand_name || "Untitled"}`, rows: baseRows };
  });

  const doc = generateWatermarkedPDF({
    title: roomTitle,
    subtitle: `Prepared for ${viewerName}`,
    content: [{ heading: "Summary", rows: summaryRows }, ...entrySections],
    viewerName,
    viewerEmail,
  });

  const slug = roomTitle.toLowerCase().replace(/\s+/g, "-");
  doc.save(`${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
