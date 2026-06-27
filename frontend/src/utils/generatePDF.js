import { jsPDF } from "jspdf";

const GOLD   = [201, 151, 58];
const SOFT   = [240, 208, 128];
const WHITE  = [253, 240, 213];
const MUTED  = [184, 144, 96];
const DARK   = [10, 3, 0];
const SURF   = [21, 9, 0];
const SURF2  = [30, 14, 2];

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 14;
const MR = 14;
const CW = PAGE_W - ML - MR;

const SYM = {
  Sun:"Sun (Surya)", Moon:"Moon (Chandra)", Mars:"Mars (Mangal)",
  Mercury:"Mercury (Budha)", Jupiter:"Jupiter (Guru)",
  Venus:"Venus (Shukra)", Saturn:"Saturn (Shani)",
  Rahu:"Rahu (North Node)", Ketu:"Ketu (South Node)",
};

function rgb(doc, arr) { doc.setTextColor(...arr); }
function fill(doc, arr) { doc.setFillColor(...arr); }
function stroke(doc, arr) { doc.setDrawColor(...arr); }

function splitLines(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text || ""), maxWidth);
}

export function generateKundaliPDF({ chart, report, interpretation, birthParams }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  function newPage() {
    doc.addPage();
    y = 14;
    drawPageHeader(doc);
    y = 28;
  }

  function checkY(needed = 10) {
    if (y + needed > PAGE_H - 12) newPage();
  }

  function drawPageHeader(d) {
    fill(d, DARK);
    d.rect(0, 0, PAGE_W, 10, "F");
    d.setFontSize(7);
    rgb(d, MUTED);
    d.text("Pavitra Jyotish — Free Vedic Astrology", ML, 7);
    d.text("pavitra-jyotish.netlify.app", PAGE_W - MR, 7, { align: "right" });
  }

  // ── COVER ────────────────────────────────────────────────────────────────
  fill(doc, DARK);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // decorative top band
  fill(doc, [42, 18, 0]);
  doc.rect(0, 0, PAGE_W, 52, "F");

  doc.setFontSize(28);
  rgb(doc, GOLD);
  doc.text("ॐ", PAGE_W / 2, 22, { align: "center" });

  doc.setFontSize(20);
  rgb(doc, SOFT);
  doc.setFont("helvetica", "bold");
  doc.text("Janma Kundali", PAGE_W / 2, 34, { align: "center" });

  doc.setFontSize(10);
  rgb(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Vedic Birth Chart & Astrological Analysis", PAGE_W / 2, 41, { align: "center" });

  // birth details box
  fill(doc, SURF);
  stroke(doc, GOLD);
  doc.setLineWidth(0.3);
  doc.rect(ML, 62, CW, 52, "FD");

  doc.setFontSize(9);
  rgb(doc, GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("BIRTH DETAILS", ML + 8, 70);

  const bp = birthParams || {};
  const details = [
    ["Date",      `${bp.day || "—"}/${bp.month || "—"}/${bp.year || "—"}`],
    ["Time",      `${String(bp.hour ?? "—").padStart(2,"0")}:${String(bp.minute ?? "—").padStart(2,"0")}`],
    ["Latitude",  `${bp.lat ?? "—"}°`],
    ["Longitude", `${bp.lon ?? "—"}°`],
    ["Timezone",  `UTC${bp.tz_offset >= 0 ? "+" : ""}${bp.tz_offset ?? "—"}`],
  ];
  doc.setFont("helvetica", "normal");
  let dy = 78;
  for (const [label, val] of details) {
    rgb(doc, MUTED);
    doc.setFontSize(8);
    doc.text(label, ML + 8, dy);
    rgb(doc, WHITE);
    doc.setFontSize(9);
    doc.text(val, ML + 40, dy);
    dy += 7;
  }

  // Summary strip
  const lagna = chart.lagna || {};
  const mdasha = chart.current_dasha || {};
  const adasha = chart.current_antardasha || {};

  const sum = [
    { label: "Lagna",      value: lagna.sign_en || "—" },
    { label: "Lagna Lord", value: lagna.lord || "—" },
    { label: "Mahadasha",  value: mdasha.lord || "—" },
    { label: "Antardasha", value: adasha.lord || "—" },
  ];
  fill(doc, [42, 18, 0]);
  doc.rect(ML, 122, CW, 30, "F");
  const cw4 = CW / 4;
  sum.forEach((item, i) => {
    const cx = ML + cw4 * i + cw4 / 2;
    rgb(doc, MUTED);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label.toUpperCase(), cx, 130, { align: "center" });
    rgb(doc, SOFT);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, cx, 140, { align: "center" });
  });

  // footer note
  rgb(doc, MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Sidereal · Lahiri Ayanamsa · Whole Sign Houses · Vimshottari Dasha",
    PAGE_W / 2, 168, { align: "center" }
  );
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}`,
    PAGE_W / 2, 175, { align: "center" }
  );

  rgb(doc, [201,151,58,0.3]);
  doc.setFontSize(7);
  doc.text(
    "Classical Vedic Jyotish • Brihat Parashara Hora Shastra • Phaladeepika",
    PAGE_W / 2, 220, { align: "center" }
  );

  // ── PAGE 2: SYNTHESIS + PLANETS ─────────────────────────────────────────
  newPage();

  // Synthesis
  if (report?.synthesis?.summary) {
    section(doc, "Chart Overview — Synthesis", y); y += 8;
    const lines = splitLines(doc, report.synthesis.summary, CW - 6);
    rgb(doc, WHITE);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    checkY(lines.length * 5 + 4);
    doc.text(lines, ML, y);
    y += lines.length * 5 + 4;

    const syn = report.synthesis;
    const badges = [
      syn.strong_planets?.length ? `Strong: ${syn.strong_planets.join(", ")}` : null,
      syn.weak_planets?.length   ? `Weak: ${syn.weak_planets.join(", ")}` : null,
      syn.retro_planets?.length  ? `Retrograde: ${syn.retro_planets.join(", ")}` : null,
    ].filter(Boolean);
    if (badges.length) {
      checkY(8);
      rgb(doc, MUTED);
      doc.setFontSize(8);
      doc.text(badges.join("   •   "), ML, y);
      y += 8;
    }
    y += 4;
  }

  // Planets table
  section(doc, "Graha — Planetary Positions", y); y += 10;

  const colW = [28, 26, 22, 22, 14, 12, 22, 36];
  const headers = ["Planet", "Sign", "Nakshatra", "Degree/House", "Retro", "Pada", "Dignity", "Navamsa"];
  tableHeader(doc, headers, colW, y); y += 7;

  for (const p of (chart.planets || [])) {
    checkY(7);
    const rd = report?.planets?.[p.name] || {};
    const row = [
      p.name,
      p.sign_en || "—",
      p.nakshatra || "—",
      `${p.degree_in_sign || 0}° / H${p.house}`,
      p.retrograde ? "℞" : "",
      String(p.pada || ""),
      rd.dignity || "Neutral",
      p.navamsa_sign || "—",
    ];
    tableRow(doc, row, colW, y);
    y += 7;
  }
  y += 6;

  // ── PAGE: HOUSES ─────────────────────────────────────────────────────────
  checkY(20);
  section(doc, "Bhava — All 12 Houses", y); y += 10;

  const hColW = [16, 30, 22, 46, 68];
  const hHeaders = ["House", "Sign", "Lord", "Planets", "Significance"];
  tableHeader(doc, hHeaders, hColW, y); y += 7;

  for (const h of (chart.houses || [])) {
    const rd = report?.houses?.[h.house] || {};
    const sigLines = splitLines(doc, h.significance || "", hColW[4] - 2);
    const rowH = Math.max(7, sigLines.length * 4.5 + 3);
    checkY(rowH);
    const row = [
      String(h.house),
      h.sign_en || "—",
      h.lord || "—",
      (h.planets || []).join(", ") || "Empty",
      h.significance || "",
    ];
    tableRow(doc, row, hColW, y, rowH);
    y += rowH;
  }
  y += 6;

  // ── YOGAS ────────────────────────────────────────────────────────────────
  if (chart.yogas?.length > 0) {
    checkY(16);
    section(doc, `Yogas Present (${chart.yogas.length})`, y); y += 8;
    for (const yg of chart.yogas) {
      checkY(20);
      rgb(doc, GOLD);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${yg.name}  [${yg.type}]`, ML, y);
      y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      const lines = splitLines(doc, yg.desc || "", CW - 4);
      checkY(lines.length * 4.5);
      doc.text(lines, ML + 2, y);
      y += lines.length * 4.5 + 5;
    }
    y += 2;
  }

  // ── DASHA TIMELINE ───────────────────────────────────────────────────────
  checkY(20);
  section(doc, "Vimshottari Dasha Timeline", y); y += 10;

  if (report?.dasha?.mahadasha_core) {
    checkY(20);
    fill(doc, SURF2);
    stroke(doc, GOLD);
    doc.setLineWidth(0.2);
    const dboxLines = splitLines(doc, report.dasha.mahadasha_core, CW - 12);
    const dboxH = dboxLines.length * 4.5 + 16;
    doc.rect(ML, y, CW, dboxH, "FD");
    rgb(doc, GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Currently Active: ${report.dasha.mahadasha_title || ""}`, ML + 5, y + 6);
    rgb(doc, WHITE);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(dboxLines, ML + 5, y + 12);
    y += dboxH + 6;
  }

  const dColW = [44, 70, 24, 44];
  const dHeaders = ["Planet (Mahadasha)", "Period", "Years", "Status"];
  tableHeader(doc, dHeaders, dColW, y); y += 7;

  for (const d of (chart.vimshottari || [])) {
    checkY(7);
    const isActive = chart.current_dasha && d.start === chart.current_dasha.start;
    if (isActive) {
      fill(doc, [90, 42, 0]);
      doc.rect(ML, y - 5, CW, 7, "F");
    }
    const row = [
      d.lord || "—",
      `${d.start || ""} → ${d.end || ""}`,
      `${d.years || ""} yrs`,
      isActive ? "ACTIVE NOW" : "",
    ];
    tableRow(doc, row, dColW, y, 7, isActive);
    y += 7;
  }
  y += 6;

  // Antardasha sub-table
  if (chart.antardasha?.length > 0 && chart.current_dasha) {
    checkY(14);
    rgb(doc, GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Antardasha within ${chart.current_dasha.lord} Mahadasha`, ML, y); y += 7;
    const aColW = [44, 70, 24, 44];
    tableHeader(doc, ["Sub-Lord", "Period", "Years", "Status"], aColW, y); y += 7;
    for (const d of chart.antardasha) {
      checkY(7);
      const isActive = chart.current_antardasha && d.start === chart.current_antardasha.start;
      if (isActive) {
        fill(doc, [90, 42, 0]);
        doc.rect(ML, y - 5, CW, 7, "F");
      }
      tableRow(doc, [
        d.lord || "—",
        `${d.start || ""} → ${d.end || ""}`,
        `${d.years || ""} yrs`,
        isActive ? "ACTIVE" : "",
      ], aColW, y, 7, isActive);
      y += 7;
    }
    y += 6;
  }

  // ── PLANET INTERPRETATIONS ───────────────────────────────────────────────
  checkY(20);
  section(doc, "Graha Interpretations — Classical Analysis", y); y += 8;

  for (const p of (chart.planets || [])) {
    const rd = report?.planets?.[p.name];
    if (!rd) continue;
    checkY(18);

    // Planet header
    fill(doc, SURF2);
    doc.rect(ML, y - 4, CW, 8, "F");
    rgb(doc, GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${p.name}  (${p.sign_en}, H${p.house})`, ML + 3, y + 1);
    if (rd.dignity) {
      rgb(doc, dignityRGB(rd.dignity));
      doc.text(`  ${rd.status || rd.dignity}`, ML + 60, y + 1);
    }
    y += 10;

    const blocks = [
      rd.in_sign   ? { label: `${p.name} in ${p.sign_en}`, text: rd.in_sign }   : null,
      rd.in_house  ? { label: `${p.name} in House ${p.house}`, text: rd.in_house } : null,
      rd.nakshatra_meaning ? { label: `Nakshatra: ${p.nakshatra}`, text: rd.nakshatra_meaning } : null,
      rd.retro_note   ? { label: "Retrograde Note", text: rd.retro_note }   : null,
      rd.combust_note ? { label: "Combust Note",    text: rd.combust_note } : null,
    ].filter(Boolean);

    for (const blk of blocks) {
      const lines = splitLines(doc, blk.text, CW - 8);
      checkY(lines.length * 4.5 + 8);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(blk.label.toUpperCase(), ML + 2, y);
      y += 4.5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(lines, ML + 2, y);
      y += lines.length * 4.5 + 4;
    }
    y += 4;
  }

  // ── REMEDIES ─────────────────────────────────────────────────────────────
  checkY(20);
  section(doc, "Upaya — Classical Remedies", y); y += 8;

  for (const [pname, pd] of Object.entries(report?.planets || {})) {
    const r = pd.remedy;
    if (!r) continue;
    checkY(50);

    fill(doc, SURF2);
    doc.rect(ML, y - 4, CW, 8, "F");
    rgb(doc, GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`${pname}  —  ${pd.status || ""}`, ML + 3, y + 1);
    y += 10;

    const remedyFields = [
      ["Fast Day", r.day], ["Color", r.color], ["Gemstone", r.stone],
      ["Metal", r.metal], ["Grain", r.grain], ["Flower", r.flower],
    ].filter(([, v]) => v);

    const halfW = CW / 2 - 4;
    let rx = ML, ry = y;
    let col = 0;
    for (const [label, val] of remedyFields) {
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(label.toUpperCase(), rx + 2, ry);
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(String(val), rx + 2, ry + 4.5);
      col++;
      if (col % 2 === 0) { rx = ML; ry += 12; }
      else { rx = ML + halfW + 4; }
    }
    if (col % 2 !== 0) ry += 12;
    y = ry;

    if (r.mantra) {
      checkY(10);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("MANTRA (108×)", ML + 2, y);
      y += 4.5;
      rgb(doc, GOLD);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "italic");
      const mLines = splitLines(doc, r.mantra, CW - 8);
      doc.text(mLines, ML + 2, y);
      y += mLines.length * 4.5 + 4;
    }
    if (r.donation) {
      checkY(10);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("DONATION (DAAN)", ML + 2, y);
      y += 4.5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      const dLines = splitLines(doc, r.donation, CW - 8);
      doc.text(dLines, ML + 2, y);
      y += dLines.length * 4.5 + 4;
    }
    y += 6;
  }

  // ── PANDIT'S READING ─────────────────────────────────────────────────────
  if (interpretation && interpretation.trim()) {
    checkY(20);
    section(doc, "Pandit's Vachana — Classical Reading", y); y += 8;

    const cleanText = interpretation.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*/g, "");
    const lines = splitLines(doc, cleanText, CW - 4);
    const CHUNK = 40;
    for (let i = 0; i < lines.length; i += CHUNK) {
      const chunk = lines.slice(i, i + CHUNK);
      checkY(chunk.length * 5);
      rgb(doc, WHITE);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(chunk, ML, y);
      y += chunk.length * 5 + 2;
    }
    y += 4;
  }

  // ── FOOTER ON LAST PAGE ───────────────────────────────────────────────────
  checkY(20);
  fill(doc, [42, 18, 0]);
  doc.rect(ML, y, CW, 18, "F");
  rgb(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ॐ  Pavitra Jyotish", PAGE_W / 2, y + 7, { align: "center" });
  rgb(doc, MUTED);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This report is for spiritual guidance only. pavitra-jyotish.netlify.app",
    PAGE_W / 2, y + 13, { align: "center" }
  );

  // page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    rgb(doc, MUTED);
    doc.setFontSize(7);
    doc.text(`Page ${i} of ${total}`, PAGE_W - MR, PAGE_H - 5, { align: "right" });
  }

  // filename
  const fname = `kundali_${bp.day || ""}${bp.month || ""}${bp.year || ""}.pdf`;
  doc.save(fname);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function section(doc, title, y) {
  fill(doc, [42, 18, 0]);
  doc.rect(ML, y - 5, CW, 9, "F");
  rgb(doc, GOLD);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, ML + 3, y + 1);
}

function tableHeader(doc, headers, colW, y) {
  fill(doc, [60, 30, 0]);
  doc.rect(ML, y - 5, CW, 7, "F");
  rgb(doc, SOFT);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  let x = ML + 2;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], x, y);
    x += colW[i];
  }
}

function tableRow(doc, cells, colW, y, rowH = 7, highlight = false) {
  if (highlight) {
    fill(doc, [70, 32, 0]);
    doc.rect(ML, y - 5, CW, rowH, "F");
    rgb(doc, SOFT);
  } else {
    rgb(doc, WHITE);
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  let x = ML + 2;
  for (let i = 0; i < cells.length; i++) {
    const cell = String(cells[i] ?? "");
    doc.text(cell, x, y, { maxWidth: colW[i] - 2 });
    x += colW[i];
  }
  // row separator
  fill(doc, [30, 14, 2]);
  stroke(doc, [42, 18, 0]);
  doc.setDrawColor(...[42, 18, 0]);
  doc.setLineWidth(0.1);
  doc.line(ML, y + rowH - 5, ML + CW, y + rowH - 5);
}

function dignityRGB(d) {
  if (d === "Exalted" || d === "Own Sign") return [68, 204, 136];
  if (d === "Debilitated") return [255, 102, 68];
  if (d === "Friendly Sign") return [255, 221, 102];
  return [184, 144, 96];
}
