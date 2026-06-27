import { Routes, Route } from "react-router-dom";
import Nav         from "./components/Nav.jsx";
import Home        from "./pages/Home.jsx";
import Kundali     from "./pages/Kundali.jsx";
import Matchmaking from "./pages/Matchmaking.jsx";
import Numerology  from "./pages/Numerology.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"           element={<Home />}        />
        <Route path="/kundali"    element={<Kundali />}     />
        <Route path="/matching"   element={<Matchmaking />} />
        <Route path="/numerology" element={<Numerology />}  />
      </Routes>
    </>
  );
}
