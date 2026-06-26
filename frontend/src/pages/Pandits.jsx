import { useState } from "react";

const SPECIALIZATIONS = ["All","Satyanarayan Puja","Griha Pravesh","Bratabandha",
  "Vivah Puja","Shraddha Karma","Navagraha Puja","Kaal Sarpa Dosh","Vastushastra",
  "Rudra Abhishek","Janmashtami","Diwali Puja","General Puja"];

const PANDITS = [
  { id:1, name:"Pt. Ramesh Sharma",    area:"Kathmandu",  lang:["Nepali","Hindi"],
    spec:["Satyanarayan Puja","Griha Pravesh","Navagraha Puja"],
    exp:22, contact:"9841XXXXXX", verified:true,
    note:"Available 7 days a week. Brings own samagri if needed." },
  { id:2, name:"Pt. Gopal Adhikari",   area:"Lalitpur",   lang:["Nepali","Sanskrit"],
    spec:["Vivah Puja","Bratabandha","Shraddha Karma"],
    exp:18, contact:"9851XXXXXX", verified:true,
    note:"Specialises in life-event rituals. Deep Vedic training." },
  { id:3, name:"Pt. Shiva Prasad Jha", area:"Bhaktapur",  lang:["Nepali","Maithili","Hindi"],
    spec:["Rudra Abhishek","Kaal Sarpa Dosh","Shanti Puja"],
    exp:30, contact:"9801XXXXXX", verified:true,
    note:"30 years experience. Expert in Kaal Sarpa and planetary remedies." },
  { id:4, name:"Pt. Krishna Paudel",   area:"Kathmandu",  lang:["Nepali"],
    spec:["General Puja","Diwali Puja","Janmashtami"],
    exp:12, contact:"9861XXXXXX", verified:true,
    note:"Warm and patient pandit. Great for family pujas and festivals." },
  { id:5, name:"Pt. Dinesh Bhattarai", area:"Lalitpur",   lang:["Nepali","Hindi"],
    spec:["Vastushastra","Griha Pravesh","Satyanarayan Puja"],
    exp:16, contact:"9808XXXXXX", verified:true,
    note:"Certified Vastu expert. Available for consultations and pujas." },
];

