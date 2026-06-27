import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint.js";
import { useLang }     from "../context/LangContext.jsx";
import { useToast }    from "../components/Toast.jsx";
import { generateMatchPDF } from "../utils/generateMatchPDF.js";

const API = import.meta.env.VITE_API_URL || "/api";

/* ── timezones ── */
const TIMEZONES = [
  { label:"Nepal (UTC+5:45)",            offset:5.75  },
  { label:"India / Sri Lanka (UTC+5:30)",offset:5.5   },
  { label:"Pakistan (UTC+5:00)",          offset:5.0   },
  { label:"Bangladesh (UTC+6:00)",        offset:6.0   },
  { label:"Myanmar (UTC+6:30)",           offset:6.5   },
  { label:"Thailand (UTC+7:00)",          offset:7.0   },
  { label:"China / Singapore (UTC+8)",    offset:8.0   },
  { label:"Japan / Korea (UTC+9)",        offset:9.0   },
  { label:"UAE / Oman (UTC+4)",           offset:4.0   },
  { label:"Saudi Arabia (UTC+3)",         offset:3.0   },
  { label:"East Africa (UTC+3)",          offset:3.0   },
  { label:"UK / UTC (UTC+0)",             offset:0.0   },
  { label:"Western Europe (UTC+1)",       offset:1.0   },
  { label:"Eastern Europe (UTC+2)",       offset:2.0   },
  { label:"US Eastern (UTC-5)",           offset:-5.0  },
  { label:"US Central (UTC-6)",           offset:-6.0  },
  { label:"US Mountain (UTC-7)",          offset:-7.0  },
  { label:"US Pacific (UTC-8)",           offset:-8.0  },
  { label:"Australia East (UTC+10)",      offset:10.0  },
  { label:"New Zealand (UTC+12)",         offset:12.0  },
];

function guessTz() {
  const off = -(new Date().getTimezoneOffset() / 60);
  return String(TIMEZONES.find(z => z.offset === off)?.offset ?? off);
}

/* ── palette ── */
const DEEP="#0a0300", G="#c9973a", GSFT="#f0d080", TXT="#fdf0d5", MUTED="#b89060";
const P1C="#7777dd", P2C="#dd7799";
const CARD="#150900", BORDER=`${G}33`;

/* ── Sub-components ── */
function ScoreBar({ score, max }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisp(score), 150); return () => clearTimeout(t); }, [score]);
  const pct = Math.round((disp / max) * 100);
  const col = pct >= 80 ? "#44dd88" : pct >= 60 ? "#88cc44" : pct >= 40 ? "#ddaa00" : pct >= 25 ? "#ff8800" : "#cc4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <div style={{ flex:1, height:8, background:"#1a0a00", borderRadius:4, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:4,
                      transition:"width .6s ease", boxShadow:`0 0 6px ${col}88` }} />
      </div>
      <span style={{ color:col, fontSize:12, fontWeight:"bold", minWidth:36, textAlign:"right" }}>
        {score}/{max}
      </span>
    </div>
  );
}

function DoshaBadge({ present, label, severity, desc }) {
  const [open, setOpen] = useState(false);
  const col = present ? "#cc4444" : "#44cc88";
  return (
    <div className="badge-lift" style={{ border:`1px solid ${col}44`, borderRadius:10, overflow:"hidden", marginBottom:8 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 14px", cursor:"pointer", background:`${col}11` }}
           onClick={() => setOpen(o => !o)}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:16 }}>{present ? "⚠" : "✓"}</span>
          <span style={{ color:col, fontWeight:"bold", fontSize:14 }}>{label}</span>
          {present && severity && <span style={{ color:MUTED, fontSize:11 }}>— {severity}</span>}
        </div>
        <span style={{ color:MUTED, fontSize:11 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ padding:"12px 14px", borderTop:`1px solid ${col}22`,
                      color:MUTED, fontSize:13, lineHeight:1.7 }}>{desc}</div>
      )}
    </div>
  );
}

function InfoSection({ title, icon, children, accent, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  const borderCol = accent || G;
  return (
    <div style={{ border:`1px solid ${borderCol}33`, borderRadius:14, marginBottom:16, overflow:"hidden" }}>
      <div className="section-hd"
           style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"14px 18px", cursor:"pointer",
                    background:`linear-gradient(135deg,${borderCol}18,transparent)` }}
           onClick={() => setOpen(o => !o)}>
        <h3 style={{ color:GSFT, margin:0, fontSize:16, fontFamily:"Georgia,serif" }}>
          <span style={{ marginRight:8 }}>{icon}</span>{title}
        </h3>
        <span style={{ color:MUTED, fontSize:12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ padding:"16px 18px" }}>{children}</div>}
    </div>
  );
}

