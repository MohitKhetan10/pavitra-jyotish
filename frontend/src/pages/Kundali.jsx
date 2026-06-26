import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "/api";

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

const PS = {
  Sun:     { bg:"#3d1200", border:"#ff8c00", text:"#ffcc88" },
  Moon:    { bg:"#08082a", border:"#8888ee", text:"#bbbbff" },
  Mars:    { bg:"#2a0000", border:"#cc3300", text:"#ff8866" },
  Mercury: { bg:"#002a10", border:"#00aa55", text:"#55dd99" },
  Jupiter: { bg:"#2a2000", border:"#ddaa00", text:"#ffdd66" },
  Venus:   { bg:"#2a0022", border:"#ee55aa", text:"#ffaadd" },
  Saturn:  { bg:"#0a1020", border:"#5577aa", text:"#88aacc" },
  Rahu:    { bg:"#180028", border:"#8844cc", text:"#bb88ee" },
  Ketu:    { bg:"#201000", border:"#996633", text:"#cc9966" },
};

const SYM = {
  Sun:"☉", Moon:"☽", Mars:"♂", Mercury:"☿", Jupiter:"♃",
  Venus:"♀", Saturn:"♄", Rahu:"☊", Ketu:"☋",
};

const SIGN_ORDER = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];
const SIGN_ABBR = {
  Aries:"Ari",Taurus:"Tau",Gemini:"Gem",Cancer:"Can",Leo:"Leo",
  Virgo:"Vir",Libra:"Lib",Scorpio:"Sco",Sagittarius:"Sag",
  Capricorn:"Cap",Aquarius:"Aqu",Pisces:"Pis"
};

// South Indian chart: cell-index → sign-index (-1 = blank center)
const SOUTH_GRID = [11,0,1,2, 10,-1,-1,3, 9,-1,-1,4, 8,7,6,5];

function guessTz() {
  const off = -(new Date().getTimezoneOffset() / 60);
  return String(TIMEZONES.find(z => z.offset === off)?.offset ?? off);
}

function formatMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function dignityColor(d) {
  if (d === "Exalted")     return "#44cc88";
  if (d === "Own Sign")    return "#44cc88";
  if (d === "Debilitated") return "#ff6644";
  if (d === "Friendly Sign") return "#ffdd66";
  return "#c9973a";
}

function dignityBg(d) {
  if (d === "Exalted")     return "#003300";
  if (d === "Own Sign")    return "#002200";
  if (d === "Debilitated") return "#330000";
  return "#1a1000";
}

