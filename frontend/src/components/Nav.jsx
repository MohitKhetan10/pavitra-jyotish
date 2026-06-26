import { Link, useLocation } from "react-router-dom";

const links = [
  { to:"/",          label:"Home"           },
  { to:"/kundali",   label:"Birth Chart"    },
  { to:"/matching",  label:"Kundali Matching" },
];

export default function Nav() {
  const { pathname } = useLocation();
  return (
    <nav style={S.nav}>
      <Link to="/" style={S.brand}>
        <span style={S.om}>ॐ</span>
        <span style={S.name}>Pavitra Jyotish</span>
      </Link>
      <div style={S.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to}
            style={pathname === l.to ? {...S.link, ...S.active} : S.link}>
            {l.label}
          </Link>
        ))}
        <span style={S.free}>Pavitra ✦</span>
      </div>
    </nav>
  );
}

const G = "#c9973a", TXT = "#fdf0d5", MUTED = "#b89060";
const S = {
  nav:   { display:"flex", alignItems:"center", justifyContent:"space-between",
           padding:"0 32px", height:64, background:"#0f0400",
           borderBottom:`1px solid ${G}33`, position:"sticky", top:0, zIndex:100,
           boxShadow:"0 2px 20px #00000099" },
  brand: { display:"flex", alignItems:"center", gap:10, textDecoration:"none" },
  om:    { fontSize:24, color:G },
  name:  { fontSize:19, fontWeight:"bold", color:TXT, letterSpacing:1, fontFamily:"Georgia,serif" },
  links: { display:"flex", alignItems:"center", gap:4 },
  link:  { padding:"6px 16px", borderRadius:6, color:MUTED, fontSize:14, textDecoration:"none",
           fontFamily:"system-ui,sans-serif", transition:"color .2s" },
  active:{ color:G },
  free:  { marginLeft:12, padding:"6px 16px", background:"transparent",
           border:`1px solid ${G}44`, borderRadius:8, color:G, fontSize:12,
           letterSpacing:1, fontFamily:"system-ui,sans-serif" },
};
