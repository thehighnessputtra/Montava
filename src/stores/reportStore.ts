"use client";

import { create } from "zustand";

import {
  getFinancialReport,
  ReportCategory,
  ReportSummary,
} from "@/lib/firebase/report";

import { Transaction } from "@/types/transaction";

interface ReportState {
  summary: ReportSummary;
  categories: ReportCategory[];
  transactions: Transaction[];

  year: number;
  month: number;

  loading: boolean;
  error: string | null;

  loadReport: (
    userId: string,
    year: number,
    month: number,
  ) => Promise<void>;

  setPeriod: (year: number, month: number) => void;
  clearError: () => void;
}

const now = new Date();

export const useReportStore = create<ReportState>((set) => ({
  summary: {
    income: 0,
    expense: 0,
    net: 0,
  },

  categories: [],
  transactions: [],

  year: now.getFullYear(),
  month: now.getMonth(),

  loading: false,
  error: null,

  loadReport: async (userId, year, month) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const data = await getFinancialReport(
        userId,
        year,
        month,
      );

      set({
        summary: data.summary,
        categories: data.categories,
        transactions: data.transactions,
        year,
        month,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load financial report:", error);

      set({
        loading: false,
        error: "Gagal mengambil laporan keuangan.",
      });
    }
  },

  setPeriod: (year, month) => {
    set({
      year,
      month,
    });
  },

  clearError: () => set({ error: null }),
}));
