"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db } from "@/services/db";

const CMSContext = createContext({
  cms: {},
  loading: true,
  refreshCMS: async () => { }
});

export function CMSProvider({ children }) {
  const [cms, setCms] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshCMS = useCallback(async () => {
    try {
      const data = await db.getSettings();
      setCms(data || {});
    } catch (err) {
      console.error("Failed to load CMS data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCMS();
  }, [refreshCMS]);

  return (
    <CMSContext.Provider value={{ cms, loading, refreshCMS }}>
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  return useContext(CMSContext);
}
