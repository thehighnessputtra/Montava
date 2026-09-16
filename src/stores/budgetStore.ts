"use client";

import { create } from "zustand";

import {
  archiveBudget,
  createBudget,
  getBudgets,
  updateBudget,
} from "@/lib/firebase/budget";

import type { BudgetWithUsage } from "@/lib/firebase/budget";

interface BudgetState {
  budgets: BudgetWithUsage[];
  year: number;
  month: number;
  loading: boolean;
  error: string | null;

  loadBudgets: (
    userId: string,
    year: number,
    month: number,
  ) => Promise<void>;

  addBudget: (
    userId: string,
    categoryId: string,
    year: number,
    month: number,
    amount: number,
  ) => Promise<void>;

  editBudget: (
    userId: string,
    budgetId: string,
    amount: number,
  ) => Promise<void>;

  archive: (
    userId: string,
    budgetId: string,
  ) => Promise<void>;

  setPeriod: (year: number, month: number) => void;
  clearError: () => void;
}

const now = new Date();

export const useBudgetStore = create<BudgetState>((set) => ({
  budgets: [],
  year: now.getFullYear(),
  month: now.getMonth(),
  loading: false,
  error: null,

  loadBudgets: async (userId, year, month) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const budgets = await getBudgets(userId, year, month);

      set({
        budgets,
        year,
        month,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load budgets:", error);

      set({
        loading: false,
        error: "Gagal mengambil data budget.",
      });
    }
  },

  addBudget: async (
    userId,
    categoryId,
    year,
    month,
    amount,
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createBudget(
        userId,
        categoryId,
        year,
        month,
        amount,
      );

      const budgets = await getBudgets(
        userId,
        year,
        month,
      );

      set({
        budgets,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to create budget:", error);

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat budget.",
      });

      throw error;
    }
  },

  editBudget: async (
    userId,
    budgetId,
    amount,
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await updateBudget(budgetId, amount);

      const budgets = await getBudgets(
        userId,
        useBudgetStore.getState().year,
        useBudgetStore.getState().month,
      );

      set({
        budgets,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to update budget:", error);

      set({
        loading: false,
        error: "Gagal mengubah budget.",
      });

      throw error;
    }
  },

  archive: async (userId, budgetId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await archiveBudget(budgetId);

      set((state) => ({
        budgets: state.budgets.filter(
          (budget) => budget.id !== budgetId,
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to archive budget:", error);

      set({
        loading: false,
        error: "Gagal mengarsipkan budget.",
      });

      throw error;
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
