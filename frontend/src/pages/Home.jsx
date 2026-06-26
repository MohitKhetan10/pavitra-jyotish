import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon:"🔮",
    title:"Birth Chart Analysis",
    subtitle:"Janma Kundali",
    desc:"Your complete Vedic birth chart — all planetary positions, all 12 houses, yogas, Vimshottari dasha timeline, and classical remedies. Sidereal · Lahiri Ayanamsa · Whole Sign.",
    link:"/kundali",
    cta:"Get My Chart →",
    points:["All 9 planets + Lagna", "Active Mahadasha & Antardasha", "Yogas present in your chart", "Classical remedies for every planet", "Deep Vedic Pandit reading"],
  },
  {
    icon:"💑",
    title:"Kundali Matching",
    subtitle:"Ashtakoot Milan",
    desc:"Traditional 8-fold Vedic compatibility analysis. Enter both birth details and receive a complete Ashtakoot report with dosha analysis and a detailed AI compatibility reading.",
    link:"/matching",
    cta:"Check Compatibility →",
    points:["Full Ashtakoot (36 points)", "All 8 kootas scored", "Mangal, Nadi & Bhakoot Dosha", "Moon sign compatibility", "Vedic Pandit compatibility reading"],
  },
];

const PRINCIPLES = [
  { icon:"✦", title:"Ancient & Authentic", desc:"Rooted in the living tradition of Jyotish — every calculation, every interpretation, every remedy drawn from the original Sanskrit shastras." },
  { icon:"✦", title:"Classical & Accurate", desc:"Built on Brihat Parashara Hora Shastra, Swiss Ephemeris, and Lahiri Ayanamsa — the same standards used by learned Jyotishis worldwide." },
  { icon:"✦", title:"For All Humans", desc:"Astrology is a gift to all of humanity. We do not charge for wisdom. Whether you are from Nepal, India, or any corner of the world — this is yours." },
  { icon:"✦", title:"Remedies That Work", desc:"Classical remedies grounded in devotion and simplicity — mantras, daan, fasting, flowers, and puja. Nothing commercial. Nothing harmful." },
];

