import { jsPDF } from "jspdf";

const GOLD  = [201, 151, 58];
const SOFT  = [240, 208, 128];
const WHITE = [253, 240, 213];
const MUTED = [184, 144, 96];
const DARK  = [10, 3, 0];
const SURF  = [21, 9, 0];
const SURF2 = [30, 14, 2];
const P1C   = [119, 119, 221];
const P2C   = [221, 119, 153];
const GREEN = [68, 204, 136];
const RED   = [204, 68, 68];
const AMBER = [221, 170, 0];

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 14;
const MR = 14;
const CW = PAGE_W - ML - MR;

function rgb(doc, arr) { doc.setTextColor(...arr); }
function fill(doc, arr) { doc.setFillColor(...arr); }

function splitLines(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text || ""), maxWidth);
}

function verdictColor(pct) {
  if (pct >= 80) return GREEN;
  if (pct >= 60) return [136, 204, 68];
  if (pct >= 40) return AMBER;
  if (pct >= 25) return [255, 136, 0];
  return RED;
}

export function generateMatchPDF({ result, p1, p2, aiText }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 0;

  function newPage() {
    doc.addPage();
    y = 14;
    pageHeader();
    y = 28;
  }

  function pageHeader() {
    fill(doc, DARK);
    doc.rect(0, 0, PAGE_W, 10, "F");
    doc.setFontSize(7);
    rgb(doc, MUTED);
    doc.text("Pavitra Jyotish — Vivah Milan Report", ML, 7);
    doc.text("pavitra-jyotish.netlify.app", PAGE_W - MR, 7, { align: "right" });
  }

  function checkY(needed = 10) {
    if (y + needed > PAGE_H - 12) newPage();
  }

  function section(title) {
    checkY(14);
    fill(doc, [42, 18, 0]);
    doc.rect(ML, y - 5, CW, 9, "F");
    rgb(doc, GOLD);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(title, ML + 3, y + 1);
    y += 10;
  }

  function sectionSmall(title, color = GOLD) {
    checkY(10);
    fill(doc, SURF2);
    doc.rect(ML, y - 4, CW, 7, "F");
    rgb(doc, color);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(title, ML + 3, y + 0.5);
    y += 8;
  }

  function bodyText(text, indent = 0) {
    const lines = splitLines(doc, text, CW - 6 - indent);
    checkY(lines.length * 4.5 + 3);
    rgb(doc, WHITE);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(lines, ML + indent, y);
    y += lines.length * 4.5 + 3;
  }

  function labelVal(label, val, valColor = WHITE) {
    checkY(6);
    rgb(doc, MUTED);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), ML + 2, y);
    rgb(doc, valColor);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(String(val ?? "—"), ML + 48, y);
    y += 5.5;
  }

  function twoCol(leftFn, rightFn) {
    const savedY = y;
    const halfW = CW / 2 - 3;

    // capture left side
    const leftStartY = y;
    leftFn(ML, halfW, P1C);
    const leftEndY = y;

    y = leftStartY;
    rightFn(ML + halfW + 6, halfW, P2C);
    const rightEndY = y;

    y = Math.max(leftEndY, rightEndY) + 4;
  }

  // ── COVER ────────────────────────────────────────────────────────────────
  fill(doc, DARK);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  fill(doc, [42, 18, 0]);
  doc.rect(0, 0, PAGE_W, 56, "F");

  doc.setFontSize(28);
  rgb(doc, GOLD);
  doc.text("ॐ", PAGE_W / 2, 22, { align: "center" });

  doc.setFontSize(20);
  rgb(doc, SOFT);
  doc.setFont("helvetica", "bold");
  doc.text("Vivah Milan", PAGE_W / 2, 34, { align: "center" });

  doc.setFontSize(10);
  rgb(doc, MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Vedic Compatibility & Matchmaking Report", PAGE_W / 2, 42, { align: "center" });

  // person boxes
  const bx1 = ML, bx2 = ML + CW / 2 + 4, bw = CW / 2 - 4;

  [[bx1, P1C, "Person 1", p1], [bx2, P2C, "Person 2", p2]].forEach(([bx, col, label, vals]) => {
    fill(doc, SURF2);
    doc.setFillColor(...col, 0.1);
    doc.setFillColor(col[0] * 0.1, col[1] * 0.1, col[2] * 0.1);
    doc.rect(bx, 65, bw, 44, "F");
    doc.setDrawColor(...col);
    doc.setLineWidth(0.3);
    doc.rect(bx, 65, bw, 44, "D");

    rgb(doc, col);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label, bx + 5, 72);

    rgb(doc, WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const v = vals || {};
    const dob = `${v.day || "—"}/${v.month || "—"}/${v.year || "—"}`;
    const time = `${String(v.hour ?? "—").padStart(2,"0")}:${String(v.minute ?? "—").padStart(2,"0")}`;
    const tz = `UTC${(v.tz_offset ?? 0) >= 0 ? "+" : ""}${v.tz_offset ?? "—"}`;
    doc.text(`DOB: ${dob}`, bx + 5, 80);
    doc.text(`Time: ${time}`, bx + 5, 87);
    doc.text(`Lat: ${v.lat ?? "—"}°  Lon: ${v.lon ?? "—"}°`, bx + 5, 94);
    doc.text(`TZ: ${tz}`, bx + 5, 101);
  });

  // Score circle (text version for PDF)
  const r = result || {};
  const pct = r.max ? Math.round((r.total / r.max) * 100) : 0;
  const vCol = verdictColor(pct);

  fill(doc, SURF2);
  doc.rect(ML, 118, CW, 38, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.rect(ML, 118, CW, 38, "D");

  rgb(doc, MUTED);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("ASHTAKOOT MILAN SCORE", PAGE_W / 2, 126, { align: "center" });

  rgb(doc, vCol);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text(`${r.total ?? "—"}`, PAGE_W / 2 - 12, 145, { align: "center" });

  rgb(doc, MUTED);
  doc.setFontSize(14);
  doc.text(`/ ${r.max ?? 36}`, PAGE_W / 2 + 8, 145);

  rgb(doc, vCol);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(r.verdict || "", PAGE_W / 2, 153, { align: "center" });

  rgb(doc, MUTED);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Ashtakoot · Rajju · Vedha · 7th House · Venus · Darakaraka · Lagna · Dasha · Karma",
    PAGE_W / 2, 165, { align: "center" }
  );
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}`,
    PAGE_W / 2, 172, { align: "center" }
  );

  // ── PAGE 2 ───────────────────────────────────────────────────────────────
  newPage();

  // Moon cards
  section("Moon Compatibility — Chandra Milan");
  const moonFields = ["Nakshatra", "Moon Sign", "Gana", "Nadi", "Varna", "Yoni", "Sign Lord"];
  const m1 = r.p1_moon || {}, m2 = r.p2_moon || {};

  twoCol(
    (x, w, col) => {
      fill(doc, SURF2);
      doc.rect(x, y - 2, w, 58, "F");
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 1 — CHANDRA", x + 3, y + 3);
      y += 7;
      const rows = [
        ["Nakshatra", `${m1.nakshatra || "—"} Pada ${m1.pada || "—"}`],
        ["Moon Sign",  `${m1.sign || "—"} (${(m1.degree || 0).toFixed(1)}°)`],
        ["Gana",  m1.gana], ["Nadi", m1.nadi], ["Varna", m1.varna],
        ["Yoni",  `${m1.animal || "—"} (${m1.yoni || "—"})`],
        ["Lord",  m1.lord],
      ];
      for (const [k, v] of rows) {
        rgb(doc, MUTED);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(k, x + 3, y);
        rgb(doc, WHITE);
        doc.text(String(v || "—"), x + w - 3, y, { align: "right" });
        y += 5;
      }
    },
    (x, w, col) => {
      fill(doc, SURF2);
      doc.rect(x, y - 2, w, 58, "F");
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 2 — CHANDRA", x + 3, y + 3);
      y += 7;
      const rows = [
        ["Nakshatra", `${m2.nakshatra || "—"} Pada ${m2.pada || "—"}`],
        ["Moon Sign",  `${m2.sign || "—"} (${(m2.degree || 0).toFixed(1)}°)`],
        ["Gana",  m2.gana], ["Nadi", m2.nadi], ["Varna", m2.varna],
        ["Yoni",  `${m2.animal || "—"} (${m2.yoni || "—"})`],
        ["Lord",  m2.lord],
      ];
      for (const [k, v] of rows) {
        rgb(doc, MUTED);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.text(k, x + 3, y);
        rgb(doc, WHITE);
        doc.text(String(v || "—"), x + w - 3, y, { align: "right" });
        y += 5;
      }
    }
  );

  y += 4;

  // Ashtakoot table
  section("Ashtakoot — 8 Kootas (36 Points)");
  const kColW = [38, 18, 18, 108];
  tableHeader(doc, ["Koota", "Score", "Max", "Interpretation"], kColW, y); y += 7;
  for (const k of (r.kootas || [])) {
    const lines = splitLines(doc, k.detail || "", kColW[3] - 4);
    const rowH = Math.max(7, lines.length * 4.5 + 3);
    checkY(rowH);
    const kPct = k.max ? k.score / k.max : 0;
    const kCol = kPct >= 0.8 ? GREEN : kPct >= 0.5 ? AMBER : RED;
    fill(doc, SURF2);
    doc.rect(ML, y - 5, CW, rowH, "F");
    rgb(doc, WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(String(k.name || ""), ML + 2, y);
    rgb(doc, kCol);
    doc.setFontSize(8);
    doc.text(String(k.score ?? ""), ML + kColW[0] + 2, y);
    rgb(doc, MUTED);
    doc.text(String(k.max ?? ""), ML + kColW[0] + kColW[1] + 2, y);
    rgb(doc, WHITE);
    doc.setFont("helvetica", "normal");
    doc.text(lines, ML + kColW[0] + kColW[1] + kColW[2] + 2, y, { maxWidth: kColW[3] - 4 });
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.1);
    doc.line(ML, y + rowH - 5, ML + CW, y + rowH - 5);
    y += rowH;
  }
  y += 6;

  // Extended kootas
  if (r.mahendra || r.stree_deergha) {
    section("Extended Kootas — Mahendra & Stree-Deergha");
    for (const [label, data, tip] of [
      ["Mahendra Koota", r.mahendra, "Good fortune, prosperity, and long life of the couple."],
      ["Stree-Deergha",  r.stree_deergha, "Wife's longevity and endurance of the relationship."],
    ]) {
      if (!data) continue;
      checkY(20);
      const col = data.auspicious ? GREEN : AMBER;
      sectionSmall(`${data.auspicious ? "✓" : "✗"}  ${label}`, col);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "italic");
      doc.text(tip, ML + 2, y); y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Count: ${data.count ?? "—"}`, ML + 2, y); y += 5;
      bodyText(data.desc || "");
      y += 3;
    }
  }

  // Dosha analysis
  section("Dosha Analysis — Rajju · Vedha · Nadi · Bhakoot · Mangal Dosha");
  const doshas = [
    { label:"Rajju Dosha",   present:r.rajju?.dosha,         severity:r.rajju?.severity,    desc:r.rajju?.desc },
    { label:"Vedha Dosha",   present:r.vedha?.dosha,         severity:"Nakshatra Piercing",  desc:r.vedha?.desc },
    { label:"Nadi Dosha",    present:r.nadi_dosha?.present,  severity:"Health & Progeny",    desc:r.nadi_dosha?.desc },
    { label:"Bhakoot Dosha", present:r.bhakoot_dosha?.present,severity:"Financial Harmony", desc:r.bhakoot_dosha?.desc },
  ];
  for (const d of doshas) {
    const col = d.present ? RED : GREEN;
    checkY(16);
    fill(doc, SURF2);
    doc.rect(ML, y - 4, CW, 7, "F");
    rgb(doc, col);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${d.present ? "⚠" : "✓"}  ${d.label}${d.present && d.severity ? `  — ${d.severity}` : ""}`, ML + 3, y);
    y += 8;
    if (d.desc) bodyText(d.desc);
    y += 2;
  }

  // Mangal dosha
  checkY(20);
  sectionSmall("Mangal Dosha (Kuja Dosha) — Detailed", GOLD);
  if (r.mangal?.p1_desc) bodyText(r.mangal.p1_desc);
  if (r.mangal?.p2_desc) bodyText(r.mangal.p2_desc);
  if (r.mangal?.overall) {
    checkY(10);
    const mc = r.mangal?.both_have_dosha ? GREEN :
               (!r.mangal?.p1?.dosha && !r.mangal?.p2?.dosha) ? GREEN : AMBER;
    rgb(doc, mc);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(r.mangal.overall, ML + 2, y); y += 7;
  }
  y += 4;

  // 7th House
  section("7th House — Marital House Analysis");
  for (const [label, data, col] of [
    ["Person 1", r.seventh_house?.p1, P1C],
    ["Person 2", r.seventh_house?.p2, P2C],
  ]) {
    if (!data) continue;
    checkY(40);
    sectionSmall(label, col);
    const rows = [
      ["7th Sign",    data.sign],
      ["7th Lord",    data.lord],
      ["Lord Placed", data.lord_placed],
      ["Planets In",  (data.planets_in || []).join(", ") || "None"],
      ["Malefics",    (data.malefics_in || []).join(", ") || "None"],
      ["Benefics",    (data.benefics_in || []).join(", ") || "None"],
      ["Strength",    data.strength],
    ];
    for (const [k, v] of rows) {
      checkY(6);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(k, ML + 2, y);
      rgb(doc, WHITE);
      doc.text(String(v || "—"), ML + 48, y);
      y += 5;
    }
    if (data.desc) bodyText(data.desc);
    y += 4;
  }

  // Venus & Jupiter
  section("Venus & Jupiter — Romantic & Marital Karakas");
  for (const [label, data, col] of [
    ["Person 1", r.venus_jupiter?.p1, P1C],
    ["Person 2", r.venus_jupiter?.p2, P2C],
  ]) {
    if (!data) continue;
    checkY(35);
    sectionSmall(label, col);
    const rows = [
      ["Venus Sign",      `${data.venus_sign || "—"} H${data.venus_house || "—"}`],
      ["Venus Dignity",   data.venus_dignity],
      ["Venus Nakshatra", data.venus_nakshatra],
      ["Jupiter Sign",    `${data.jupiter_sign || "—"} H${data.jupiter_house || "—"}`],
      ["Jupiter Dignity", data.jupiter_dignity],
    ];
    for (const [k, v] of rows) {
      checkY(6);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(k, ML + 2, y);
      rgb(doc, WHITE);
      doc.text(String(v || "—"), ML + 48, y);
      y += 5;
    }
    if (data.desc) bodyText(data.desc);
    y += 4;
  }
  if (r.venus_jupiter?.venus_compat_desc) {
    checkY(12);
    rgb(doc, GOLD);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Venus Compatibility: ${(r.venus_jupiter?.venus_compatibility || "").replace(/_/g," ")}`, ML + 2, y); y += 6;
    bodyText(r.venus_jupiter.venus_compat_desc);
    y += 4;
  }

  // Darakaraka
  section("Darakaraka — Jaimini Spouse Significator");
  for (const [label, dk, desc, col] of [
    ["Person 1 Spouse Profile", r.darakaraka?.p1_dk, r.darakaraka?.p1_dk_desc, P1C],
    ["Person 2 Spouse Profile", r.darakaraka?.p2_dk, r.darakaraka?.p2_dk_desc, P2C],
  ]) {
    checkY(20);
    sectionSmall(label, col);
    if (dk) {
      checkY(6);
      rgb(doc, col);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(`DK: ${dk.name || "—"}  ·  ${dk.sign_en || "—"} H${dk.house || "—"}  ·  ${dk.nakshatra || "—"}`, ML + 2, y); y += 6;
    }
    if (desc) bodyText(desc);
    y += 4;
  }
  if (r.darakaraka?.cross_desc) {
    bodyText(r.darakaraka.cross_desc);
    y += 4;
  }

  // Lagna
  section("Lagna Compatibility — Ascendant Relationship");
  const lg = r.lagna || {};
  checkY(30);
  twoCol(
    (x, w, col) => {
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 1", x + 2, y);
      y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(10);
      doc.text(lg.p1_lagna || "—", x + 2, y); y += 5;
      rgb(doc, MUTED);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Lord: ${lg.p1_lord || "—"}`, x + 2, y); y += 6;
    },
    (x, w, col) => {
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 2", x + 2, y);
      y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(10);
      doc.text(lg.p2_lagna || "—", x + 2, y); y += 5;
      rgb(doc, MUTED);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Lord: ${lg.p2_lord || "—"}`, x + 2, y); y += 6;
    }
  );
  const rows = [
    ["Lagna Relationship", lg.relationship],
    ["Lord Relationship",  (lg.lord_relationship || "").replace(/_/g," ")],
    ["Overall Compatibility", lg.compatibility],
  ];
  for (const [k, v] of rows) {
    checkY(6);
    rgb(doc, MUTED);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(k, ML + 2, y);
    rgb(doc, WHITE);
    doc.setFont("helvetica", "bold");
    doc.text(String(v || "—"), ML + 60, y);
    y += 5.5;
  }
  if (lg.desc) bodyText(lg.desc);
  y += 4;

  // Dasha
  section("Dasha Compatibility & Marriage Timing");
  for (const [label, maha, antar, antarEnd, quality, col] of [
    ["Person 1", r.dasha?.p1_mahadasha, r.dasha?.p1_antardasha, r.dasha?.p1_antardasha_end, r.dasha?.p1_quality, P1C],
    ["Person 2", r.dasha?.p2_mahadasha, r.dasha?.p2_antardasha, r.dasha?.p2_antardasha_end, r.dasha?.p2_quality, P2C],
  ]) {
    checkY(24);
    sectionSmall(label, col);
    for (const [k, v] of [["Mahadasha", maha],["Antardasha", antar],["Until", antarEnd],["Quality", quality]]) {
      checkY(6);
      rgb(doc, MUTED);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text(k, ML + 2, y);
      rgb(doc, WHITE);
      doc.text(String(v || "—"), ML + 48, y);
      y += 5;
    }
    y += 4;
  }
  if (r.dasha?.desc) bodyText(r.dasha.desc);
  y += 4;

  // Rahu/Ketu
  section("Karmic Axis — Rahu & Ketu (Past-Life Bond)");
  const rk = r.rahu_ketu || {};
  twoCol(
    (x, w, col) => {
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 1", x + 2, y); y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Rahu: ${rk.p1_rahu || "—"} House ${rk.p1_rahu_house || "—"}`, x + 2, y); y += 5;
      doc.text(`Ketu: ${rk.p1_ketu || "—"} House ${rk.p1_ketu_house || "—"}`, x + 2, y); y += 5;
    },
    (x, w, col) => {
      rgb(doc, col);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PERSON 2", x + 2, y); y += 5;
      rgb(doc, WHITE);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text(`Rahu: ${rk.p2_rahu || "—"} House ${rk.p2_rahu_house || "—"}`, x + 2, y); y += 5;
      doc.text(`Ketu: ${rk.p2_ketu || "—"} House ${rk.p2_ketu_house || "—"}`, x + 2, y); y += 5;
    }
  );
  if (rk.karmic_connection) {
    checkY(8);
    rgb(doc, GOLD);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("✦ Strong Past-Life Karmic Bond Detected", ML + 2, y); y += 7;
  }
  if (rk.desc) bodyText(rk.desc);
  y += 4;

  // AI Pandit Reading
  if (aiText && aiText.trim()) {
    section("Pandit's Vachana — Complete Compatibility Reading");
    const clean = aiText.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*/g, "");
    const lines = splitLines(doc, clean, CW - 4);
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

  // Footer
  checkY(22);
  fill(doc, [42, 18, 0]);
  doc.rect(ML, y, CW, 18, "F");
  rgb(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ॐ  Pavitra Jyotish — Vivah Milan", PAGE_W / 2, y + 7, { align: "center" });
  rgb(doc, MUTED);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    "For spiritual guidance only. Made with devotion. pavitra-jyotish.netlify.app",
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

  const p1v = p1 || {};
  const fname = `vivah-milan_P1-${p1v.day || ""}${p1v.month || ""}${p1v.year || ""}_P2-${(p2 || {}).day || ""}${(p2 || {}).month || ""}${(p2 || {}).year || ""}.pdf`;
  doc.save(fname);
}

// ── Helpers ───────────────────────────────────────────────────────────────

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
