"use client";

import { create } from "zustand";

import {
  ExpenseCategoryBreakdown,
  MonthlyTrend,
  DashboardGoal,
  DashboardBudget,
  getDashboardData,
} from "@/lib/firebase/dashboard";

import { Category } from "@/types/category";
import { Transaction } from "@/types/transaction";
import { Wallet } from "@/types/wallet";

interface DashboardState {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  balances: Record<string, number>;

  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;

  expenseByCategory: ExpenseCategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];

  goals: DashboardGoal[];
  budgets: DashboardBudget[];

  loading: boolean;
  error: string | null;

  loadDashboard: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore =
  create<DashboardState>((set) => ({
    wallets: [],
    categories: [],
    transactions: [],
    balances: {},

    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,

    expenseByCategory: [],
    monthlyTrend: [],

    goals: [],
    budgets: [],

    loading: false,
    error: null,

    loadDashboard: async (userId) => {
      set({
        loading: true,
        error: null,
      });

      try {
        const data = await getDashboardData(userId);

        set({
          wallets: data.wallets,
          categories: data.categories,
          transactions: data.transactions,
          balances: data.balances,

          totalBalance: data.totalBalance,
          monthlyIncome: data.monthlyIncome,
          monthlyExpense: data.monthlyExpense,

          expenseByCategory:
            data.expenseByCategory,

          monthlyTrend:
            data.monthlyTrend,

          goals: data.goals,
          budgets: data.budgets,

          loading: false,
        });
      } catch (error) {
        console.error(
          "Failed to load dashboard:",
          error,
        );

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Gagal mengambil data dashboard.",
        });
      }
    },

    clearError: () =>
      set({
        error: null,
      }),
  }));