function MoonCard({ data, color, label }) {
  if (!data) return null;
  const rows = [
    ["Nakshatra", `${data.nakshatra} Pada ${data.pada}`],
    ["Moon Sign",  `${data.sign} (${data.degree?.toFixed(1)}°)`],
    ["Gana",       data.gana],
    ["Nadi",       data.nadi],
    ["Varna",      data.varna],
    ["Yoni",       `${data.animal} (${data.yoni})`],
    ["Sign Lord",  data.lord],
  ];
  return (
    <div className="moon-hover" style={{ flex:1, background:`${color}11`, border:`1px solid ${color}44`,
                  borderRadius:12, padding:"16px 18px", minWidth:200 }}>
      <div style={{ color:color, fontWeight:"bold", fontSize:13, textTransform:"uppercase",
                    letterSpacing:2, marginBottom:12 }}>{label}</div>
      {rows.map(([k,v]) => (
        <div key={k} style={{ display:"flex", justifyContent:"space-between",
                               padding:"4px 0", borderBottom:`1px solid ${color}22` }}>
          <span style={{ color:MUTED, fontSize:12 }}>{k}</span>
          <span style={{ color:TXT, fontSize:12, fontWeight:"bold" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DetailRow({ label, value, good, warning }) {
  const col = good ? "#44cc88" : warning ? "#ff8800" : TXT;
  return (
    <div className="row-glow" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                  padding:"6px 0", borderBottom:`1px solid ${BORDER}` }}>
      <span style={{ color:MUTED, fontSize:12, minWidth:120 }}>{label}</span>
      <span style={{ color:col, fontSize:12, fontWeight:"bold", maxWidth:"58%", textAlign:"right" }}>{value}</span>
    </div>
  );
}

/* ── Birth Form ── */
function BirthForm({ label, color, values, onChange }) {
  function set(k) { return e => onChange({ ...values, [k]: e.target.value }); }

  const inp = {
    background:"#0f0500", border:`1px solid ${color}33`, borderRadius:7,
    color:TXT, padding:"9px 12px", fontSize:13, width:"100%", boxSizing:"border-box",
  };
  const sel = {
    ...inp, cursor:"pointer",
  };

  return (
    <div className="card-lift" style={{ flex:1, background:`${color}0d`, border:`1px solid ${color}44`,
                  borderRadius:16, padding:"20px 20px 16px", minWidth:280 }}>
      <h3 style={{ color:color, margin:"0 0 16px", fontSize:15, textTransform:"uppercase",
                   letterSpacing:2, fontFamily:"Georgia,serif" }}>{label}</h3>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
        {[["Year","year","1990"],["Month","month","1-12"],["Day","day","1-31"]].map(
          ([lbl,k,ph]) => (
            <div key={k}>
              <div style={{ color:MUTED, fontSize:11, marginBottom:4 }}>{lbl}</div>
              <input type="number" placeholder={ph} value={values[k]} onChange={set(k)} style={inp}/>
            </div>
          )
        )}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
        {[["Hour (0-23)","hour","0"],["Minute","minute","0"]].map(([lbl,k,ph]) => (
          <div key={k}>
            <div style={{ color:MUTED, fontSize:11, marginBottom:4 }}>{lbl}</div>
            <input type="number" placeholder={ph} value={values[k]} onChange={set(k)} style={inp}/>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
        {[["Latitude","lat","27.7172"],["Longitude","lon","85.3240"]].map(([lbl,k,ph]) => (
          <div key={k}>
            <div style={{ color:MUTED, fontSize:11, marginBottom:4 }}>{lbl}</div>
            <input type="number" step="0.0001" placeholder={ph} value={values[k]} onChange={set(k)} style={inp}/>
          </div>
        ))}
      </div>

      <div>
        <div style={{ color:MUTED, fontSize:11, marginBottom:4 }}>Timezone</div>
        <select value={values.tz_offset} onChange={set("tz_offset")} style={sel}>
          {TIMEZONES.map((z, i) => (
            <option key={i} value={String(z.offset)}>{z.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── Circular Score ── */
function CircleScore({ score, max, color, verdict }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDisp(score), 150); return () => clearTimeout(t); }, [score]);
  const r = 56, cx = 66, cy = 66;
  const circ = 2 * Math.PI * r;
  const dash  = circ * (disp / max);
  return (
    <div style={{ textAlign:"center" }}>
      <svg width={132} height={132} style={{ display:"block", margin:"0 auto" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a0a00" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
                strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition:"stroke-dasharray .8s ease", filter:`drop-shadow(0 0 6px ${color})` }}/>
        <text x={cx} y={cy-6} textAnchor="middle" fill={GSFT} fontSize={22} fontWeight="bold">{score}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fill={MUTED} fontSize={11}>out of {max}</text>
      </svg>
      <div style={{ color:color, fontWeight:"bold", fontSize:16, marginTop:8 }}>{verdict}</div>
    </div>
  );
}

/* ── Main page ── */
const empty = { year:"", month:"", day:"", hour:"", minute:"", lat:"", lon:"", tz_offset: guessTz() };

export default function Matchmaking() {
  const isMobile = useIsMobile();
  const { t }    = useLang();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [p1, setP1] = useState(() => {
    const q = Object.fromEntries(searchParams);
    return q.p1y ? { year:q.p1y, month:q.p1m, day:q.p1d, hour:q.p1h||"12",
                     minute:q.p1min||"0", lat:q.p1lat||"", lon:q.p1lon||"", tz_offset:q.p1tz||guessTz() }
                 : { ...empty };
  });
  const [p2, setP2] = useState(() => {
    const q = Object.fromEntries(searchParams);
    return q.p2y ? { year:q.p2y, month:q.p2m, day:q.p2d, hour:q.p2h||"12",
                     minute:q.p2min||"0", lat:q.p2lat||"", lon:q.p2lon||"", tz_offset:q.p2tz||guessTz() }
                 : { ...empty };
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const aiRef = useRef(null);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    showToast(t("m.shareDone"));
  }

  async function handleDownloadPDF() {
    if (!result) return;
    setPdfGenerating(true);
    try {
      await generateMatchPDF({ result, p1, p2, aiText });
    } finally {
      setPdfGenerating(false);
    }
  }

  function toNum(v, fallback=0) { const n=parseFloat(v); return isNaN(n)?fallback:n; }

  async function handleMatch() {
    setErr(""); setResult(null); setAiText("");
    const fields = ["year","month","day","hour","minute","lat","lon","tz_offset"];
    const bad1 = fields.filter(k => p1[k]==="");
    const bad2 = fields.filter(k => p2[k]==="");
    if (bad1.length||bad2.length) { setErr("Please fill all fields for both persons."); return; }
    setLoading(true);
    try {
      const body = {
        p1:{ year:+p1.year, month:+p1.month, day:+p1.day,
             hour:+p1.hour, minute:+p1.minute,
             lat:toNum(p1.lat), lon:toNum(p1.lon), tz_offset:toNum(p1.tz_offset) },
        p2:{ year:+p2.year, month:+p2.month, day:+p2.day,
             hour:+p2.hour, minute:+p2.minute,
             lat:toNum(p2.lat), lon:toNum(p2.lon), tz_offset:toNum(p2.tz_offset) },
      };
      const res = await fetch(`${API}/match`, { method:"POST",
        headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setSearchParams({ p1y:p1.year,p1m:p1.month,p1d:p1.day,p1h:p1.hour,p1min:p1.minute,p1lat:p1.lat,p1lon:p1.lon,p1tz:p1.tz_offset,
                        p2y:p2.year,p2m:p2.month,p2d:p2.day,p2h:p2.hour,p2min:p2.minute,p2lat:p2.lat,p2lon:p2.lon,p2tz:p2.tz_offset }, { replace:true });
      setTimeout(() => document.getElementById("match-results")?.scrollIntoView({ behavior:"smooth" }), 100);
    } catch(e) { setErr(e.message || "Server error"); }
    finally { setLoading(false); }
  }

  async function handleAI() {
    setAiText(""); setAiLoading(true);
    try {
      const res = await fetch(`${API}/match-interpret`, { method:"POST",
        headers:{"Content-Type":"application/json"}, body:JSON.stringify({ match: result }) });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAiText(t => t + dec.decode(value, { stream:true }));
        aiRef.current?.scrollIntoView({ behavior:"smooth", block:"end" });
      }
    } catch(e) { setAiText("Error: " + e.message); }
    finally { setAiLoading(false); }
  }

  const r = result;

  return (
    <div style={{ background:DEEP, minHeight:"100vh", padding:"80px 0 60px" }}>
      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 20px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:40, color:G }}>ॐ</div>
          <h1 style={{ fontSize:36, fontWeight:"bold", color:GSFT, margin:"8px 0 6px",
                       fontFamily:"Georgia,serif" }}>{t("m.title")}</h1>
          <p style={{ color:MUTED, fontSize:13, fontFamily:"system-ui,sans-serif", maxWidth:620, margin:"0 auto" }}>
            The most comprehensive Hindu compatibility analysis — Ashtakoot · Rajju · Vedha ·
            Mahendra · Stree-Deergha · 7th House · Venus · Darakaraka · Lagna · Dasha · Karma
          </p>
        </div>

        {/* ── Forms ── */}
        <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
          <BirthForm label={t("m.person1")} color={P1C} values={p1} onChange={setP1}/>
          <BirthForm label={t("m.person2")} color={P2C} values={p2} onChange={setP2}/>
        </div>

        {err && <div style={{ background:"#2a0000", border:"1px solid #cc4444", borderRadius:8,
                               padding:"12px 16px", color:"#ff8888", marginBottom:16, fontSize:13 }}>{err}</div>}

        <button onClick={handleMatch} disabled={loading} className="btn-shimmer"
                style={{ width:"100%", padding:"16px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
                          border:`1px solid ${G}`, borderRadius:12, color:GSFT, fontSize:16,
                          fontWeight:"bold", cursor:"pointer", letterSpacing:2, marginBottom:32,
                          opacity: loading ? 0.7 : 1 }}>
          {loading ? t("m.calculating") : t("m.btn")}
        </button>

        {/* ══ RESULTS ══ */}
        {r && (
          <div id="match-results">
            <div style={{ display:"flex", gap:12, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
              <button onClick={handleShare} className="btn-shimmer"
                style={{ padding:"8px 20px", background:"transparent", border:`1px solid ${G}44`,
                         borderRadius:8, color:MUTED, fontSize:13, cursor:"pointer",
                         fontFamily:"system-ui,sans-serif" }}>
                {t("m.shareBtn")}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
                style={{
                  padding:"10px 24px",
                  background: pdfGenerating ? "#1e1000" : `linear-gradient(135deg,#3d1200,#6b2400)`,
                  border:`1px solid ${pdfGenerating ? G+"44" : G}`,
                  borderRadius:8, color: pdfGenerating ? MUTED : GSFT,
                  fontSize:13, fontWeight:"bold", cursor: pdfGenerating ? "not-allowed" : "pointer",
                  fontFamily:"system-ui,sans-serif", letterSpacing:0.5,
                }}>
                {pdfGenerating ? "⏳ Preparing PDF…" : "⬇ Download PDF Report"}
              </button>
            </div>

            {/* ── Score banner ── */}
            <div style={{ background:CARD, border:`1px solid ${G}55`, borderRadius:20,
                          padding:"28px 32px", marginBottom:20,
                          display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>
              <CircleScore score={r.total} max={r.max} color={r.verdict_color} verdict={r.verdict}/>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ color:MUTED, fontSize:11, textTransform:"uppercase", letterSpacing:2,
                               marginBottom:8 }}>Ashtakoot Milan</div>
                <div style={{ color:TXT, fontSize:14, lineHeight:1.7, fontFamily:"system-ui,sans-serif" }}>
                  The classical 8-fold system measures compatibility across mind, body, spirit, temperament,
                  health, and karma. <strong style={{ color:r.verdict_color }}>{r.total}/36</strong> —
                  <strong style={{ color:r.verdict_color }}> {r.verdict}</strong>. Scroll down for the
                  complete multi-dimensional analysis including Rajju, Vedha, 7th House, Venus, Darakaraka,
                  and karmic connection.
                </div>
                {(r.p1_yogas?.length > 0 || r.p2_yogas?.length > 0) && (
                  <div style={{ marginTop:10, fontSize:12, color:MUTED }}>
                    {r.p1_yogas?.length > 0 && <div>P1 Yogas: {r.p1_yogas.map(y=>y.name).join(", ")}</div>}
                    {r.p2_yogas?.length > 0 && <div>P2 Yogas: {r.p2_yogas.map(y=>y.name).join(", ")}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* ── Moon cards ── */}
            <InfoSection title="Moon Compatibility — Chandra Milan" icon="🌙">
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                <MoonCard data={r.p1_moon} color={P1C} label="Person 1 — Chandra"/>
                <MoonCard data={r.p2_moon} color={P2C} label="Person 2 — Chandra"/>
              </div>
            </InfoSection>

            {/* ── Ashtakoot table ── */}
            <InfoSection title="Ashtakoot — 8 Kootas (36 Points)" icon="⚖">
              <div style={{ display:"grid", gap:10 }}>
                {r.kootas?.map(k => (
                  <div key={k.name} className="koota-row" style={{ display:"flex", alignItems:"center", gap:12,
                                              padding:"10px 12px", background:"#0f0500",
                                              borderRadius:8, border:`1px solid ${BORDER}` }}>
                    <div style={{ minWidth:120 }}>
                      <div style={{ color:GSFT, fontSize:13, fontWeight:"bold" }}>{k.name}</div>
                      <div style={{ color:MUTED, fontSize:11 }}>{k.desc}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <ScoreBar score={k.score} max={k.max}/>
                      <div style={{ color:MUTED, fontSize:11, marginTop:3 }}>{k.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </InfoSection>

            {/* ── Extended kootas ── */}
            <InfoSection title="Extended Kootas — Mahendra & Stree-Deergha" icon="📿">
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
                {[
                  { label:"Mahendra Koota", data:r.mahendra,
                    tip:"Shows good fortune, prosperity, and long life of the couple." },
                  { label:"Stree-Deergha",  data:r.stree_deergha,
                    tip:"Indicates the wife's longevity and the endurance of the relationship." },
                ].map(({ label, data, tip }) => data && (
                  <div key={label} style={{ background:"#0f0500",
                                            border:`1px solid ${data.auspicious ? "#44cc88" : "#ff8800"}44`,
                                            borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ color: data.auspicious ? "#44cc88" : "#ff8800",
                                   fontWeight:"bold", fontSize:14, marginBottom:4 }}>
                      {data.auspicious ? "✓" : "✗"} {label}
                    </div>
                    <div style={{ color:MUTED, fontSize:11, marginBottom:8, fontStyle:"italic" }}>{tip}</div>
                    <div style={{ color:TXT, fontSize:12, marginBottom:6 }}>Count: {data.count}</div>
                    <div style={{ color:MUTED, fontSize:12, lineHeight:1.7 }}>{data.desc}</div>
                  </div>
                ))}
              </div>
            </InfoSection>

            {/* ── Dosha analysis ── */}
            <InfoSection title="Dosha Analysis — Rajju · Vedha · Nadi · Bhakoot · Mangal" icon="⚠" accent="#cc6644">
              <div style={{ marginBottom:12 }}>
                <div style={{ color:MUTED, fontSize:12, marginBottom:12, lineHeight:1.6 }}>
                  Doshas are challenging astrological combinations. Every dosha has classical remedies.
                  The absence of a dosha is auspicious; the presence requires specific puja and remedies before marriage.
                </div>
                <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:8, marginBottom:8 }}>
                  {[
                    { label:"Rajju Dosha",   present:r.rajju?.dosha,         severity:r.rajju?.severity,       desc:r.rajju?.desc },
                    { label:"Vedha Dosha",   present:r.vedha?.dosha,         severity:"Nakshatra Piercing",    desc:r.vedha?.desc },
                    { label:"Nadi Dosha",    present:r.nadi_dosha?.present,   severity:"Health & Progeny",     desc:r.nadi_dosha?.desc },
                    { label:"Bhakoot Dosha", present:r.bhakoot_dosha?.present,severity:"Financial Harmony",   desc:r.bhakoot_dosha?.desc },
                  ].map(d => (
                    <DoshaBadge key={d.label} {...d}/>
                  ))}
                </div>
              </div>

              {/* Mangal Dosha detailed */}
              <div style={{ background:"#1a0800", border:`1px solid ${G}22`, borderRadius:10, padding:"14px" }}>
                <div style={{ color:GSFT, fontWeight:"bold", fontSize:14, marginBottom:10 }}>
                  Mangal Dosha (Kuja Dosha) — Detailed
                </div>
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7, marginBottom:6 }}>{r.mangal?.p1_desc}</div>
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7, marginBottom:10 }}>{r.mangal?.p2_desc}</div>
                <div style={{ padding:"10px 14px", borderRadius:8,
                               background: r.mangal?.both_have_dosha ? "#44cc8822" :
                                           (!r.mangal?.p1?.dosha && !r.mangal?.p2?.dosha) ? "#44cc8822" : "#ff880022",
                               color: r.mangal?.both_have_dosha ? "#44cc88" :
                                      (!r.mangal?.p1?.dosha && !r.mangal?.p2?.dosha) ? "#44cc88" : "#ff8800",
                               fontSize:13, fontWeight:"bold" }}>
                  {r.mangal?.overall}
                </div>
              </div>
            </InfoSection>

            {/* ── 7th House ── */}
            <InfoSection title="7th House — Marital House Analysis" icon="🏠">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[
                  { label:"Person 1", data:r.seventh_house?.p1, color:P1C },
                  { label:"Person 2", data:r.seventh_house?.p2, color:P2C },
                ].map(({ label, data, color }) => data && (
                  <div key={label} style={{ background:"#0f0500", border:`1px solid ${color}33`,
                                            borderRadius:10, padding:"14px" }}>
                    <div style={{ color, fontWeight:"bold", fontSize:13, marginBottom:10,
                                   textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
                    <DetailRow label="7th Sign"    value={data.sign}/>
                    <DetailRow label="7th Lord"    value={data.lord}/>
                    <DetailRow label="Lord Placed" value={data.lord_placed}/>
                    <DetailRow label="Planets In"  value={data.planets_in?.join(", ") || "None"}/>
                    {data.malefics_in?.length > 0 && (
                      <DetailRow label="⚠ Malefics" value={data.malefics_in.join(", ")} warning/>
                    )}
                    {data.benefics_in?.length > 0 && (
                      <DetailRow label="✓ Benefics" value={data.benefics_in.join(", ")} good/>
                    )}
                    {data.benefic_aspects?.length > 0 && (
                      <DetailRow label="Benefic Asp." value={data.benefic_aspects.join(", ")} good/>
                    )}
                    {data.malefic_aspects?.length > 0 && (
                      <DetailRow label="Malefic Asp." value={data.malefic_aspects.join(", ")} warning/>
                    )}
                    <div style={{ marginTop:10, padding:"6px 10px", borderRadius:6,
                                   background:`${color}18`,
                                   color: data.strength==="Strong"?"#44cc88":
                                           data.strength==="Afflicted"?"#cc4444":MUTED,
                                   fontSize:12, fontWeight:"bold" }}>
                      Strength: {data.strength}
                    </div>
                    <div style={{ color:MUTED, fontSize:12, lineHeight:1.6, marginTop:8 }}>{data.desc}</div>
                  </div>
                ))}
              </div>
            </InfoSection>

            {/* ── Venus & Jupiter ── */}
            <InfoSection title="Venus & Jupiter — Romantic & Marital Karakas" icon="♀">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"Person 1", data:r.venus_jupiter?.p1, color:P1C },
                  { label:"Person 2", data:r.venus_jupiter?.p2, color:P2C },
                ].map(({ label, data, color }) => data && (
                  <div key={label} style={{ background:"#0f0500", border:`1px solid ${color}33`,
                                            borderRadius:10, padding:"14px" }}>
                    <div style={{ color, fontWeight:"bold", fontSize:13, marginBottom:10 }}>{label}</div>
                    <DetailRow label="Venus Sign"     value={`${data.venus_sign} H${data.venus_house}`}/>
                    <DetailRow label="Venus Dignity"  value={data.venus_dignity}
                                good={["Exalted","Own Sign"].includes(data.venus_dignity)}
                                warning={data.venus_dignity==="Debilitated"}/>
                    <DetailRow label="Venus Nakshatra" value={data.venus_nakshatra}/>
                    <DetailRow label="Jupiter Sign"   value={`${data.jupiter_sign} H${data.jupiter_house}`}/>
                    <DetailRow label="Jupiter Dignity" value={data.jupiter_dignity}
                                good={["Exalted","Own Sign"].includes(data.jupiter_dignity)}
                                warning={data.jupiter_dignity==="Debilitated"}/>
                    <div style={{ color:MUTED, fontSize:12, lineHeight:1.6, marginTop:8 }}>{data.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#0f0500", border:`1px solid ${G}22`, borderRadius:10, padding:"14px" }}>
                <div style={{ color:GSFT, fontWeight:"bold", fontSize:13, marginBottom:6 }}>
                  Venus Compatibility:{" "}
                  <span style={{ color: ["enemies","mixed"].includes(r.venus_jupiter?.venus_compatibility) ? "#cc4444" :
                                         ["great_friends","friends","same"].includes(r.venus_jupiter?.venus_compatibility) ? "#44cc88" : MUTED }}>
                    {r.venus_jupiter?.venus_compatibility?.replace(/_/g," ")}
                  </span>
                </div>
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7 }}>{r.venus_jupiter?.venus_compat_desc}</div>
              </div>
            </InfoSection>

            {/* ── Darakaraka ── */}
            <InfoSection title="Darakaraka — Jaimini Spouse Significator" icon="🪐">
              <div style={{ color:MUTED, fontSize:12, marginBottom:12, lineHeight:1.6 }}>
                The Darakaraka is the planet with the lowest degree in the chart (Jaimini system).
                It represents the nature and qualities of the person's spouse.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"Person 1's Spouse Profile", color:P1C, dk:r.darakaraka?.p1_dk, desc:r.darakaraka?.p1_dk_desc },
                  { label:"Person 2's Spouse Profile", color:P2C, dk:r.darakaraka?.p2_dk, desc:r.darakaraka?.p2_dk_desc },
                ].map(({ label, color, dk, desc }) => (
                  <div key={label} style={{ background:"#0f0500", border:`1px solid ${color}33`,
                                            borderRadius:10, padding:"14px" }}>
                    <div style={{ color, fontWeight:"bold", fontSize:13, marginBottom:8 }}>{label}</div>
                    {dk && (
                      <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                        <span style={{ background:`${color}22`, border:`1px solid ${color}44`,
                                        borderRadius:6, padding:"4px 12px", color, fontSize:13, fontWeight:"bold" }}>
                          DK: {dk.name}
                        </span>
                        <span style={{ color:MUTED, fontSize:12, paddingTop:4 }}>
                          {dk.sign_en} · H{dk.house} · {dk.nakshatra}
                        </span>
                      </div>
                    )}
                    <div style={{ color:MUTED, fontSize:13, lineHeight:1.7 }}>{desc}</div>
                  </div>
                ))}
              </div>
              {r.darakaraka?.cross_desc && (
                <div style={{ background:"#0f0500", border:`1px solid ${G}22`, borderRadius:10, padding:"14px" }}>
                  <div style={{ color:MUTED, fontSize:13, lineHeight:1.7 }}>{r.darakaraka.cross_desc}</div>
                </div>
              )}
            </InfoSection>

            {/* ── Lagna Compatibility ── */}
            <InfoSection title="Lagna Compatibility — Ascendant Relationship" icon="⬆">
              <div style={{ background:"#0f0500", border:`1px solid ${G}22`, borderRadius:10, padding:"16px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
                  {[
                    { label:"Person 1", lagna:r.lagna?.p1_lagna, lord:r.lagna?.p1_lord, color:P1C },
                    { label:"Person 2", lagna:r.lagna?.p2_lagna, lord:r.lagna?.p2_lord, color:P2C },
                  ].map(({ label, lagna, lord, color }) => (
                    <div key={label}>
                      <div style={{ color, fontWeight:"bold", fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
                      <div style={{ color:TXT, fontSize:16, fontWeight:"bold" }}>{lagna}</div>
                      <div style={{ color:MUTED, fontSize:12 }}>Lord: {lord}</div>
                    </div>
                  ))}
                </div>
                <DetailRow label="Lagna Relationship" value={r.lagna?.relationship}
                            good={r.lagna?.relationship==="Trine"}/>
                <DetailRow label="Lord Relationship"  value={r.lagna?.lord_relationship?.replace(/_/g," ")}
                            good={["great_friends","friends","same"].includes(r.lagna?.lord_relationship)}
                            warning={["enemies"].includes(r.lagna?.lord_relationship)}/>
                {r.lagna?.moon1_in_lagna2 && (
                  <div style={{ margin:"8px 0", padding:"6px 10px", background:"#44cc8822",
                                 borderRadius:6, color:"#44cc88", fontSize:12 }}>
                    ✓ Person 1's Moon in Person 2's Lagna sign — strong soul recognition
                  </div>
                )}
                {r.lagna?.moon2_in_lagna1 && (
                  <div style={{ margin:"8px 0", padding:"6px 10px", background:"#44cc8822",
                                 borderRadius:6, color:"#44cc88", fontSize:12 }}>
                    ✓ Person 2's Moon in Person 1's Lagna sign — strong soul recognition
                  </div>
                )}
                <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8,
                               background:`${r.lagna?.compatibility==="Excellent"?"#44cc88":
                                            r.lagna?.compatibility==="Good"?"#88cc44":
                                            r.lagna?.compatibility==="Moderate"?"#ddaa00":"#cc4444"}22`,
                               color:GSFT, fontWeight:"bold", fontSize:13 }}>
                  Overall Lagna Compatibility: {r.lagna?.compatibility}
                </div>
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7, marginTop:10 }}>{r.lagna?.desc}</div>
              </div>
            </InfoSection>

            {/* ── Dasha Timing ── */}
            <InfoSection title="Dasha Compatibility & Marriage Timing" icon="⏳">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  { label:"Person 1", maha:r.dasha?.p1_mahadasha, antar:r.dasha?.p1_antardasha,
                    antarEnd:r.dasha?.p1_antardasha_end, quality:r.dasha?.p1_quality, color:P1C },
                  { label:"Person 2", maha:r.dasha?.p2_mahadasha, antar:r.dasha?.p2_antardasha,
                    antarEnd:r.dasha?.p2_antardasha_end, quality:r.dasha?.p2_quality, color:P2C },
                ].map(({ label, maha, antar, antarEnd, quality, color }) => (
                  <div key={label} style={{ background:"#0f0500", border:`1px solid ${color}33`,
                                            borderRadius:10, padding:"14px" }}>
                    <div style={{ color, fontWeight:"bold", fontSize:12, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
                    <DetailRow label="Mahadasha"  value={maha}/>
                    <DetailRow label="Antardasha" value={antar}/>
                    <DetailRow label="Until"      value={antarEnd}/>
                    <div style={{ marginTop:8, padding:"6px 10px", borderRadius:6, fontSize:12, fontWeight:"bold",
                                   background: quality?.includes("marriage-supportive") ? "#44cc8822" :
                                               quality?.includes("neutral") ? "#ddaa0022" : "#cc444422",
                                   color: quality?.includes("marriage-supportive") ? "#44cc88" :
                                           quality?.includes("neutral") ? "#ddaa00" : "#cc4444" }}>
                      {quality}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background:"#0f0500", border:`1px solid ${G}22`, borderRadius:10, padding:"14px" }}>
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7 }}>{r.dasha?.desc}</div>
              </div>
            </InfoSection>

            {/* ── Rahu/Ketu Karma ── */}
            <InfoSection title="Karmic Axis — Rahu & Ketu (Past-Life Bond)" icon="🔮">
              <div style={{ background:"#0f0500", border:`1px solid ${G}22`, borderRadius:10, padding:"16px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
                  {[
                    { label:"Person 1", rahu:r.rahu_ketu?.p1_rahu, rahuH:r.rahu_ketu?.p1_rahu_house,
                      ketu:r.rahu_ketu?.p1_ketu, ketuH:r.rahu_ketu?.p1_ketu_house, color:P1C },
                    { label:"Person 2", rahu:r.rahu_ketu?.p2_rahu, rahuH:r.rahu_ketu?.p2_rahu_house,
                      ketu:r.rahu_ketu?.p2_ketu, ketuH:r.rahu_ketu?.p2_ketu_house, color:P2C },
                  ].map(({ label, rahu, rahuH, ketu, ketuH, color }) => (
                    <div key={label}>
                      <div style={{ color, fontWeight:"bold", fontSize:11, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
                      <div style={{ color:MUTED, fontSize:13 }}>☊ Rahu: <strong style={{ color:TXT }}>{rahu}</strong> House {rahuH}</div>
                      <div style={{ color:MUTED, fontSize:13 }}>☋ Ketu: <strong style={{ color:TXT }}>{ketu}</strong> House {ketuH}</div>
                    </div>
                  ))}
                </div>
                {r.rahu_ketu?.karmic_connection && (
                  <div style={{ padding:"8px 12px", background:"#c9973a22", borderRadius:6,
                                 color:GSFT, fontSize:13, fontWeight:"bold", marginBottom:12 }}>
                    ✦ Strong Past-Life Karmic Bond Detected
                  </div>
                )}
                <div style={{ color:MUTED, fontSize:13, lineHeight:1.7 }}>{r.rahu_ketu?.desc}</div>
              </div>
            </InfoSection>

            {/* ── AI Pandit Reading ── */}
            <div style={{ background:CARD, border:`1px solid ${G}66`, borderRadius:20,
                          padding:"28px 28px", marginTop:24 }}>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <div style={{ fontSize:32, color:G }}>ॐ</div>
                <h2 style={{ color:GSFT, fontSize:22, margin:"6px 0 4px", fontFamily:"Georgia,serif" }}>
                  Pandit's Vachana — Complete Compatibility Reading
                </h2>
                <p style={{ color:MUTED, fontSize:13, fontFamily:"system-ui,sans-serif", maxWidth:560, margin:"0 auto" }}>
                  10-section analysis: Moon · Rajju/Vedha · Doshas with Remedies · 7th House ·
                  Venus · Darakaraka · Lagna · Past-Life Karma · Dasha Timing · Blessings
                </p>
              </div>

              {!aiText && (
                <button onClick={handleAI} disabled={aiLoading} className="btn-shimmer"
                        style={{ display:"block", margin:"0 auto", padding:"14px 40px",
                                  background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
                                  border:`1px solid ${G}`, borderRadius:10, color:GSFT,
                                  fontSize:15, fontWeight:"bold", cursor:"pointer", letterSpacing:1 }}>
                  {aiLoading ? "Consulting the Pandit…" : "✦ Get Complete Pandit Reading"}
                </button>
              )}

              {aiLoading && !aiText && (
                <div style={{ color:G, fontSize:13, textAlign:"center", marginTop:12 }}>
                  ✦ The Pandit is consulting the charts…
                </div>
              )}

              {aiText && (
                <div style={{ color:TXT, fontSize:14, lineHeight:1.9, fontFamily:"system-ui,sans-serif" }}
                     ref={aiRef}>
                  <span dangerouslySetInnerHTML={{ __html: aiText
                    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f0d080">$1</strong>')
                    .replace(/\n/g, '<br/>') }} />
                  {aiLoading && <span className="blink-cursor" />}
                </div>
              )}
            </div>

            {/* ── Disclaimer ── */}
            <div style={{ textAlign:"center", marginTop:24, color:"#4a3020", fontSize:11,
                           fontFamily:"system-ui,sans-serif", lineHeight:1.6 }}>
              This analysis is for spiritual guidance only, based on classical Vedic texts.
              It does not substitute for the judgment of a learned Jyotishi.<br/>
              Made with devotion · Pavitra Jyotish ॐ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
