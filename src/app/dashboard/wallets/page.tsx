"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import type { Wallet } from "@/lib/api/wallet";

export default function WalletsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const wallets = useWalletStore((state) => state.wallets);
  const loading = useWalletStore((state) => state.loading);
  const balances = useWalletStore((state) => state.balances);
  const error = useWalletStore((state) => state.error);

  const loadWallets = useWalletStore((state) => state.loadWallets);
  const addWallet = useWalletStore((state) => state.addWallet);
  const editWallet = useWalletStore((state) => state.editWallet);
  const archiveWallet = useWalletStore((state) => state.archive);
  const clearError = useWalletStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadWallets();
    }
  }, [user, loadWallets]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setInitialBalance("");
    setEditingWalletId(null);
  };

  const handleEdit = (wallet: Wallet) => {
    setEditingWalletId(wallet.id);
    setName(wallet.name);
    setDescription(wallet.description ?? "");
    setInitialBalance(wallet.initialBalance.toString());
    clearError();
  };

  const handleArchive = async (walletId: string) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin mengarsipkan wallet ini?",
    );

    if (!confirmed) {
      return;
    }

    clearError();

    try {
      await archiveWallet(walletId);
    } catch {
      // Error ditangani oleh walletStore.
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    clearError();

    const balance = Number(initialBalance);

    if (!name.trim()) {
      return;
    }

    if (!editingWalletId && (balance < 0 || Number.isNaN(balance))) {
      return;
    }

    try {
      if (editingWalletId) {
        await editWallet(editingWalletId, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        await addWallet(name.trim(), description.trim(), balance, "IDR");
      }

      resetForm();
    } catch {
      // Error ditangani oleh walletStore.
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>
          <p className="mt-2 text-slate-600">Kelola wallet keuangan kamu.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Wallet List */}
          <section className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  Wallet Saya
                </h2>

                <span className="text-sm text-slate-500">
                  {wallets.length} wallet
                </span>
              </div>

              {loading && wallets.length === 0 ? (
                <p className="text-slate-500">Memuat wallet...</p>
              ) : wallets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="text-slate-500">Belum ada wallet.</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Buat wallet pertama kamu.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {wallets.map((wallet) => (
                    <Card key={wallet.id} className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {wallet.name}
                          </h3>

                          {wallet.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {wallet.description}
                            </p>
                          )}
                        </div>

                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                          Aktif
                        </span>
                      </div>

                      <p className="mt-6 text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: wallet.currency,
                          maximumFractionDigits: 0,
                        }).format(balances[wallet.id] ?? wallet.initialBalance)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Saldo saat ini
                      </p>

                      <div className="mt-5 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleEdit(wallet)}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          className="flex-1"
                          onClick={() => handleArchive(wallet.id)}
                          disabled={loading}
                        >
                          Archive
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* Create / Edit Wallet */}
          <section>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingWalletId ? "Edit Wallet" : "Tambah Wallet"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {editingWalletId
                  ? "Ubah informasi wallet."
                  : "Buat wallet baru untuk mengelola keuangan."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Nama Wallet"
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: BCA"
                  required
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Deskripsi
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contoh: Rekening utama"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {!editingWalletId && (
                  <Input
                    label="Saldo Awal"
                    id="initialBalance"
                    type="number"
                    min="0"
                    step="1"
                    value={initialBalance}
                    onChange={(event) => setInitialBalance(event.target.value)}
                    placeholder="0"
                    required
                  />
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Currency
                  </label>

                  <input
                    id="currency"
                    type="text"
                    value="IDR"
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  {editingWalletId && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={resetForm}
                    >
                      Batal
                    </Button>
                  )}

                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading
                      ? "Menyimpan..."
                      : editingWalletId
                        ? "Simpan Perubahan"
                        : "Tambah Wallet"}
                  </Button>
                </div>
              </form>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
