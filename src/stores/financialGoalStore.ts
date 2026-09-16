import { create } from "zustand";

import {
  archiveFinancialGoal,
  createFinancialGoal,
  getFinancialGoals,
  updateFinancialGoal,
  addGoalContribution,
  type FinancialGoalWithProgress,
} from "@/lib/firebase/financialGoal";

import { useWalletStore } from "@/stores/walletStore";

interface FinancialGoalStore {
  goals: FinancialGoalWithProgress[];

  loading: boolean;
  error: string | null;

  loadGoals: (userId: string) => Promise<void>;

  createGoal: (
    userId: string,
    name: string,
    targetAmount: number,
    targetDate: Date | null,
  ) => Promise<void>;

  updateGoal: (
    userId: string,
    goalId: string,
    data: {
      name?: string;
      targetAmount?: number;
      targetDate?: Date | null;
    },
  ) => Promise<void>;

  archiveGoal: (
    userId: string,
    goalId: string,
  ) => Promise<void>;

  contribute: (
    userId: string,
    goalId: string,
    walletId: string,
    amount: number,
  ) => Promise<void>;

  clearError: () => void;
}

export const useFinancialGoalStore = create<FinancialGoalStore>(
  (set) => ({
    goals: [],

    loading: false,

    error: null,

    loadGoals: async (userId) => {
      set({
        loading: true,
        error: null,
      });

      try {
        const goals = await getFinancialGoals(userId);

        set({
          goals,
          loading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengambil financial goals.";

        set({
          loading: false,
          error: message,
        });
      }
    },

    createGoal: async (
      userId,
      name,
      targetAmount,
      targetDate,
    ) => {
      set({
        loading: true,
        error: null,
      });

      try {
        await createFinancialGoal(
          userId,
          name,
          targetAmount,
          targetDate,
        );

        const goals = await getFinancialGoals(userId);

        set({
          goals,
          loading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal membuat financial goal.";

        set({
          loading: false,
          error: message,
        });

        throw error;
      }
    },

    updateGoal: async (
      userId,
      goalId,
      data,
    ) => {
      set({
        loading: true,
        error: null,
      });

      try {
        await updateFinancialGoal(
          userId,
          goalId,
          data,
        );

        const goals = await getFinancialGoals(userId);

        set({
          goals,
          loading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengubah financial goal.";

        set({
          loading: false,
          error: message,
        });

        throw error;
      }
    },

    archiveGoal: async (
      userId,
      goalId,
    ) => {
      set({
        loading: true,
        error: null,
      });

      try {
        await archiveFinancialGoal(
          userId,
          goalId,
        );

        const goals = await getFinancialGoals(userId);

        set({
          goals,
          loading: false,
        });

        // Transaksi kontribusi goal sudah di-soft-delete.
        // Refresh saldo wallet agar kontribusi kembali ke saldo.
        await useWalletStore
          .getState()
          .loadBalances(userId);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengarsipkan financial goal.";

        set({
          loading: false,
          error: message,
        });

        throw error;
      }
    },

    contribute: async (
      userId,
      goalId,
      walletId,
      amount,
    ) => {
      set({
        loading: true,
        error: null,
      });

      try {
        await addGoalContribution(
          userId,
          goalId,
          walletId,
          amount,
        );

        const goals = await getFinancialGoals(userId);

        set({
          goals,
          loading: false,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal menambahkan kontribusi.";

        set({
          loading: false,
          error: message,
        });

        throw error;
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  }),
);