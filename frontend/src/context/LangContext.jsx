import { createContext, useContext, useState } from "react";
import { createT } from "../i18n/index.js";

const LangCtx = createContext({ lang:"en", setLang:()=>{}, t:createT("en") });

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = createT(lang);
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
