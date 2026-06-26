import { useState } from "react";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [form, setForm] = useState({
    year: 1990, month: 1, day: 15, hour: 10, minute: 30,
    lat: 27.7172, lon: 85.324, tz_offset: 5.75,
  });
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm({ ...form, [k]: parseFloat(e.target.value) });

  async function getChart() {
    setLoading(true); setError(""); setChart(null);
    try {
      const res = await fetch(`${API}/chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Engine error");
      setChart(await res.json());
    } catch (e) {
      setError("Could not reach the engine. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.title}>॥ Janma Kundali ॥</h1>
        <p style={S.sub}>Your real Vedic birth chart — computed, not invented</p>
      </header>

      <div style={S.card}>
        <div style={S.grid}>
          {[
            ["year","Year"],["month","Month"],["day","Day"],
            ["hour","Hour (24h)"],["minute","Minute"],
            ["lat","Latitude"],["lon","Longitude"],["tz_offset","Timezone (+hrs)"],
          ].map(([k,label]) => (
            <label key={k} style={S.field}>
              <span style={S.label}>{label}</span>
              <input style={S.input} type="number" step="any"
                     value={form[k]} onChange={set(k)} />
            </label>
          ))}
        </div>
        <button style={S.btn} onClick={getChart} disabled={loading}>
          {loading ? "Computing the heavens…" : "Reveal My Chart"}
        </button>
        {error && <p style={S.err}>{error}</p>}
      </div>

      {chart && (
        <div style={S.card}>
          <div style={S.lagnaBox}>
            <span style={S.lagnaLabel}>Lagna (Ascendant)</span>
            <span style={S.lagnaSign}>{chart.lagna.sign_en}</span>
            <span style={S.lagnaDeg}>
              {chart.lagna.degree_in_sign}° · {chart.lagna.nakshatra}
            </span>
          </div>

          {chart.current_dasha && (
            <div style={S.dashaNow}>
              You are currently in <b>{chart.current_dasha.lord} Mahadasha</b>,
              running until {chart.current_dasha.end}.
            </div>
          )}

          <h3 style={S.h3}>Planetary Positions</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>{["Graha","Sign","Degree","Nakshatra","Pada","Navamsa",""]
                  .map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {chart.planets.map(p => (
                  <tr key={p.name}>
                    <td style={S.tdName}>{p.name}</td>
                    <td style={S.td}>{p.sign_en}</td>
                    <td style={S.td}>{p.degree_in_sign}°</td>
                    <td style={S.td}>{p.nakshatra}</td>
                    <td style={S.td}>{p.pada}</td>
                    <td style={S.td}>{p.navamsa_sign}</td>
                    <td style={S.td}>{p.retrograde ? "℞" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={S.h3}>Vimshottari Dasha Timeline</h3>
          <div style={S.timeline}>
            {chart.vimshottari.map((d,i) => {
              const active = chart.current_dasha &&
                d.start === chart.current_dasha.start;
              return (
                <div key={i} style={{...S.dashaRow, ...(active?S.dashaActive:{})}}>
                  <span style={S.dashaLord}>{d.lord}</span>
                  <span style={S.dashaDates}>{d.start} → {d.end}</span>
                  <span style={S.dashaYears}>{d.years} yrs</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const SAFFRON = "#d97706", DEEP = "#7c2d12", CREAM = "#fffbf5";
const S = {
  page: { minHeight:"100vh", background:`linear-gradient(160deg,#fff7ed,#fef3c7)`,
          fontFamily:"system-ui,sans-serif", color:DEEP, padding:"32px 16px" },
  header: { textAlign:"center", marginBottom:24 },
  title: { fontSize:36, margin:0, color:DEEP, letterSpacing:1 },
  sub: { color:SAFFRON, marginTop:6, fontSize:15 },
  card: { maxWidth:760, margin:"0 auto 24px", background:CREAM,
          borderRadius:18, padding:24, boxShadow:"0 8px 30px rgba(124,45,18,.10)",
          border:"1px solid #fde68a" },
  grid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  field: { display:"flex", flexDirection:"column", gap:4 },
  label: { fontSize:12, color:SAFFRON, fontWeight:600 },
  input: { padding:"9px 10px", borderRadius:9, border:"1px solid #fcd34d",
           background:"#fff", fontSize:14 },
  btn: { marginTop:18, width:"100%", padding:"13px", border:"none",
         borderRadius:11, background:SAFFRON, color:"#fff", fontSize:16,
         fontWeight:700, cursor:"pointer" },
  err: { color:"#b91c1c", marginTop:10, textAlign:"center" },
  lagnaBox: { display:"flex", flexDirection:"column", alignItems:"center",
              gap:2, padding:"6px 0 16px" },
  lagnaLabel: { fontSize:12, color:SAFFRON, fontWeight:600 },
  lagnaSign: { fontSize:30, fontWeight:800, color:DEEP },
  lagnaDeg: { fontSize:13, color:"#92400e" },
  dashaNow: { background:"#fef3c7", borderRadius:10, padding:"12px 14px",
              textAlign:"center", fontSize:15, marginBottom:8 },
  h3: { color:DEEP, borderBottom:`2px solid #fcd34d`, paddingBottom:6,
        marginTop:22 },
  tableWrap:{ overflowX:"auto" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:14 },
  th: { textAlign:"left", padding:"8px 10px", color:SAFFRON,
        borderBottom:"1px solid #fde68a", fontSize:12 },
  td: { padding:"8px 10px", borderBottom:"1px solid #fef3c7" },
  tdName:{ padding:"8px 10px", borderBottom:"1px solid #fef3c7", fontWeight:700 },
  timeline:{ display:"flex", flexDirection:"column", gap:6, marginTop:10 },
  dashaRow:{ display:"flex", justifyContent:"space-between",
             padding:"10px 14px", borderRadius:9, background:"#fff",
             border:"1px solid #fef3c7" },
  dashaActive:{ background:SAFFRON, color:"#fff", fontWeight:700 },
  dashaLord:{ flex:1 }, dashaDates:{ flex:2, textAlign:"center", fontSize:13 },
  dashaYears:{ flex:1, textAlign:"right" },
};