export default function Pandits() {
  const [spec, setSpec] = useState("All");
  const [area, setArea] = useState("All");

  const areas = ["All", ...new Set(PANDITS.map(p => p.area))];
  const filtered = PANDITS.filter(p =>
    (spec==="All" || p.spec.includes(spec)) &&
    (area==="All" || p.area===area)
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Pandit Directory</h1>
        <p style={S.sub}>Verified pandits for every ritual — listed free, zero commission</p>
        <div style={S.promise}>
          <span>✦ All pandits personally verified</span>
          <span>✦ Pavitra takes zero commission</span>
          <span>✦ Contact directly</span>
          <span>✦ Want to be listed? Contact us</span>
        </div>
      </div>

      <div style={S.filters}>
        <div>
          <div style={S.filterLabel}>Filter by Area</div>
          <div style={S.btnRow}>
            {areas.map(a=>(
              <button key={a} onClick={()=>setArea(a)}
                style={a===area ? {...S.fBtn,...S.fActive} : S.fBtn}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={S.filterLabel}>Filter by Specialization</div>
          <div style={S.btnRow}>
            {SPECIALIZATIONS.map(s=>(
              <button key={s} onClick={()=>setSpec(s)}
                style={s===spec ? {...S.fBtn,...S.fActive} : S.fBtn}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={S.grid}>
        {filtered.map(p=>(
          <div key={p.id} style={S.card}>
            <div style={S.cardTop}>
              <div style={S.avatar}>{p.name.charAt(3)}</div>
              <div>
                <div style={S.pname}>{p.name}</div>
                <div style={S.parea}>📍 {p.area} · {p.exp} years experience</div>
              </div>
              {p.verified && <span style={S.verifiedBadge}>✓ Verified</span>}
            </div>
            <div style={S.specs}>
              {p.spec.map(s=><span key={s} style={S.specTag}>{s}</span>)}
            </div>
            <div style={S.langs}>
              Speaks: {p.lang.join(", ")}
            </div>
            <div style={S.note}>{p.note}</div>
            <div style={S.cardBtns}>
              <a href={`tel:${p.contact}`} style={S.callBtn}>📞 Call</a>
              <a href={`https://wa.me/977${p.contact.slice(1)}`}
                target="_blank" rel="noreferrer" style={S.waBtn}>WhatsApp</a>
            </div>
          </div>
        ))}
      </div>

      <div style={S.listingCTA}>
        <h2 style={S.ctaTitle}>Are you a Pandit?</h2>
        <p style={S.ctaDesc}>
          List your services on Pavitra for free. We take no commission — ever.
          This directory exists to help the community find authentic pandits.
        </p>
        <button style={S.ctaBtn}>Request a Free Listing</button>
      </div>
    </div>
  );
}

const G="#c9973a", GSFT="#f0d080", DEEP="#0a0300", SURF="#150900", TXT="#fdf0d5", MUTED="#b89060";
const S = {
  page:     { background:DEEP, minHeight:"100vh", padding:"24px 32px", maxWidth:1100, margin:"0 auto" },
  header:   { marginBottom:28 },
  title:    { fontSize:36, fontWeight:"bold", color:GSFT, marginBottom:6 },
  sub:      { color:MUTED, fontSize:15, fontFamily:"system-ui,sans-serif", marginBottom:12 },
  promise:  { display:"flex", flexWrap:"wrap", gap:16, color:MUTED, fontSize:12,
              fontFamily:"system-ui,sans-serif", borderTop:`1px solid ${G}22`,
              borderBottom:`1px solid ${G}22`, padding:"10px 0" },
  filters:  { display:"flex", flexDirection:"column", gap:12, marginBottom:24 },
  filterLabel:{ color:G, fontSize:11, textTransform:"uppercase", letterSpacing:1,
              fontFamily:"system-ui,sans-serif", marginBottom:6 },
  btnRow:   { display:"flex", flexWrap:"wrap", gap:6 },
  fBtn:     { padding:"5px 12px", background:"#1e0e02", border:`1px solid ${G}22`,
              borderRadius:16, color:MUTED, fontSize:12, cursor:"pointer",
              fontFamily:"system-ui,sans-serif" },
  fActive:  { background:"#3d1500", border:`1px solid ${G}`, color:G },
  grid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 },
  card:     { background:SURF, border:`1px solid ${G}33`, borderRadius:14, padding:20,
              display:"flex", flexDirection:"column", gap:10 },
  cardTop:  { display:"flex", alignItems:"flex-start", gap:12 },
  avatar:   { width:44, height:44, borderRadius:"50%", background:"#3d1500",
              border:`1px solid ${G}`, display:"flex", alignItems:"center",
              justifyContent:"center", color:G, fontWeight:"bold", fontSize:18, flexShrink:0 },
  pname:    { color:TXT, fontWeight:"bold", fontSize:16 },
  parea:    { color:MUTED, fontSize:12, fontFamily:"system-ui,sans-serif", marginTop:2 },
  verifiedBadge:{ marginLeft:"auto", padding:"3px 8px", background:"#003d00",
              border:"1px solid #00aa44", borderRadius:8, color:"#44cc88",
              fontSize:11, fontFamily:"system-ui,sans-serif", whiteSpace:"nowrap" },
  specs:    { display:"flex", flexWrap:"wrap", gap:6 },
  specTag:  { padding:"3px 10px", background:"#2a1500", border:`1px solid ${G}33`,
              borderRadius:12, color:MUTED, fontSize:11,
              fontFamily:"system-ui,sans-serif" },
  langs:    { color:MUTED, fontSize:12, fontFamily:"system-ui,sans-serif" },
  note:     { color:TXT, fontSize:13, lineHeight:1.5, fontFamily:"system-ui,sans-serif",
              padding:"8px 0", borderTop:`1px solid ${G}22` },
  cardBtns: { display:"flex", gap:8 },
  callBtn:  { flex:1, padding:"8px", background:"#1e0e02", border:`1px solid ${G}44`,
              borderRadius:8, color:G, fontSize:13, textAlign:"center",
              fontFamily:"system-ui,sans-serif", cursor:"pointer" },
  waBtn:    { flex:1, padding:"8px", background:"#003d00", border:"1px solid #00aa44",
              borderRadius:8, color:"#44cc88", fontSize:13, textAlign:"center",
              fontFamily:"system-ui,sans-serif", cursor:"pointer" },
  listingCTA:{ background:SURF, border:`1px solid ${G}`, borderRadius:16,
              padding:32, textAlign:"center", marginTop:32 },
  ctaTitle: { color:GSFT, fontSize:24, fontWeight:"bold", marginBottom:10 },
  ctaDesc:  { color:MUTED, fontSize:14, lineHeight:1.7,
              fontFamily:"system-ui,sans-serif", marginBottom:20 },
  ctaBtn:   { padding:"12px 28px", background:`linear-gradient(135deg,#6b3a00,#3d1500)`,
              border:`1px solid ${G}`, borderRadius:10, color:GSFT, fontSize:14,
              fontWeight:"bold", cursor:"pointer" },
};
