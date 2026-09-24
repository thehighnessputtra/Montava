import { apiRequest } from "./client";

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  initialBalance: number;
  balance: number;
  currency: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type WalletResponse = {
  data: Wallet;
};

type WalletListResponse = {
  data: Wallet[];
};

export async function getWallets() {
  const response = await apiRequest<WalletListResponse>(
    "/api/v1/wallets",
  );

  return response.data;
}

export async function getWallet(walletId: string) {
  const response = await apiRequest<WalletResponse>(
    `/api/v1/wallets/${walletId}`,
  );

  return response.data;
}

export async function createWallet(data: {
  name: string;
  description?: string;
  initialBalance: number;
  currency?: string;
}) {
  const response = await apiRequest<WalletResponse>(
    "/api/v1/wallets",
    {
      method: "POST",
      body: data,
    },
  );

  return response.data;
}

export async function updateWallet(
  walletId: string,
  data: {
    name?: string;
    description?: string | null;
  },
) {
  const response = await apiRequest<WalletResponse>(
    `/api/v1/wallets/${walletId}`,
    {
      method: "PATCH",
      body: data,
    },
  );

  return response.data;
}

export async function archiveWallet(walletId: string) {
  const response = await apiRequest<WalletResponse>(
    `/api/v1/wallets/${walletId}/archive`,
    {
      method: "POST",
      body: {},
    },
  );

  return response.data;
}