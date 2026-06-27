import { Routes, Route, useLocation } from "react-router-dom";
import { LangProvider }  from "./context/LangContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import StarField         from "./components/StarField.jsx";
import Nav               from "./components/Nav.jsx";
import Home              from "./pages/Home.jsx";
import Kundali           from "./pages/Kundali.jsx";
import Matchmaking       from "./pages/Matchmaking.jsx";
import Numerology        from "./pages/Numerology.jsx";
import About             from "./pages/About.jsx";
import "./animations.css";

function PageRouter() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-fade">
      <Routes>
        <Route path="/"           element={<Home />}        />
        <Route path="/kundali"    element={<Kundali />}     />
        <Route path="/matching"   element={<Matchmaking />} />
        <Route path="/numerology" element={<Numerology />}  />
        <Route path="/about"      element={<About />}       />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <ToastProvider>
        <StarField />
        <div style={{ position:"relative", zIndex:1 }}>
          <Nav />
          <PageRouter />
        </div>
      </ToastProvider>
    </LangProvider>
  );
}
