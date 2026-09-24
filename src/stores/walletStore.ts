"use client";

import { create } from "zustand";

import {
  archiveWallet,
  createWallet,
  getWallets,
  updateWallet,
  type Wallet,
} from "@/lib/api/wallet";

interface WalletState {
  wallets: Wallet[];
  balances: Record<string, number>;
  selectedWalletId: string | null;
  loading: boolean;
  error: string | null;

  loadWallets: () => Promise<void>;

  addWallet: (
    name: string,
    description: string,
    initialBalance: number,
    currency?: string,
  ) => Promise<void>;

  editWallet: (
    walletId: string,
    data: {
      name?: string;
      description?: string | null;
    },
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

  loadWallets: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const wallets = await getWallets();

      set({
        wallets,
        balances: Object.fromEntries(
          wallets.map((wallet) => [
            wallet.id,
            wallet.balance,
          ]),
        ),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load wallets:", error);

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data wallet.",
      });
    }
  },

  addWallet: async (
    name,
    description,
    initialBalance,
    currency = "IDR",
  ) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const wallet = await createWallet({
        name,
        description,
        initialBalance,
        currency,
      });

      set((state) => ({
        wallets: [...state.wallets, wallet],
        balances: {
          ...state.balances,
          [wallet.id]: wallet.balance,
        },
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to create wallet:", error);

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal membuat wallet.",
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
      const wallet = await updateWallet(
        walletId,
        data,
      );

      set((state) => ({
        wallets: state.wallets.map((item) =>
          item.id === walletId ? wallet : item,
        ),
        balances: {
          ...state.balances,
          [wallet.id]: wallet.balance,
        },
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to update wallet:", error);

      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengubah wallet.",
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
        const balances = {
          ...state.balances,
        };

        delete balances[walletId];

        return {
          wallets: state.wallets.filter(
            (wallet) => wallet.id !== walletId,
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
        error:
          error instanceof Error
            ? error.message
            : "Gagal mengarsipkan wallet.",
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