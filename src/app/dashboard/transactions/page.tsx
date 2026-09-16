"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";

import { Transaction, TransactionType } from "@/types/transaction";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function TransactionsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const wallets = useWalletStore((state) => state.wallets);
  const loadWallets = useWalletStore((state) => state.loadWallets);

  const categories = useCategoryStore((state) => state.categories);
  const loadCategories = useCategoryStore((state) => state.loadCategories);

  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const error = useTransactionStore((state) => state.error);

  const loadTransactions = useTransactionStore(
    (state) => state.loadTransactions,
  );

  const addIncome = useTransactionStore((state) => state.addIncome);
  const addExpense = useTransactionStore((state) => state.addExpense);
  const addTransfer = useTransactionStore((state) => state.addTransfer);

  const editTransaction = useTransactionStore((state) => state.editTransaction);

  const removeTransaction = useTransactionStore(
    (state) => state.removeTransaction,
  );

  const clearError = useTransactionStore((state) => state.clearError);

  const [type, setType] = useState<TransactionType>("expense");

  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);

  const [transactionDate, setTransactionDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // =========================
  // FILTER STATE
  // =========================

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<
    TransactionType | "all"
  >("all");
  const [filterWalletId, setFilterWalletId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadWallets(user.uid);
      loadCategories(user.uid);
      loadTransactions(user.uid);
    }
  }, [user, loadWallets, loadCategories, loadTransactions]);

  useEffect(() => {
    setCategoryId("");
  }, [type]);

  useEffect(() => {
    if (filterType === "transfer") {
      setFilterCategoryId("");
    }
  }, [filterType]);

  const resetForm = () => {
    setEditingTransactionId(null);
    setType("expense");

    setWalletId("");
    setCategoryId("");

    setFromWalletId("");
    setToWalletId("");

    setAmount("");
    setDescription("");

    setTransactionDate(new Date().toISOString().split("T")[0]);

    clearError();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setType(transaction.type);

    if (transaction.type === "income" || transaction.type === "expense") {
      setWalletId(transaction.walletId ?? "");
      setCategoryId(transaction.categoryId ?? "");
      setFromWalletId("");
      setToWalletId("");
    }

    if (transaction.type === "transfer") {
      setFromWalletId(transaction.fromWalletId ?? "");
      setToWalletId(transaction.toWalletId ?? "");
      setWalletId("");
      setCategoryId("");
    }

    setAmount(transaction.amount.toString());
    setDescription(transaction.description);

    setTransactionDate(
      transaction.transactionDate.toDate().toISOString().split("T")[0],
    );

    clearError();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    clearError();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    if (!transactionDate) {
      return;
    }

    try {
      const date = new Date(`${transactionDate}T00:00:00`);

      if (editingTransactionId) {
        if (type === "income" || type === "expense") {
          if (!walletId || !categoryId) {
            return;
          }

          await editTransaction(user.uid, editingTransactionId, {
            amount: numericAmount,
            walletId,
            categoryId,
            description: description.trim(),
            transactionDate: date,
          });
        }

        if (type === "transfer") {
          if (!fromWalletId || !toWalletId) {
            return;
          }

          if (fromWalletId === toWalletId) {
            return;
          }

          await editTransaction(user.uid, editingTransactionId, {
            amount: numericAmount,
            fromWalletId,
            toWalletId,
            description: description.trim(),
            transactionDate: date,
          });
        }

        resetForm();
        return;
      }

      if (type === "income") {
        if (!walletId || !categoryId) {
          return;
        }

        await addIncome(
          user.uid,
          walletId,
          categoryId,
          numericAmount,
          description.trim(),
          date,
        );
      }

      if (type === "expense") {
        if (!walletId || !categoryId) {
          return;
        }

        await addExpense(
          user.uid,
          walletId,
          categoryId,
          numericAmount,
          description.trim(),
          date,
        );
      }

      if (type === "transfer") {
        if (!fromWalletId || !toWalletId) {
          return;
        }

        if (fromWalletId === toWalletId) {
          return;
        }

        await addTransfer(
          user.uid,
          fromWalletId,
          toWalletId,
          numericAmount,
          description.trim(),
          date,
        );
      }

      resetForm();
    } catch {
      // Error ditangani oleh transactionStore.
    }
  };

  const handleDelete = async (transactionId: string) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus transaksi ini?",
    );

    if (!confirmed) {
      return;
    }

    if (!user) {
      return;
    }

    clearError();

    try {
      await removeTransaction(user.uid, transactionId);
    } catch {
      // Error ditangani oleh transactionStore.
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const activeCategories = categories.filter(
    (category) => category.type === type,
  );

  const getWalletName = (id?: string) => {
    if (!id) {
      return "-";
    }

    return wallets.find((wallet) => wallet.id === id)?.name ?? "-";
  };

  const getCategoryName = (id?: string) => {
    if (!id) {
      return "-";
    }

    return categories.find((category) => category.id === id)?.name ?? "-";
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTransactions = transactions.filter((transaction) => {
    if (
      filterType !== "all" &&
      transaction.type !== filterType
    ) {
      return false;
    }

    if (filterWalletId) {
      const matchesWallet =
        transaction.walletId === filterWalletId ||
        transaction.fromWalletId === filterWalletId ||
        transaction.toWalletId === filterWalletId;

      if (!matchesWallet) {
        return false;
      }
    }

    if (
      filterCategoryId &&
      transaction.categoryId !== filterCategoryId
    ) {
      return false;
    }

    if (filterMonth) {
      const date = transaction.transactionDate.toDate();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");

      if (`${year}-${month}` !== filterMonth) {
        return false;
      }
    }

    if (normalizedSearch) {
      const searchText = [
        transaction.description,
        getWalletName(transaction.walletId),
        getWalletName(transaction.fromWalletId),
        getWalletName(transaction.toWalletId),
        getCategoryName(transaction.categoryId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchText.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterWalletId("");
    setFilterCategoryId("");
    setFilterMonth("");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transaksi</h1>

            <p className="mt-2 text-slate-600">
              Kelola pemasukan, pengeluaran, dan transfer keuangan kamu.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Transaction List */}
          <section className="lg:col-span-2">
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Riwayat Transaksi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Cari dan filter transaksi kamu.
                  </p>
                </div>

                <span className="shrink-0 text-sm text-slate-500">
                  {filteredTransactions.length} / {transactions.length}
                </span>
              </div>

              <div className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <Input
                  label="Cari transaksi"
                  id="transactionSearch"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Keterangan, wallet, atau category..."
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    label="Tipe"
                    id="filterType"
                    value={filterType}
                    onChange={(event) =>
                      setFilterType(
                        event.target.value as TransactionType | "all",
                      )
                    }
                  >
                    <option value="all">Semua transaksi</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                    <option value="transfer">Transfer</option>
                  </Select>

                  <Select
                    label="Wallet"
                    id="filterWallet"
                    value={filterWalletId}
                    onChange={(event) =>
                      setFilterWalletId(event.target.value)
                    }
                  >
                    <option value="">Semua wallet</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Category"
                    id="filterCategory"
                    value={filterCategoryId}
                    onChange={(event) =>
                      setFilterCategoryId(event.target.value)
                    }
                    disabled={filterType === "transfer"}
                  >
                    <option value="">Semua category</option>
                    {categories
                      .filter(
                        (category) =>
                          filterType === "all" ||
                          filterType === "transfer" ||
                          category.type === filterType,
                      )
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </Select>

                  <Input
                    label="Bulan"
                    id="filterMonth"
                    type="month"
                    value={filterMonth}
                    onChange={(event) =>
                      setFilterMonth(event.target.value)
                    }
                  />
                </div>

                {(search ||
                  filterType !== "all" ||
                  filterWalletId ||
                  filterCategoryId ||
                  filterMonth) && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="px-3 py-1.5 text-xs"
                    >
                      Reset Filter
                    </Button>
                  </div>
                )}
              </div>

              {loading && transactions.length === 0 ? (
                <p className="text-sm text-slate-500">Memuat transaksi...</p>
              ) : transactions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="font-medium text-slate-700">
                    Belum ada transaksi.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Tambahkan transaksi pertama kamu.
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <p className="font-medium text-slate-700">
                    Transaksi tidak ditemukan.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Coba ubah kata kunci atau filter yang digunakan.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearFilters}
                    className="mt-4"
                  >
                    Reset Filter
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => {
                    const isIncome = transaction.type === "income";
                    const isExpense = transaction.type === "expense";

                    return (
                      <div
                        key={transaction.id}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-slate-900">
                                {transaction.description || "Tanpa keterangan"}
                              </h3>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  transaction.type === "income"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : transaction.type === "expense"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {transaction.type === "income"
                                  ? "Pemasukan"
                                  : transaction.type === "expense"
                                    ? "Pengeluaran"
                                    : "Transfer"}
                              </span>
                            </div>

                            <div className="mt-2 text-sm text-slate-500">
                              {transaction.type === "transfer" ? (
                                <>
                                  {getWalletName(transaction.fromWalletId)} →{" "}
                                  {getWalletName(transaction.toWalletId)}
                                </>
                              ) : (
                                <>
                                  {getWalletName(transaction.walletId)} •{" "}
                                  {getCategoryName(transaction.categoryId)}
                                </>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {transaction.transactionDate
                                ?.toDate()
                                .toLocaleDateString("id-ID")}
                            </p>
                          </div>

                          <div className="shrink-0 sm:text-right">
                            <p
                              className={`font-semibold ${
                                isIncome
                                  ? "text-emerald-600"
                                  : isExpense
                                    ? "text-red-600"
                                    : "text-blue-700"
                              }`}
                            >
                              {isIncome ? "+" : isExpense ? "-" : ""}
                              {formatCurrency(transaction.amount)}
                            </p>

                            <div className="mt-2 flex gap-2 sm:justify-end">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleEdit(transaction)}
                                disabled={loading}
                                className="px-3 py-1.5 text-xs"
                              >
                                Edit
                              </Button>

                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => handleDelete(transaction.id)}
                                disabled={loading}
                                className="px-3 py-1.5 text-xs"
                              >
                                Hapus
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          {/* Transaction Form */}
          <section>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingTransactionId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {editingTransactionId
                  ? "Ubah data transaksi kamu."
                  : "Catat transaksi keuangan kamu."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Select
                  label="Tipe Transaksi"
                  id="transactionType"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as TransactionType)
                  }
                  disabled={!!editingTransactionId}
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                  <option value="transfer">Transfer</option>
                </Select>

                {type !== "transfer" && (
                  <>
                    <Select
                      label="Wallet"
                      id="wallet"
                      value={walletId}
                      onChange={(event) => setWalletId(event.target.value)}
                      required
                    >
                      <option value="">Pilih wallet</option>

                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Category"
                      id="category"
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                      required
                    >
                      <option value="">Pilih category</option>

                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </>
                )}

                {type === "transfer" && (
                  <>
                    <Select
                      label="Dari Wallet"
                      id="fromWallet"
                      value={fromWalletId}
                      onChange={(event) => setFromWalletId(event.target.value)}
                      required
                    >
                      <option value="">Pilih wallet asal</option>

                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Ke Wallet"
                      id="toWallet"
                      value={toWalletId}
                      onChange={(event) => setToWalletId(event.target.value)}
                      required
                    >
                      <option value="">Pilih wallet tujuan</option>

                      {wallets
                        .filter((wallet) => wallet.id !== fromWalletId)
                        .map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.name}
                          </option>
                        ))}
                    </Select>
                  </>
                )}

                <Input
                  label="Jumlah"
                  id="amount"
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0"
                  required
                />

                <Input
                  label="Tanggal"
                  id="transactionDate"
                  type="date"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Keterangan
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contoh: Makan siang"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  {editingTransactionId && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                  )}

                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading
                      ? "Menyimpan..."
                      : editingTransactionId
                        ? "Simpan Perubahan"
                        : "Tambah Transaksi"}
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