export default function Home() {
  return (
    <div style={S.page}>

      {/* ── HERO ── */}
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.om}>ॐ</div>
          <h1 style={S.title}>Pavitra Jyotish</h1>
          <p style={S.tagline}>पवित्र ज्योतिष — Pure Vedic Astrology</p>
          <p style={S.sub}>
            Authentic Vedic birth chart analysis and Kundali matching —
            classical, precise, and open to every human being on Earth.
          </p>
          <div style={S.heroBtns}>
            <Link to="/kundali"  style={S.btnPrimary}>Get My Birth Chart</Link>
            <Link to="/matching" style={S.btnSecondary}>Check Kundali Matching</Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={S.trustBar}>
        {[
          "🔮 Sidereal · Lahiri Ayanamsa",
          "📿 Classical BPHS Tradition",
          "✦ Open to All of Humanity",
          "✦ Deep Vedic Interpretation",
          "🌍 Worldwide Access",
        ].map(t => <span key={t} style={S.trustItem}>{t}</span>)}
      </div>

      {/* ── FEATURES ── */}
      <section style={S.featureSection}>
        {FEATURES.map(f => (
          <div key={f.title} style={S.featureCard}>
            <div style={S.featureIcon}>{f.icon}</div>
            <div style={S.featureSubtitle}>{f.subtitle}</div>
            <h2 style={S.featureTitle}>{f.title}</h2>
            <p style={S.featureDesc}>{f.desc}</p>
            <ul style={S.pointList}>
              {f.points.map(p => (
                <li key={p} style={S.point}>✦ {p}</li>
              ))}
            </ul>
            <Link to={f.link} style={S.featureBtn}>{f.cta}</Link>
          </div>
        ))}
      </section>

      {/* ── OUR PRINCIPLES ── */}
      <section style={S.principles}>
        <div style={S.principlesInner}>
          <h2 style={S.secTitle}>Our Principles</h2>
          <p style={S.secSub}>The principles that guide every reading on this site</p>
          <div style={S.principleGrid}>
            {PRINCIPLES.map(p => (
              <div key={p.title} style={S.principleCard}>
                <span style={S.principleIcon}>{p.icon}</span>
                <h3 style={S.principleTitle}>{p.title}</h3>
                <p style={S.principleDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section style={S.quoteSection}>
        <div style={S.quoteInner}>
          <div style={S.quoteOM}>ॐ</div>
          <blockquote style={S.quote}>
            "Jyotish is the eye of the Vedas. It reveals the path of dharma,
            illuminates karma, and shows the way to moksha. It belongs to all."
          </blockquote>
          <p style={S.quoteSource}>— Brihat Parashara Hora Shastra</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={S.footer}>
        <div style={S.footerOM}>ॐ</div>
        <p style={S.footerText}>Pavitra Jyotish · पवित्र ज्योतिष</p>
        <p style={S.footerSub}>Classical Vedic Astrology · Built with devotion</p>
      </footer>
    </div>
  );
}

const G = "#c9973a", GSFT = "#f0d080", DEEP = "#0a0300", TXT = "#fdf0d5", MUTED = "#b89060";
const S = {
  page:    { background:DEEP, minHeight:"100vh" },

  hero:    { background:`linear-gradient(160deg,#1a0500 0%,#0a0200 60%,#001408 100%)`,
             borderBottom:`1px solid ${G}33`, padding:"100px 24px 80px" },
  heroInner:{ maxWidth:760, margin:"0 auto", textAlign:"center" },
  om:      { fontSize:60, color:G, lineHeight:1, marginBottom:8 },
  title:   { fontSize:68, fontWeight:"bold", color:GSFT, margin:"0 0 6px", letterSpacing:3,
             fontFamily:"Georgia,serif" },
  tagline: { fontSize:20, color:G, margin:"0 0 20px", letterSpacing:2 },
  sub:     { fontSize:17, color:MUTED, lineHeight:1.9, margin:"0 0 36px",
             fontFamily:"system-ui,sans-serif" },
  heroBtns:{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" },
  btnPrimary:{ padding:"15px 36px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
               border:`1px solid ${G}`, borderRadius:10, color:GSFT, fontSize:15,
               fontWeight:"bold", cursor:"pointer", letterSpacing:1, display:"inline-block",
               textDecoration:"none" },
  btnSecondary:{ padding:"15px 36px", background:"transparent", border:`1px solid ${G}55`,
               borderRadius:10, color:MUTED, fontSize:15, cursor:"pointer",
               letterSpacing:1, display:"inline-block", textDecoration:"none" },

  trustBar:{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:20,
             padding:"14px 24px", background:"#0f0500", borderBottom:`1px solid ${G}22` },
  trustItem:{ color:MUTED, fontSize:12, fontFamily:"system-ui,sans-serif" },

  featureSection:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24,
                   padding:"60px 40px", maxWidth:1100, margin:"0 auto" },
  featureCard:   { background:"#150900", border:`1px solid ${G}44`, borderRadius:20,
                   padding:"36px 32px", display:"flex", flexDirection:"column" },
  featureIcon:   { fontSize:40, marginBottom:12 },
  featureSubtitle:{ fontSize:11, color:G, textTransform:"uppercase", letterSpacing:2,
                    fontFamily:"system-ui,sans-serif", marginBottom:4 },
  featureTitle:  { fontSize:28, fontWeight:"bold", color:GSFT, margin:"0 0 14px",
                   fontFamily:"Georgia,serif" },
  featureDesc:   { color:MUTED, fontSize:14, lineHeight:1.8, margin:"0 0 20px",
                   fontFamily:"system-ui,sans-serif", flex:1 },
  pointList:     { listStyle:"none", padding:0, margin:"0 0 28px", display:"flex",
                   flexDirection:"column", gap:6 },
  point:         { color:TXT, fontSize:13, fontFamily:"system-ui,sans-serif" },
  featureBtn:    { padding:"12px 24px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
                   border:`1px solid ${G}`, borderRadius:8, color:GSFT, fontSize:14,
                   fontWeight:"bold", cursor:"pointer", textDecoration:"none",
                   display:"inline-block", textAlign:"center", letterSpacing:1 },

  principles:      { background:"#0f0500", borderTop:`1px solid ${G}22`, borderBottom:`1px solid ${G}22`,
                     padding:"60px 24px" },
  principlesInner: { maxWidth:1100, margin:"0 auto" },
  secTitle:        { fontSize:32, color:GSFT, marginBottom:8, fontWeight:"bold", textAlign:"center" },
  secSub:          { color:MUTED, marginBottom:36, fontSize:15, fontFamily:"system-ui,sans-serif",
                     textAlign:"center" },
  principleGrid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:20 },
  principleCard:   { padding:"24px", background:"#150900", borderRadius:14, border:`1px solid ${G}22` },
  principleIcon:   { fontSize:20, color:G, display:"block", marginBottom:10 },
  principleTitle:  { color:GSFT, fontWeight:"bold", fontSize:16, margin:"0 0 8px" },
  principleDesc:   { color:MUTED, fontSize:13, lineHeight:1.7, fontFamily:"system-ui,sans-serif" },

  quoteSection:  { padding:"80px 40px" },
  quoteInner:    { maxWidth:700, margin:"0 auto", textAlign:"center" },
  quoteOM:       { fontSize:36, color:G, marginBottom:16 },
  quote:         { fontSize:18, color:TXT, lineHeight:1.9, fontStyle:"italic",
                   border:"none", margin:"0 0 16px", padding:0 },
  quoteSource:   { color:MUTED, fontSize:13, fontFamily:"system-ui,sans-serif" },

  footer:    { textAlign:"center", padding:"40px 24px", borderTop:`1px solid ${G}22` },
  footerOM:  { fontSize:32, color:G, marginBottom:8 },
  footerText:{ color:MUTED, fontSize:14, fontFamily:"system-ui,sans-serif" },
  footerSub: { color:"#4a3020", fontSize:12, marginTop:4, fontFamily:"system-ui,sans-serif" },
};
