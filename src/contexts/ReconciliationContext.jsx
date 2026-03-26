import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchCurrentReconciliation, createReconciliation } from "../api/reconcoliation";
import { fetchCurrencies } from "../api/currency/currency";

const ReconciliationContext = createContext({ todayRecon: null, loading: true, recheck: () => {}, gateOpen: false, openGate: () => {}, closeGate: () => {} });

export function ReconciliationProvider({ children }) {
  const [todayRecon, setTodayRecon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const isAdmin = user.role === "Admin";

  const loadCurrencies = useCallback(async () => {
    try {
      const res = await fetchCurrencies({ page: 1, limit: 100 });
      setCurrencies(res?.data || res || []);
    } catch (err) {
      console.error("Error loading currencies:", err);
    }
  }, []);

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

  const saveOpeningVault = useCallback(async (entries) => {
    try {
      const payload = {
        notes: [],
        openingEntries: entries
      };
      const result = await createReconciliation(payload);
      if (result.success) {
        await recheck();
        setGateOpen(false);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [recheck]);

  useEffect(() => {
    recheck();
    loadCurrencies();
  }, [recheck, loadCurrencies]);

  return (
    <ReconciliationContext.Provider value={{ 
      todayRecon, 
      loading, 
      recheck, 
      isAdmin, 
      gateOpen, 
      currencies,
      openGate: () => setGateOpen(true), 
      closeGate: () => setGateOpen(false),
      saveOpeningVault
    }}>
      {children}
    </ReconciliationContext.Provider>
  );
}

export function useReconciliation() {
  return useContext(ReconciliationContext);
}
