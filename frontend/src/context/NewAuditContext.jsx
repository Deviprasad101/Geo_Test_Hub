import { createContext, useContext, useState } from "react";

const NewAuditContext = createContext(null);

export function NewAuditProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allowScroll, setAllowScroll] = useState(false);

  return (
    <NewAuditContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        allowScroll,
        setAllowScroll,
      }}
    >
      {children}
    </NewAuditContext.Provider>
  );
}

export function useNewAudit() {
  return useContext(NewAuditContext);
}
