import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useBreakpoint.js";
import { useLang }     from "../context/LangContext.jsx";

const LANGS = [
  { code:"en", label:"EN" },
  { code:"hi", label:"हिं" },
  { code:"ne", label:"नेपा" },
];

const G = "#c9973a", TXT = "#fdf0d5", MUTED = "#b89060";

export default function Nav() {
  const { pathname }       = useLocation();
  const isMobile           = useIsMobile();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to:"/",            label: t("nav.home")       },
    { to:"/kundali",     label: t("nav.chart")      },
    { to:"/matching",    label: t("nav.matching")   },
    { to:"/numerology",  label: t("nav.numerology") },
    { to:"/about",       label: t("nav.about")      },
  ];

  function closeMenu() { setMenuOpen(false); }

  const LangPicker = () => (
    <div style={S.langRow}>
      {LANGS.map(l => (
        <button key={l.code}
          style={{ ...S.langBtn, ...(lang === l.code ? S.langActive : {}) }}
          onClick={() => setLang(l.code)}>
          {l.label}
        </button>
      ))}
    </div>
  );

  return (
    <nav style={S.nav}>
      <Link to="/" style={S.brand} onClick={closeMenu}>
        <span style={S.om}>ॐ</span>
        <span style={S.name}>Pavitra Jyotish</span>
      </Link>

      {isMobile ? (
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <LangPicker />
          <button style={S.burger} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      ) : (
        <div style={S.links}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              style={pathname === l.to ? {...S.link, ...S.active} : S.link}>
              {l.label}
            </Link>
          ))}
          <LangPicker />
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
  brand:     { display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 },
  om:        { fontSize:22, color:G },
  name:      { fontSize:16, fontWeight:"bold", color:TXT, letterSpacing:1, fontFamily:"Georgia,serif" },
  links:     { display:"flex", alignItems:"center", gap:2 },
  link:      { padding:"6px 12px", borderRadius:6, color:MUTED, fontSize:13, textDecoration:"none",
               fontFamily:"system-ui,sans-serif", transition:"color .2s", whiteSpace:"nowrap" },
  active:    { color:G },
  burger:    { background:"transparent", border:`1px solid ${G}44`, borderRadius:6,
               color:G, fontSize:20, width:38, height:34, cursor:"pointer",
               display:"flex", alignItems:"center", justifyContent:"center",
               fontFamily:"system-ui,sans-serif", flexShrink:0 },
  mobileMenu:{ position:"absolute", top:"100%", left:0, right:0,
               background:"#0f0400", borderBottom:`1px solid ${G}33`,
               display:"flex", flexDirection:"column",
               boxShadow:"0 6px 24px #00000099", zIndex:99 },
  mobileLink:{ padding:"14px 24px", color:MUTED, fontSize:15, textDecoration:"none",
               fontFamily:"system-ui,sans-serif", borderBottom:`1px solid ${G}11`,
               display:"block", letterSpacing:0.5 },
  langRow:   { display:"flex", gap:2, alignItems:"center" },
  langBtn:   { background:"transparent", border:`1px solid ${G}33`, borderRadius:5,
               color:MUTED, fontSize:11, padding:"3px 7px", cursor:"pointer",
               fontFamily:"system-ui,sans-serif", lineHeight:1.4, whiteSpace:"nowrap" },
  langActive:{ borderColor:G, color:G, background:`${G}18` },
};
