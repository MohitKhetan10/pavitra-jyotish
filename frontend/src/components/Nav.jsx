import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint.js";

const links = [
  { to:"/",            label:"Home"             },
  { to:"/kundali",     label:"Birth Chart"      },
  { to:"/matching",    label:"Kundali Matching" },
  { to:"/numerology",  label:"Numerology"       },
];

const G = "#c9973a", TXT = "#fdf0d5", MUTED = "#b89060";

export default function Nav() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() { setMenuOpen(false); }

  return (
    <nav style={S.nav}>
      <Link to="/" style={S.brand} onClick={closeMenu}>
        <span style={S.om}>ॐ</span>
        <span style={S.name}>Pavitra Jyotish</span>
      </Link>

      {isMobile ? (
        <button style={S.burger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      ) : (
        <div style={S.links}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={pathname === l.to ? {...S.link, ...S.active} : S.link}>
              {l.label}
            </Link>
          ))}
          <span style={S.free}>Pavitra ✦</span>
        </div>
      )}

      {isMobile && menuOpen && (
        <div style={S.mobileMenu}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={{...S.mobileLink, ...(pathname === l.to ? {color:G} : {})}}
              onClick={closeMenu}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

const S = {
  nav:       { display:"flex", alignItems:"center", justifyContent:"space-between",
               padding:"0 20px", height:64, background:"#0f0400",
               borderBottom:`1px solid ${G}33`, position:"sticky", top:0, zIndex:100,
               boxShadow:"0 2px 20px #00000099" },
  brand:     { display:"flex", alignItems:"center", gap:10, textDecoration:"none" },
  om:        { fontSize:24, color:G },
  name:      { fontSize:17, fontWeight:"bold", color:TXT, letterSpacing:1, fontFamily:"Georgia,serif" },
  links:     { display:"flex", alignItems:"center", gap:4 },
  link:      { padding:"6px 14px", borderRadius:6, color:MUTED, fontSize:14, textDecoration:"none",
               fontFamily:"system-ui,sans-serif", transition:"color .2s" },
  active:    { color:G },
  free:      { marginLeft:8, padding:"6px 14px", background:"transparent",
               border:`1px solid ${G}44`, borderRadius:8, color:G, fontSize:12,
               letterSpacing:1, fontFamily:"system-ui,sans-serif" },
  burger:    { background:"transparent", border:`1px solid ${G}44`, borderRadius:6,
               color:G, fontSize:20, width:40, height:36, cursor:"pointer",
               display:"flex", alignItems:"center", justifyContent:"center",
               fontFamily:"system-ui,sans-serif", flexShrink:0 },
  mobileMenu:{ position:"absolute", top:"100%", left:0, right:0,
               background:"#0f0400", borderBottom:`1px solid ${G}33`,
               display:"flex", flexDirection:"column",
               boxShadow:"0 6px 24px #00000099", zIndex:99 },
  mobileLink:{ padding:"16px 24px", color:MUTED, fontSize:16, textDecoration:"none",
               fontFamily:"system-ui,sans-serif", borderBottom:`1px solid ${G}11`,
               display:"block", letterSpacing:0.5 },
};
