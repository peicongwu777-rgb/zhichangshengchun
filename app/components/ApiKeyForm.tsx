"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, Cpu, Terminal } from "lucide-react";

type ApiCredentials = {
  apiKey: string;
  modelId: string;
};

type ApiKeyContextValue = {
  apiKey: string | null;
  modelId: string | null;
  hydrated: boolean;
  setCredentials: (next: ApiCredentials) => void;
  clearCredentials: () => void;
};

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

const STORAGE_API_KEY = "ark_api_key";
const STORAGE_MODEL_ID = "ark_model_id";

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedApiKey = window.localStorage.getItem(STORAGE_API_KEY);
      const storedModelId = window.localStorage.getItem(STORAGE_MODEL_ID);
      if (storedApiKey) setApiKey(storedApiKey);
      if (storedModelId) setModelId(storedModelId);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setCredentials = useCallback((next: ApiCredentials) => {
    setApiKey(next.apiKey);
    setModelId(next.modelId);
    window.localStorage.setItem(STORAGE_API_KEY, next.apiKey);
    window.localStorage.setItem(STORAGE_MODEL_ID, next.modelId);
  }, []);

  const clearCredentials = useCallback(() => {
    setApiKey(null);
    setModelId(null);
    window.localStorage.removeItem(STORAGE_API_KEY);
    window.localStorage.removeItem(STORAGE_MODEL_ID);
  }, []);

  const value = useMemo<ApiKeyContextValue>(
    () => ({ apiKey, modelId, hydrated, setCredentials, clearCredentials }),
    [apiKey, modelId, hydrated, setCredentials, clearCredentials],
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error("useApiKey must be used within <ApiKeyProvider />");
  }
  return ctx;
}

type ApiKeyFormProps = {
  open?: boolean;
  onClose?: () => void;
  title?: string;
};

export default function ApiKeyForm({ open, onClose, title = "SYSTEM_ACCESS" }: ApiKeyFormProps) {
  const { apiKey, modelId, hydrated, setCredentials } = useApiKey();

  const missingCredentials = hydrated ? !apiKey || !modelId : true;
  const shouldRender = open ?? missingCredentials;
  const fullscreen = missingCredentials;

  const [draftApiKey, setDraftApiKey] = useState("");
  const [draftModelId, setDraftModelId] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    setDraftApiKey(apiKey ?? "");
    setDraftModelId(modelId ?? "");
  }, [hydrated, apiKey, modelId]);

  const submit = useCallback(() => {
    const nextApiKey = draftApiKey.trim();
    const nextModelId = draftModelId.trim();

    if (!nextApiKey || !nextModelId) {
      setError("请填写 API Key 和 Endpoint ID。");
      return;
    }

    setError(null);
    setCredentials({ apiKey: nextApiKey, modelId: nextModelId });
    onClose?.();
  }, [draftApiKey, draftModelId, setCredentials, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
       <div className={`w-full max-w-lg border-2 border-primary bg-background p-6 shadow-[8px_8px_0px_0px_rgba(0,255,0,0.2)]`}>
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
             <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                {title}
             </h2>
             {!fullscreen && (
                <button onClick={onClose} className="text-muted hover:text-foreground">
                   [X]
                </button>
             )}
          </div>

          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-sm text-foreground uppercase tracking-wider">API Key</label>
                <div className="relative">
                   <input
                      value={draftApiKey}
                      onChange={(e) => setDraftApiKey(e.target.value)}
                      type={showApiKey ? "text" : "password"}
                      className="w-full bg-surface border border-border p-3 text-foreground focus:border-primary focus:outline-none"
                      placeholder="sk-..."
                   />
                   <button 
                     type="button"
                     onClick={() => setShowApiKey(!showApiKey)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                   >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm text-foreground uppercase tracking-wider">Endpoint ID</label>
                <input
                   value={draftModelId}
                   onChange={(e) => setDraftModelId(e.target.value)}
                   type="text"
                   className="w-full bg-surface border border-border p-3 text-foreground focus:border-primary focus:outline-none"
                   placeholder="ep-..."
                />
             </div>

             {error && (
                <div className="p-3 border border-red-500 text-red-500 text-sm bg-red-900/20">
                   ! {error}
                </div>
             )}

             <div className="pt-4">
                <button
                   onClick={submit}
                   className="w-full py-3 border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest transition-colors"
                >
                   {">>"} CONNECT_SYSTEM
                </button>
                <p className="mt-4 text-xs text-muted text-center">
                   * CREDENTIALS STORED LOCALLY ONLY
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}