// ── South Indian birth chart grid ────────────────────────────────────────────
function SouthChart({ chart }) {
  const lagnaIdx = SIGN_ORDER.indexOf(chart.lagna.sign_en);
  const bySign = {};
  for (const p of chart.planets) {
    const si = SIGN_ORDER.indexOf(p.sign_en);
    if (!bySign[si]) bySign[si] = [];
    bySign[si].push(p);
  }

  return (
    <div style={{
      display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2,
      border:`1px solid ${G}44`, borderRadius:10, overflow:"hidden",
      background:"#080300",
    }}>
      {SOUTH_GRID.map((si, pos) => {
        if (si === -1) {
          return (
            <div key={pos} style={{
              background:"#060200", aspectRatio:"1",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {pos === 5 && (
                <div style={{color:`${G}44`, fontSize:9, textAlign:"center", lineHeight:1.6}}>
                  ॐ<br/>Janma<br/>Kundali
                </div>
              )}
            </div>
          );
        }
        const isLagna = si === lagnaIdx;
        const houseNum = (si - lagnaIdx + 12) % 12 + 1;
        const planets = bySign[si] || [];
        return (
          <div key={pos} style={{
            background: isLagna ? "#2a1200" : "#0e0400",
            border: isLagna ? `1px solid ${G}` : `1px solid ${G}22`,
            padding:"6px 5px", minHeight:62,
            display:"flex", flexDirection:"column", alignItems:"center",
          }}>
            <div style={{fontSize:9, color: isLagna ? G : "#5a3a10", fontWeight:"bold", letterSpacing:0.5}}>
              {SIGN_ABBR[SIGN_ORDER[si]]} · H{houseNum}
            </div>
            {isLagna && <div style={{fontSize:8, color:"#ff8c00", fontWeight:"bold", marginBottom:2}}>LAGNA</div>}
            <div style={{display:"flex", flexWrap:"wrap", justifyContent:"center", gap:1, marginTop:2}}>
              {planets.map(p => (
                <span key={p.name} title={p.name} style={{
                  fontSize:13, color: PS[p.name]?.border || "#aaa", lineHeight:1.3,
                }}>
                  {SYM[p.name]}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Planet card (expandable) ───────────────────────────────────────────────
function PlanetCard({ p, rd, expanded, onToggle }) {
  const ps = PS[p.name] || { bg:"#111", border:"#555", text:"#ccc" };
  return (
    <div
      style={{
        ...S.planetCard,
        background: ps.bg,
        borderColor: expanded ? ps.border : ps.border + "66",
        boxShadow: expanded ? `0 0 24px ${ps.border}33` : "none",
        gridColumn: expanded ? "1 / -1" : "auto",
        cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s",
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div style={S.pcHeader}>
        <span style={{fontSize:26, color:ps.border}}>{SYM[p.name]}</span>
        <div style={{flex:1, paddingLeft:10}}>
          <div style={{color:ps.text, fontWeight:"bold", fontSize:15}}>{p.name}</div>
          <div style={{color:ps.border, fontSize:13}}>{p.sign_en}</div>
        </div>
        <div style={{textAlign:"right", marginRight:10}}>
          <div style={{color:MUTED, fontSize:12}}>{p.degree_in_sign}° · H{p.house}</div>
          <div style={{color:MUTED, fontSize:12}}>{p.nakshatra} P{p.pada}</div>
          <div style={{color:MUTED, fontSize:11}}>D9: {p.navamsa_sign}</div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end"}}>
          {p.retrograde && <span style={S.badgeR}>℞ Retro</span>}
          {p.combust    && <span style={S.badgeC}>☀ Combust</span>}
          <span style={{color:ps.border, fontSize:16}}>{expanded ? "▾" : "▸"}</span>
        </div>
      </div>

      {/* Dignity bar */}
      {rd?.dignity && (
        <div style={{
          display:"inline-block", fontSize:11, padding:"2px 10px",
          borderRadius:6, marginTop:6,
          background: dignityBg(rd.dignity),
          border:`1px solid ${dignityColor(rd.dignity)}44`,
          color: dignityColor(rd.dignity),
        }}>
          {rd.status}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{marginTop:16, borderTop:`1px solid ${ps.border}33`, paddingTop:14}}>
          {rd?.nakshatra_meaning && (
            <div style={S.expBlock}>
              <div style={{...S.expLabel, color:ps.border}}>Nakshatra — {p.nakshatra}</div>
              <div style={S.expText}>{rd.nakshatra_meaning}</div>
              {rd.nakshatra_deity && (
                <div style={S.expMeta}>Deity: {rd.nakshatra_deity} · Lord: {rd.nakshatra_lord}</div>
              )}
            </div>
          )}
          {rd?.in_sign && (
            <div style={S.expBlock}>
              <div style={{...S.expLabel, color:ps.border}}>{p.name} in {p.sign_en}</div>
              <div style={S.expText}>{rd.in_sign}</div>
            </div>
          )}
          {rd?.in_house && (
            <div style={S.expBlock}>
              <div style={{...S.expLabel, color:ps.border}}>{p.name} in House {p.house}</div>
              <div style={S.expText}>{rd.in_house}</div>
            </div>
          )}
          {rd?.retro_note && (
            <div style={{...S.expBlock, borderLeft:"2px solid #8888ee", paddingLeft:12}}>
              <div style={{...S.expText, color:"#bbbbff"}}>{rd.retro_note}</div>
            </div>
          )}
          {rd?.combust_note && (
            <div style={{...S.expBlock, borderLeft:"2px solid #ff8c00", paddingLeft:12}}>
              <div style={{...S.expText, color:"#ffcc88"}}>{rd.combust_note}</div>
            </div>
          )}
          {rd?.remedy && (
            <div style={{...S.expBlock, background:"#1a0800", borderRadius:8, padding:"10px 14px", marginTop:10}}>
              <span style={{color:G, fontSize:11, textTransform:"uppercase", letterSpacing:1}}>Quick Remedy · </span>
              <span style={{color:MUTED, fontSize:12}}>
                {rd.remedy.day} fast · {rd.remedy.mantra?.slice(0,70)}… · Stone: {rd.remedy.stone}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── House card (expandable) ────────────────────────────────────────────────
function HouseCard({ h, rd, reportPlanets, expanded, onToggle }) {
  return (
    <div
      style={{
        ...S.houseCard,
        borderColor: expanded ? G : G + "33",
        boxShadow: expanded ? `0 0 20px ${G}22` : "none",
        gridColumn: expanded ? "1 / -1" : "auto",
        cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s",
      }}
      onClick={onToggle}
    >
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
        <div>
          <div style={{color:G, fontWeight:"bold", fontSize:14}}>House {h.house}</div>
          <div style={{color:MUTED, fontSize:11, margin:"2px 0 6px", lineHeight:1.4}}>
            {h.significance}
          </div>
          <div style={{color:TXT, fontSize:13}}>
            {h.sign_en} · Lord: <b style={{color:G}}>{h.lord}</b>
          </div>
        </div>
        <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4}}>
          <div style={{display:"flex", flexWrap:"wrap", gap:3, justifyContent:"flex-end"}}>
            {h.planets.length
              ? h.planets.map(pn => (
                  <span key={pn} style={{
                    fontSize:13, color:PS[pn]?.border||"#aaa",
                  }} title={pn}>
                    {SYM[pn]}
                  </span>
                ))
              : <span style={{fontSize:11, color:"#3a2010", fontStyle:"italic"}}>Empty</span>}
          </div>
          <span style={{color:G, fontSize:16}}>{expanded ? "▾" : "▸"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{marginTop:14, borderTop:`1px solid ${G}33`, paddingTop:14}}>
          {rd?.lord_position && (
            <div style={S.expBlock}>
              <div style={S.expLabel}>Lord Position</div>
              <div style={S.expText}>{rd.lord_position}</div>
            </div>
          )}
          {rd?.karaka && (
            <div style={S.expBlock}>
              <div style={S.expLabel}>House Significance</div>
              <div style={S.expText}>{rd.karaka}</div>
            </div>
          )}
          {h.planets.length > 0 && (
            <div style={S.expBlock}>
              <div style={S.expLabel}>Planets Occupying This House</div>
              {h.planets.map(pn => {
                const pd = reportPlanets?.[pn] || {};
                const ps = PS[pn] || {};
                return (
                  <div key={pn} style={{marginBottom:10}}>
                    <div style={{color:ps.border||G, fontWeight:"bold", fontSize:13, marginBottom:3}}>
                      {SYM[pn]} {pn} — {pd.status}
                    </div>
                    <div style={{color:TXT, fontSize:13, lineHeight:1.7, fontFamily:"system-ui,sans-serif"}}>
                      {pd.in_house}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Remedy accordion card ──────────────────────────────────────────────────
function RemedyCard({ pname, pd, expanded, onToggle }) {
  const r = pd.remedy;
  if (!r) return null;
  const ps = PS[pname] || { border:"#555", text:"#ccc" };
  return (
    <div
      style={{
        ...S.remedyCard,
        borderLeftColor: ps.border,
        cursor:"pointer",
      }}
      onClick={onToggle}
    >
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{color:ps.border, fontWeight:"bold", fontSize:14}}>
          {SYM[pname]} {pname}
          <span style={{color:MUTED, fontWeight:"normal", fontSize:12, marginLeft:8}}>— {pd.status}</span>
        </div>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <span style={{color:MUTED, fontSize:12}}>{r.day} · {r.stone}</span>
          <span style={{color:G, fontSize:16}}>{expanded ? "▾" : "▸"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{marginTop:12}}>
          <div style={S.remedyGrid}>
            <div><span style={S.rlabel}>Fast Day</span><p style={S.rpText}>{r.day}</p></div>
            <div><span style={S.rlabel}>Color</span><p style={S.rpText}>{r.color}</p></div>
            <div><span style={S.rlabel}>Gemstone</span><p style={S.rpText}>{r.stone}</p></div>
            <div><span style={S.rlabel}>Metal</span><p style={S.rpText}>{r.metal}</p></div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={S.rlabel}>Mantra (108×)</span>
              <p style={{...S.rpText, fontStyle:"italic", fontSize:14, color:G}}>{r.mantra}</p>
            </div>
            <div><span style={S.rlabel}>Grain</span><p style={S.rpText}>{r.grain}</p></div>
            <div><span style={S.rlabel}>Flower</span><p style={S.rpText}>{r.flower}</p></div>
            <div style={{gridColumn:"1/-1"}}>
              <span style={S.rlabel}>Donation (Daan)</span>
              <p style={S.rpText}>{r.donation}</p>
            </div>
            {r.puja && (
              <div style={{gridColumn:"1/-1"}}>
                <span style={S.rlabel}>Puja</span>
                <p style={S.rpText}>{r.puja}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Kundali() {
  const [form, setForm] = useState({
    year:"1990", month:"1", day:"15", hour:"10", minute:"30",
    lat:"27.7172", lon:"85.3240", tz_offset: guessTz(),
  });
  const [chart, setChart]     = useState(null);
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [expandedPlanet, setExpandedPlanet] = useState(null);
  const [expandedHouse, setExpandedHouse]   = useState(null);
  const [expandedRemedy, setExpandedRemedy] = useState(null);
  const [interpretation, setInterp] = useState("");
  const [interpreting, setInterping] = useState(false);
  const [birthParams, setBirthParams] = useState(null);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  function parseParams() {
    const p = {
      year:parseInt(form.year), month:parseInt(form.month), day:parseInt(form.day),
      hour:parseInt(form.hour), minute:parseInt(form.minute),
      lat:parseFloat(form.lat), lon:parseFloat(form.lon),
      tz_offset:parseFloat(form.tz_offset),
    };
    if (p.year<1800||p.year>2100) throw new Error("Year must be 1800–2100");
    if (p.month<1||p.month>12)    throw new Error("Month must be 1–12");
    if (p.day<1||p.day>31)        throw new Error("Day must be 1–31");
    if (p.hour<0||p.hour>23)      throw new Error("Hour must be 0–23");
    if (p.minute<0||p.minute>59)  throw new Error("Minute must be 0–59");
    if (isNaN(p.lat)||isNaN(p.lon)) throw new Error("Enter valid latitude / longitude");
    return p;
  }

  async function generate() {
    setLoading(true); setError(""); setChart(null); setReport(null);
    setInterp(""); setExpandedPlanet(null); setExpandedHouse(null); setExpandedRemedy(null);
    try {
      const p = parseParams();
      setBirthParams(p);
      const [cr, rr] = await Promise.all([
        fetch(`${API}/chart`,  { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(p) }),
        fetch(`${API}/report`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(p) }),
      ]);
      if (!cr.ok) throw new Error(await cr.text());
      if (!rr.ok) throw new Error(await rr.text());
      const [chartData, reportData] = await Promise.all([cr.json(), rr.json()]);
      setChart(chartData);
      setReport(reportData);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function getInterpretation() {
    if (!chart) return;
    setInterping(true); setInterp("");
    try {
      const res = await fetch(`${API}/interpret`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(chart),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setInterp(prev => prev + dec.decode(value));
      }
    } catch(e) { setInterp("Error: " + e.message); }
    finally { setInterping(false); }
  }

  return (
    <div style={S.page}>

      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.om}>ॐ</div>
        <h1 style={S.title}>Janma Kundali</h1>
        <p style={S.subtitle}>Vedic Birth Chart · Sidereal · Lahiri Ayanamsa · Deep Classical Analysis</p>
      </header>

      {/* ── BIRTH FORM ── */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>Enter Birth Details</h2>
        <div style={S.formGrid}>
          {[
            ["year","Birth Year","number","1800","2100"],
            ["month","Month (1–12)","number","1","12"],
            ["day","Day (1–31)","number","1","31"],
            ["hour","Hour (0–23)","number","0","23"],
            ["minute","Minute (0–59)","number","0","59"],
            ["lat","Latitude","text"],
            ["lon","Longitude","text"],
          ].map(([k,label,type,min,max]) => (
            <label key={k} style={S.field}>
              <span style={S.flabel}>{label}</span>
              <input style={S.input} type={type} min={min} max={max}
                value={form[k]} onChange={set(k)} />
            </label>
          ))}
          <label style={S.field}>
            <span style={S.flabel}>Birth Timezone</span>
            <select style={S.select} value={form.tz_offset} onChange={set("tz_offset")}>
              {TIMEZONES.map((z,i) =>
                <option key={i} value={String(z.offset)}>{z.label}</option>
              )}
            </select>
          </label>
        </div>
        <button style={loading ? S.btnOff : S.btn} onClick={generate} disabled={loading}>
          {loading ? "⟳  Computing planetary positions…" : "✦  Reveal My Kundali"}
        </button>
        {error && <p style={S.err}>⚠ {error}</p>}
      </div>

      {/* ── RESULTS ── */}
      {chart && report && (
        <div>

          {/* ── SUMMARY BANNER ── */}
          <div style={S.summaryRow}>
            {[
              { label:"Lagna · Rising Sign", value:chart.lagna.sign_en,
                sub:`${chart.lagna.degree_in_sign}° · ${chart.lagna.nakshatra} P${chart.lagna.pada}` },
              { label:"Lagna Lord", value:`${chart.lagna.lord}`,
                sub:`Ayanamsa: ${chart.ayanamsa}°` },
              { label:"Mahadasha",  value:chart.current_dasha?.lord || "—",
                sub:`until ${chart.current_dasha?.end||""}` },
              { label:"Antardasha", value:chart.current_antardasha?.lord || "—",
                sub: chart.current_antardasha ? `until ${chart.current_antardasha.end}` : "" },
            ].map((item,i) => (
              <div key={i} style={S.summaryCard}>
                <div style={S.sumLabel}>{item.label}</div>
                <div style={S.sumVal}>{item.value}</div>
                <div style={S.sumSub}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* synthesis */}
          {report.synthesis?.summary && (
            <div style={S.synthBox}>
              <p style={{color:TXT, fontSize:14, lineHeight:1.8, fontFamily:"system-ui,sans-serif", margin:0}}>
                {report.synthesis.summary}
              </p>
              <div style={{display:"flex", flexWrap:"wrap", gap:8, marginTop:12}}>
                {report.synthesis.strong_planets?.length > 0 && (
                  <span style={{...S.synBadge, borderColor:"#00aa55", color:"#44cc88"}}>
                    ✦ Strong: {report.synthesis.strong_planets.join(", ")}
                  </span>
                )}
                {report.synthesis.weak_planets?.length > 0 && (
                  <span style={{...S.synBadge, borderColor:"#cc3300", color:"#ff6644"}}>
                    ⚠ Debilitated: {report.synthesis.weak_planets.join(", ")}
                  </span>
                )}
                {report.synthesis.retro_planets?.length > 0 && (
                  <span style={{...S.synBadge, borderColor:"#8888ee", color:"#aaaaff"}}>
                    ℞ Retrograde: {report.synthesis.retro_planets.join(", ")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── CHART + YOGAS ── */}
          <div style={S.chartYogaRow}>
            <div style={S.chartBox}>
              <h2 style={S.secTitle}>Birth Chart (South Indian)</h2>
              <SouthChart chart={chart} />
              <p style={{color:MUTED, fontSize:11, textAlign:"center", marginTop:8}}>
                Sidereal · Lahiri Ayanamsa · Whole Sign Houses
              </p>
            </div>

            {chart.yogas?.length > 0 ? (
              <div style={S.yogaBox}>
                <h2 style={S.secTitle}>✦ Yogas Present</h2>
                {chart.yogas.map((y,i) => (
                  <div key={i} style={S.yogaCard}>
                    <div style={{color:G, fontWeight:"bold", fontSize:14, marginBottom:2}}>{y.name}</div>
                    <div style={{color:MUTED, fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:6}}>{y.type}</div>
                    <div style={{color:TXT, fontSize:12, lineHeight:1.6, fontFamily:"system-ui,sans-serif"}}>{y.desc}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={S.yogaBox}>
                <h2 style={S.secTitle}>Yogas</h2>
                <p style={{color:MUTED, fontSize:13}}>No major yogas detected in this chart. Each chart is unique — strength lies in planetary placements.</p>
              </div>
            )}
          </div>

          {/* ── PLANETS ── */}
          <div style={S.section}>
            <h2 style={S.secTitle}>Graha — Planetary Positions</h2>
            <p style={S.hint}>Click any planet card to see its full classical interpretation</p>
            <div style={S.planetGrid}>
              {chart.planets.map(p => (
                <PlanetCard
                  key={p.name}
                  p={p}
                  rd={report.planets?.[p.name]}
                  expanded={expandedPlanet === p.name}
                  onToggle={() => setExpandedPlanet(expandedPlanet === p.name ? null : p.name)}
                />
              ))}
            </div>
          </div>

          {/* ── HOUSES ── */}
          <div style={S.section}>
            <h2 style={S.secTitle}>Bhava — All 12 Houses</h2>
            <p style={S.hint}>Click any house to see its detailed effects on that area of life</p>
            <div style={S.houseGrid}>
              {chart.houses.map(h => (
                <HouseCard
                  key={h.house}
                  h={h}
                  rd={report.houses?.[h.house]}
                  reportPlanets={report.planets}
                  expanded={expandedHouse === h.house}
                  onToggle={() => setExpandedHouse(expandedHouse === h.house ? null : h.house)}
                />
              ))}
            </div>
          </div>

          {/* ── DASHA ── */}
          <div style={S.section}>
            <h2 style={S.secTitle}>Vimshottari Dasha Timeline</h2>

            {report.dasha?.mahadasha_core && (
              <div style={S.dashaCurrentBox}>
                <div style={{color:G, fontSize:13, fontWeight:"bold", marginBottom:4}}>Currently Active</div>
                <div style={{color:GSFT, fontSize:18, fontWeight:"bold", marginBottom:8}}>
                  {report.dasha.mahadasha_title}
                </div>
                <p style={{color:TXT, fontSize:13, lineHeight:1.8, fontFamily:"system-ui,sans-serif", margin:"0 0 12px"}}>
                  {report.dasha.mahadasha_core}
                </p>
                {report.dasha.antardasha_lord && (
                  <>
                    <div style={{color:GSFT, fontSize:15, fontWeight:"bold", margin:"12px 0 6px"}}>
                      {report.dasha.antardasha_title}
                    </div>
                    <p style={{color:TXT, fontSize:13, lineHeight:1.8, fontFamily:"system-ui,sans-serif", margin:"0 0 12px"}}>
                      {report.dasha.antardasha_synthesis}
                    </p>
                  </>
                )}
                <div style={{background:"#1a0800", borderRadius:8, padding:"10px 14px"}}>
                  <span style={{color:G, fontSize:11, textTransform:"uppercase", letterSpacing:1}}>Worship · </span>
                  <span style={{color:TXT, fontSize:13}}>{report.dasha.mahadasha_worship}</span>
                </div>
              </div>
            )}

            <h3 style={{color:G, fontSize:14, margin:"20px 0 8px"}}>Mahadasha Timeline</h3>
            <div style={{display:"flex", flexDirection:"column", gap:4}}>
              {chart.vimshottari.map((d,i) => {
                const active = chart.current_dasha && d.start === chart.current_dasha.start;
                return (
                  <div key={i} style={active ? S.dashaActive : S.dashaRow}>
                    <span style={{flex:1, fontWeight: active ? "bold" : "normal"}}>{d.lord}</span>
                    <span style={{flex:2, textAlign:"center", color:MUTED, fontSize:12}}>{d.start} → {d.end}</span>
                    <span style={{textAlign:"right", color:MUTED, fontSize:12}}>{d.years} yrs</span>
                  </div>
                );
              })}
            </div>

            {chart.antardasha?.length > 0 && chart.current_dasha && (
              <>
                <h3 style={{color:G, fontSize:14, margin:"16px 0 8px"}}>
                  Antardasha within {chart.current_dasha.lord} Mahadasha
                </h3>
                <div style={{display:"flex", flexDirection:"column", gap:4}}>
                  {chart.antardasha.map((d,i) => {
                    const active = chart.current_antardasha && d.start === chart.current_antardasha.start;
                    return (
                      <div key={i} style={active ? S.dashaActive : S.dashaRow}>
                        <span style={{flex:1, fontWeight: active ? "bold" : "normal"}}>{d.lord}</span>
                        <span style={{flex:2, textAlign:"center", color:MUTED, fontSize:12}}>{d.start} → {d.end}</span>
                        <span style={{textAlign:"right", color:MUTED, fontSize:12}}>{d.years} yrs</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── REMEDIES ── */}
          <div style={S.section}>
            <h2 style={S.secTitle}>Upaya — Classical Remedies</h2>
            <p style={S.hint}>Click any planet to expand its full remedy prescription</p>
            {Object.entries(report.planets || {}).map(([pname, pd]) => (
              <RemedyCard
                key={pname}
                pname={pname}
                pd={pd}
                expanded={expandedRemedy === pname}
                onToggle={() => setExpandedRemedy(expandedRemedy === pname ? null : pname)}
              />
            ))}
          </div>

          {/* ── PANDIT READING ── */}
          <div style={S.section}>
            <h2 style={S.secTitle}>Pandit's Vachana — Classical Reading</h2>
            <p style={S.hint}>
              Brihat Parashara Hora Shastra · Phaladeepika · Saravali · Jataka Parijata
            </p>
            {!interpretation && !interpreting && (
              <button style={S.aiBtn} onClick={getInterpretation}>
                ✦ Generate Complete Pandit's Reading
              </button>
            )}
            {interpreting && (
              <div style={{color:MUTED, fontSize:15, padding:"24px 0", textAlign:"center", letterSpacing:1}}>
                🕉 &nbsp; The Jyotishi is reading your chart…
              </div>
            )}
            {interpretation && (
              <>
                <div
                  style={S.aiText}
                  dangerouslySetInnerHTML={{__html: formatMd(interpretation)}}
                />
                <button style={{...S.aiBtn, marginTop:16}} onClick={getInterpretation}>
                  ↺ Regenerate Reading
                </button>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────
const G    = "#c9973a";
const GSFT = "#f0d080";
const DEEP = "#0a0300";
const SURF = "#150900";
const SURF2= "#1e0e02";
const TXT  = "#fdf0d5";
const MUTED= "#b89060";

// ── Styles ────────────────────────────────────────────────────────────────
const S = {
  page:    { minHeight:"100vh", background:DEEP, fontFamily:"'Georgia',serif",
             color:TXT, padding:"24px 16px", maxWidth:1100, margin:"0 auto" },
  header:  { textAlign:"center", padding:"32px 0 24px", borderBottom:`1px solid ${G}22` },
  om:      { fontSize:48, color:G, lineHeight:1.2 },
  title:   { fontSize:40, fontWeight:"bold", color:GSFT, margin:"8px 0 4px", letterSpacing:2 },
  subtitle:{ color:MUTED, fontSize:13, margin:0 },

  card:    { background:SURF, borderRadius:16, padding:24, margin:"20px 0",
             border:`1px solid ${G}44`, boxShadow:"0 4px 24px #00000088" },
  cardTitle:{ color:G, fontSize:18, fontWeight:"bold", marginBottom:16, marginTop:0,
              borderBottom:`1px solid ${G}33`, paddingBottom:10 },

  formGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  field:   { display:"flex", flexDirection:"column", gap:5 },
  flabel:  { fontSize:11, color:MUTED, fontWeight:600, textTransform:"uppercase", letterSpacing:1 },
  input:   { padding:"10px 12px", borderRadius:8, border:`1px solid ${G}55`,
             background:"#1e1000", color:TXT, fontSize:14, outline:"none" },
  select:  { padding:"10px 12px", borderRadius:8, border:`1px solid ${G}55`,
             background:"#1e1000", color:TXT, fontSize:13, outline:"none", cursor:"pointer" },
  btn:     { marginTop:20, width:"100%", padding:"14px",
             border:`1px solid ${G}`, borderRadius:10,
             background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
             color:GSFT, fontSize:17, fontWeight:"bold", cursor:"pointer", letterSpacing:1 },
  btnOff:  { marginTop:20, width:"100%", padding:"14px",
             border:`1px solid ${G}44`, borderRadius:10,
             background:"#1e1000", color:MUTED, fontSize:17, cursor:"not-allowed" },
  err:     { color:"#ff6655", marginTop:12, textAlign:"center", fontSize:14 },

  // summary
  summaryRow:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, margin:"20px 0" },
  summaryCard:{ background:SURF, border:`1px solid ${G}44`, borderRadius:12, padding:"16px 18px",
                textAlign:"center" },
  sumLabel:{ fontSize:10, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:4 },
  sumVal:  { fontSize:20, fontWeight:"bold", color:GSFT, marginBottom:2 },
  sumSub:  { fontSize:12, color:MUTED },

  synthBox:{ background:SURF, border:`1px solid ${G}33`, borderRadius:12, padding:"18px 20px",
             margin:"12px 0 20px" },
  synBadge:{ border:"1px solid", borderRadius:8, padding:"3px 12px",
             fontSize:12, fontFamily:"system-ui,sans-serif" },

  // chart + yogas
  chartYogaRow:{ display:"grid", gridTemplateColumns:"320px 1fr", gap:20, margin:"20px 0",
                 alignItems:"start" },
  chartBox:{ background:SURF, border:`1px solid ${G}44`, borderRadius:14, padding:20 },
  yogaBox: { background:SURF, border:`1px solid ${G}44`, borderRadius:14, padding:20 },
  yogaCard:{ background:SURF2, border:`1px solid ${G}33`, borderRadius:10,
             padding:14, marginBottom:10 },

  section: { background:SURF, border:`1px solid ${G}33`, borderRadius:14,
             padding:24, margin:"16px 0" },
  secTitle:{ color:G, fontSize:18, fontWeight:"bold", marginBottom:8, marginTop:0,
             borderBottom:`1px solid ${G}33`, paddingBottom:10 },
  hint:    { color:MUTED, fontSize:12, marginBottom:16, marginTop:-4, fontStyle:"italic" },

  // planets
  planetGrid:{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 },
  planetCard:{ borderRadius:12, padding:14, border:"1px solid",
               boxShadow:"0 2px 12px #00000066" },
  pcHeader:  { display:"flex", alignItems:"flex-start" },
  badgeR:    { background:"#441100", color:"#ff8866", fontSize:10, padding:"2px 7px", borderRadius:4 },
  badgeC:    { background:"#3d2200", color:"#ffaa33", fontSize:10, padding:"2px 7px", borderRadius:4 },

  // houses
  houseGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  houseCard: { background:SURF2, border:"1px solid", borderRadius:12, padding:14 },

  // expanded sections
  expBlock:{ marginBottom:14 },
  expLabel:{ color:G, fontSize:11, textTransform:"uppercase", letterSpacing:1,
             display:"block", marginBottom:4 },
  expText: { color:TXT, fontSize:13, lineHeight:1.7, fontFamily:"system-ui,sans-serif" },
  expMeta: { color:MUTED, fontSize:11, marginTop:4, fontFamily:"system-ui,sans-serif" },

  // dasha
  dashaCurrentBox:{ background:`linear-gradient(135deg,#2a1500,#1a0800)`,
                    border:`1px solid ${G}`, borderRadius:12, padding:"18px 20px", marginBottom:16 },
  dashaRow:       { display:"flex", justifyContent:"space-between", padding:"9px 14px",
                    borderRadius:8, background:SURF2, border:`1px solid ${G}22`, fontSize:14 },
  dashaActive:    { display:"flex", justifyContent:"space-between", padding:"9px 14px",
                    borderRadius:8, background:`linear-gradient(135deg,#5a2a00,#3d1500)`,
                    border:`1px solid ${G}`, fontSize:14, color:GSFT },

  // remedies
  remedyCard:{ background:SURF2, borderLeft:"3px solid",
               borderRadius:"0 10px 10px 0", padding:"14px 16px", marginBottom:8 },
  remedyGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
               gap:10, marginTop:8 },
  rlabel:    { color:G, fontSize:10, textTransform:"uppercase", letterSpacing:1,
               display:"block", marginBottom:2 },
  rpText:    { color:TXT, fontSize:13, lineHeight:1.6, margin:"2px 0 0",
               fontFamily:"system-ui,sans-serif" },

  // AI section
  aiBtn: { padding:"13px 28px",
           background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
           border:`1px solid ${G}`, borderRadius:10, color:GSFT, fontSize:16,
           fontWeight:"bold", cursor:"pointer", letterSpacing:1 },
  aiText:{ color:TXT, fontSize:14, lineHeight:1.9, marginTop:20,
           borderTop:`1px solid ${G}33`, paddingTop:20,
           fontFamily:"system-ui,sans-serif" },
};
