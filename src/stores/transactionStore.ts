"use client";

import { create } from "zustand";

import {
  createExpense,
  createIncome,
  createTransfer,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from "@/lib/firebase/transaction";

import { Transaction } from "@/types/transaction";

import { useWalletStore } from "@/stores/walletStore";

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  loadTransactions: (userId: string) => Promise<void>;

  addIncome: (
    userId: string,
    walletId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: Date
  ) => Promise<void>;

  addExpense: (
    userId: string,
    walletId: string,
    categoryId: string,
    amount: number,
    description: string,
    transactionDate: Date
  ) => Promise<void>;

  addTransfer: (
    userId: string,
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description: string,
    transactionDate: Date
  ) => Promise<void>;

  editTransaction: (
    userId: string,
    transactionId: string,
    data: {
      amount?: number;
      description?: string;
      walletId?: string;
      categoryId?: string;
      fromWalletId?: string;
      toWalletId?: string;
      transactionDate?: Date;
    }
  ) => Promise<void>;

  removeTransaction: (
    userId: string,
    transactionId: string
  ) => Promise<void>;

  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  // =========================
  // LOAD TRANSACTIONS
  // =========================
  loadTransactions: async (userId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const transactions = await getTransactions(userId);

      set({
        transactions,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load transactions:", error);

      set({
        loading: false,
        error: "Gagal mengambil data transaksi.",
      });
    }
  },

  // =========================
  // ADD INCOME
  // =========================
  addIncome: async (
    userId,
    walletId,
    categoryId,
    amount,
    description,
    transactionDate
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createIncome(
        userId,
        walletId,
        categoryId,
        amount,
        description,
        transactionDate
      );

      const transactions = await getTransactions(userId);

      set({
        transactions,
        loading: false,
      });

      // Refresh saldo wallet
      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to create income:", error);

      set({
        loading: false,
        error: "Gagal membuat transaksi pemasukan.",
      });

      throw error;
    }
  },

  // =========================
  // ADD EXPENSE
  // =========================
  addExpense: async (
    userId,
    walletId,
    categoryId,
    amount,
    description,
    transactionDate
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createExpense(
        userId,
        walletId,
        categoryId,
        amount,
        description,
        transactionDate
      );

      const transactions = await getTransactions(userId);

      set({
        transactions,
        loading: false,
      });

      // Refresh saldo wallet
      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to create expense:", error);

      set({
        loading: false,
        error: "Gagal membuat transaksi pengeluaran.",
      });

      throw error;
    }
  },

  // =========================
  // ADD TRANSFER
  // =========================
  addTransfer: async (
    userId,
    fromWalletId,
    toWalletId,
    amount,
    description,
    transactionDate
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createTransfer(
        userId,
        fromWalletId,
        toWalletId,
        amount,
        description,
        transactionDate
      );

      const transactions = await getTransactions(userId);

      set({
        transactions,
        loading: false,
      });

      // Refresh saldo semua wallet
      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to create transfer:", error);

      set({
        loading: false,
        error: "Gagal membuat transaksi transfer.",
      });

      throw error;
    }
  },

  // =========================
  // EDIT TRANSACTION
  // =========================
  editTransaction: async (userId, transactionId, data) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await updateTransaction(transactionId, data);

      const transactions = await getTransactions(userId);

      set({
        transactions,
        loading: false,
      });

      // Refresh saldo wallet
      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to update transaction:", error);

      set({
        loading: false,
        error: "Gagal mengubah transaksi.",
      });

      throw error;
    }
  },

  // =========================
  // DELETE TRANSACTION
  // =========================
  removeTransaction: async (userId, transactionId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await deleteTransaction(transactionId);

      set((state) => ({
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== transactionId
        ),
        loading: false,
      }));

      // Refresh saldo wallet
      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to delete transaction:", error);

      set({
        loading: false,
        error: "Gagal menghapus transaksi.",
      });

      throw error;
    }
  },

  // =========================
  // CLEAR ERROR
  // =========================
  clearError: () => set({ error: null }),
}));