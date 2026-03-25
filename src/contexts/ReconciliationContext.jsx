import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchCurrentReconciliation } from "../api/reconcoliation";

const ReconciliationContext = createContext({ todayRecon: null, loading: true, recheck: () => {}, gateOpen: false, openGate: () => {}, closeGate: () => {} });

export function ReconciliationProvider({ children }) {
  const [todayRecon, setTodayRecon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user.role === "Admin";

  const recheck = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchCurrentReconciliation();
      setTodayRecon(res.success && res.data ? res.data : null);
    } catch {
      setTodayRecon(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  return (
    <ReconciliationContext.Provider value={{ todayRecon, loading, recheck, isAdmin, gateOpen, openGate: () => setGateOpen(true), closeGate: () => setGateOpen(false) }}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  return useContext(ReconciliationContext);
}
