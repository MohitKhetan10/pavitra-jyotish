import { createContext, useContext, useState, useCallback } from "react";

const Ctx = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, ms = 2200) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, out: false }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, out: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 380);
    }, ms);
  }, []);

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)",
                    zIndex:9999, display:"flex", flexDirection:"column", gap:8, alignItems:"center",
                    pointerEvents:"none" }}>
        {toasts.map(({ id, msg, out }) => (
          <div key={id} className={out ? "toast-out" : "toast-in"}
               style={{ background:"#1a0a00", border:"1px solid #c9973a88",
                        borderRadius:10, padding:"12px 26px", color:"#f0d080",
                        fontSize:14, fontFamily:"system-ui,sans-serif",
                        boxShadow:"0 4px 28px #00000099", whiteSpace:"nowrap", letterSpacing:0.5 }}>
            {msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() { return useContext(Ctx); }
