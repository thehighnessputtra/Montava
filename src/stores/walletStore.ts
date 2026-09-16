"use client";

import { create } from "zustand";

import {
  archiveWallet,
  createWallet,
  getWallets,
  updateWallet,
} from "@/lib/firebase/wallet";

import { getWalletBalance } from "@/lib/firebase/balance";

import { Wallet } from "@/types/wallet";

interface WalletState {
  wallets: Wallet[];
  balances: Record<string, number>;
  selectedWalletId: string | null;
  loading: boolean;
  error: string | null;

  loadWallets: (userId: string) => Promise<void>;

  loadBalances: (userId: string) => Promise<void>;

  addWallet: (
    userId: string,
    name: string,
    description: string,
    initialBalance: number,
    currency?: string
  ) => Promise<void>;

  editWallet: (
    walletId: string,
    data: {
      name?: string;
      description?: string;
      initialBalance?: number;
    }
  ) => Promise<void>;

  archive: (walletId: string) => Promise<void>;

  selectWallet: (walletId: string | null) => void;

  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallets: [],
  balances: {},
  selectedWalletId: null,
  loading: false,
  error: null,

  loadWallets: async (userId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const wallets = await getWallets(userId);

      set({
        wallets,
        loading: false,
      });

      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to load wallets:", error);

      set({
        loading: false,
        error: "Gagal mengambil data wallet.",
      });
    }
  },

  loadBalances: async (userId) => {
    try {
      const wallets = useWalletStore.getState().wallets;

      const balanceEntries = await Promise.all(
        wallets.map(async (wallet) => {
          const balance = await getWalletBalance(
            userId,
            wallet.id
          );

          return [wallet.id, balance] as const;
        })
      );

      set({
        balances: Object.fromEntries(balanceEntries),
      });
    } catch (error) {
      console.error("Failed to load balances:", error);

      set({
        error: "Gagal menghitung saldo wallet.",
      });
    }
  },

  addWallet: async (
    userId,
    name,
    description,
    initialBalance,
    currency = "IDR"
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createWallet(
        userId,
        name,
        description,
        initialBalance,
        currency
      );

      const wallets = await getWallets(userId);

      set({
        wallets,
        loading: false,
      });

      await useWalletStore.getState().loadBalances(userId);
    } catch (error) {
      console.error("Failed to create wallet:", error);

      set({
        loading: false,
        error: "Gagal membuat wallet.",
      });

      throw error;
    }
  },

  editWallet: async (walletId, data) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await updateWallet(walletId, data);

      set((state) => ({
        wallets: state.wallets.map((wallet) =>
          wallet.id === walletId
            ? {
                ...wallet,
                ...data,
              }
            : wallet
        ),
        loading: false,
      }));

      const wallet = useWalletStore
        .getState()
        .wallets.find((item) => item.id === walletId);

      if (wallet) {
        const balance = await getWalletBalance(
          wallet.userId,
          walletId
        );

        set((state) => ({
          balances: {
            ...state.balances,
            [walletId]: balance,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to update wallet:", error);

      set({
        loading: false,
        error: "Gagal mengubah wallet.",
      });

      throw error;
    }
  },

  archive: async (walletId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await archiveWallet(walletId);

      set((state) => {
        const balances = { ...state.balances };

        delete balances[walletId];

        return {
          wallets: state.wallets.filter(
            (wallet) => wallet.id !== walletId
          ),
          balances,
          selectedWalletId:
            state.selectedWalletId === walletId
              ? null
              : state.selectedWalletId,
          loading: false,
        };
      });
    } catch (error) {
      console.error("Failed to archive wallet:", error);

      set({
        loading: false,
        error: "Gagal mengarsipkan wallet.",
      });

      throw error;
    }
  },

  selectWallet: (walletId) => {
    set({
      selectedWalletId: walletId,
    });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));