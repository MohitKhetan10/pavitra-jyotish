import { Routes, Route } from "react-router-dom";
import { LangProvider }  from "./context/LangContext.jsx";
import Nav         from "./components/Nav.jsx";
import Home        from "./pages/Home.jsx";
import Kundali     from "./pages/Kundali.jsx";
import Matchmaking from "./pages/Matchmaking.jsx";
import Numerology  from "./pages/Numerology.jsx";
import About       from "./pages/About.jsx";

export default function App() {
  return (
    <LangProvider>
      <Nav />
      <Routes>
        <Route path="/"           element={<Home />}        />
        <Route path="/kundali"    element={<Kundali />}     />
        <Route path="/matching"   element={<Matchmaking />} />
        <Route path="/numerology" element={<Numerology />}  />
        <Route path="/about"      element={<About />}       />
      </Routes>
    </LangProvider>
  );
}
