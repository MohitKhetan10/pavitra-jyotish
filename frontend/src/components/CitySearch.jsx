import { useState, useEffect, useRef } from "react";

const G = "#c9973a", TXT = "#fdf0d5", MUTED = "#b89060";

// Country-code → UTC offset fallback (used instantly while timezone API loads)
const CC_TZ = {
  NP:5.75,IN:5.5,LK:5.5,BD:6,PK:5,AF:4.5,MM:6.5,
  TH:7,VN:7,KH:7,LA:7,
  CN:8,SG:8,MY:8,PH:8,TW:8,HK:8,MO:8,BN:8,
  JP:9,KR:9,
  AE:4,OM:4,MV:5,
  SA:3,KW:3,QA:3,BH:3,IQ:3,YE:3,ET:3,KE:3,TZ:3,EAT:3,
  EG:2,ZA:2,GR:2,RO:2,BG:2,UA:2,FI:2,EE:2,LV:2,LT:2,
  GB:0,IE:0,PT:0,IS:0,
  FR:1,DE:1,ES:1,IT:1,NL:1,CH:1,AT:1,BE:1,SE:1,NO:1,DK:1,PL:1,CZ:1,SK:1,HU:1,
  US:-5,CA:-5,MX:-6,BR:-3,AR:-3,CL:-4,CO:-5,PE:-5,VE:-4,
  AU:10,NZ:12,PG:10,FJ:12,
};

export default function CitySearch({ value, onSelect, inputStyle, placeholder }) {
  const [query,   setQuery]   = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const debRef = useRef(null);
  const wrapRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Sync external value (e.g. from URL restore)
  useEffect(() => { if (value !== undefined) setQuery(value); }, [value]);

  async function search(q) {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=10`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      const seen = new Set();
      const items = [];
      for (const feat of data.features || []) {
        const p   = feat.properties || {};
        const geo = feat.geometry?.coordinates;
        if (!geo?.[0] || !geo?.[1]) continue;
        // Only include city/town/village/administrative places, skip POIs/streets
        const kind = p.osm_value || "";
        if (!["city","town","village","hamlet","suburb","administrative","municipality",
               "district","county","state"].includes(kind) && p.osm_key !== "place") continue;
        const name    = p.name    || "";
        const county  = p.county  || "";
        const state   = p.state   || "";
        const country = p.country || "";
        const cc      = (p.countrycode || "").toUpperCase();
        if (!name) continue;
        const display = [name, county, state, country].filter(Boolean).join(", ");
        if (seen.has(display)) continue;
        seen.add(display);
        items.push({ display, name, county, state, country, cc,
                     lat: geo[1], lng: geo[0] });
      }
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(q), 350);
  }

  async function pick(city) {
    setQuery(city.display);
    setResults([]);
    setOpen(false);

    // Instant fallback from country code
    let tz_offset = CC_TZ[city.cc] ?? 0;
    let tz_name   = "";

    // Accurate timezone from coordinates (timeapi.io — free, no key)
    try {
      const tzRes = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${city.lat}&longitude=${city.lng}`
      );
      if (tzRes.ok) {
        const tzData = await tzRes.json();
        tz_name   = tzData.timeZone || "";
        const secs = tzData.currentUtcOffset?.seconds;
        if (typeof secs === "number") tz_offset = secs / 3600;
      }
    } catch { /* keep country fallback */ }

    onSelect({ ...city, tz_offset, tz_name });
  }

  const tzLabel = (cc) => {
    const off = CC_TZ[cc];
    if (off === undefined) return null;
    return `UTC${off >= 0 ? "+" : ""}${off}`;
  };

  return (
    <div ref={wrapRef} style={{ position:"relative", width:"100%" }}>
      <div style={{ position:"relative" }}>
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder || "Search city of birth… e.g. Kathmandu, Pokhara, Delhi"}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          style={{ ...inputStyle, paddingRight:34 }}
        />
        {loading && (
          <span className="spin-cw" style={{
            position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
            color:MUTED, fontSize:16, lineHeight:1, display:"inline-block",
          }}>⟳</span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:999,
          background:"#1a0900", border:`1px solid ${G}44`, borderRadius:8,
          boxShadow:"0 8px 28px rgba(0,0,0,.75)", margin:0, padding:0,
          listStyle:"none", maxHeight:264, overflowY:"auto",
        }}>
          {results.map((city, i) => (
            <li
              key={i}
              onMouseDown={() => pick(city)}
              onMouseEnter={e => e.currentTarget.style.background = "#2a1400"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              style={{
                padding:"10px 14px", cursor:"pointer",
                borderBottom: i < results.length - 1 ? `1px solid ${G}18` : "none",
              }}
            >
              <div style={{ color:TXT, fontSize:13, fontWeight:"bold" }}>{city.name}</div>
              <div style={{ color:MUTED, fontSize:11, marginTop:2 }}>
                {[city.county, city.state, city.country].filter(Boolean).join(", ")}
                {city.cc && tzLabel(city.cc) && (
                  <span style={{ marginLeft:8, color:`${G}88` }}>· {tzLabel(city.cc)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
