"use client";

import { create } from "zustand";
import type { ScanResult, ScanErrorType } from "@/types/checkin";

type ScannerState = "idle" | "scanning" | "success" | "already_scanned" | "error" | "manual_lookup";

interface ScannerStore {
  state: ScannerState;
  lastResult?: ScanResult;
  errorType?: ScanErrorType;
  qrToken?: string;
  setState: (state: ScannerState) => void;
  setResult: (result: ScanResult) => void;
  setError: (type: ScanErrorType, token?: string) => void;
  reset: () => void;
}

export const useScannerStore = create<ScannerStore>((set) => ({
  state: "idle",
  lastResult: undefined,
  errorType: undefined,
  qrToken: undefined,
  setState: (state) => set({ state }),
  setResult: (result) => set({ state: "success", lastResult: result }),
  setError: (type, token) => set({ state: "error", errorType: type, qrToken: token }),
  reset: () => set({ state: "idle", lastResult: undefined, errorType: undefined, qrToken: undefined }),
}));
