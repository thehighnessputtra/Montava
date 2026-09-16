"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";

import { useAuthStore } from "@/stores/authStore";
import { useReportStore } from "@/stores/reportStore";
import { useWalletStore } from "@/stores/walletStore";
import { useCategoryStore } from "@/stores/categoryStore";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const CHART_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function ReportsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const summary = useReportStore((state) => state.summary);
  const categories = useReportStore((state) => state.categories);
  const transactions = useReportStore((state) => state.transactions);

  const wallets = useWalletStore((state) => state.wallets);
  const loadWallets = useWalletStore((state) => state.loadWallets);

  const categoryList = useCategoryStore((state) => state.categories);
  const loadCategories = useCategoryStore((state) => state.loadCategories);

  const year = useReportStore((state) => state.year);
  const month = useReportStore((state) => state.month);

  const loading = useReportStore((state) => state.loading);
  const error = useReportStore((state) => state.error);

  const loadReport = useReportStore((state) => state.loadReport);
  const setPeriod = useReportStore((state) => state.setPeriod);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadWallets(user.uid);
      loadCategories(user.uid);
      loadReport(user.uid, year, month);
    }
  }, [
    user,
    year,
    month,
    loadReport,
    loadWallets,
    loadCategories,
  ]);

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];

    const current = new Date();

    for (let index = 0; index < 24; index += 1) {
      const date = new Date(
        current.getFullYear(),
        current.getMonth() - index,
        1,
      );

      options.push({
        value: `${date.getFullYear()}-${date.getMonth()}`,
        label: new Intl.DateTimeFormat("id-ID", {
          month: "long",
          year: "numeric",
        }).format(date),
      });
    }

    return options;
  }, []);

  const selectedPeriod = `${year}-${month}`;

  const handlePeriodChange = (
    value: string,
  ) => {
    const [selectedYear, selectedMonth] = value
      .split("-")
      .map(Number);

    setPeriod(selectedYear, selectedMonth);
  };

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

    return (
      categoryList.find((category) => category.id === id)?.name ??
      "Category lain"
    );
  };

  const netClass =
    summary.net >= 0
      ? "text-emerald-600"
      : "text-red-600";

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

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Analisis keuangan
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Laporan Keuangan
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Ringkasan pemasukan dan pengeluaran berdasarkan periode.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard")}
            >
              ← Dashboard
            </Button>

            <Select
              label=""
              id="reportPeriod"
              value={selectedPeriod}
              onChange={(event) =>
                handlePeriodChange(event.target.value)
              }
              className="min-w-48"
            >
              {monthOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </header>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Total Pemasukan
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              + {formatCurrency(summary.income)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Total Pengeluaran
            </p>

            <p className="mt-3 text-2xl font-bold text-red-600">
              - {formatCurrency(summary.expense)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Bersih
            </p>

            <p className={`mt-3 text-2xl font-bold ${netClass}`}>
              {summary.net >= 0 ? "+" : "-"}{" "}
              {formatCurrency(Math.abs(summary.net))}
            </p>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Pemasukan vs Pengeluaran
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Perbandingan pada periode terpilih.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Periode",
                      income: summary.income,
                      expense: summary.expense,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    tickFormatter={(value) =>
                      `Rp${Number(value).toLocaleString("id-ID")}`
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Pemasukan"
                    fill="#10b981"
                    radius={[5, 5, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Pengeluaran"
                    fill="#ef4444"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Pengeluaran per Category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribusi pengeluaran periode terpilih.
              </p>
            </div>

            <div className="h-72">
              {categories.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <p className="text-sm text-slate-500">
                    Belum ada pengeluaran pada periode ini.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {categories.map((item, index) => (
                        <Cell
                          key={item.categoryId}
                          fill={
                            CHART_COLORS[
                              index % CHART_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(Number(value))
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Detail Transaksi
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {transactions.length} transaksi pada periode terpilih.
            </p>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  Memuat laporan...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium text-slate-700">
                  Tidak ada transaksi
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada transaksi pada periode ini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {transaction.description ||
                          "Tanpa keterangan"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {transaction.type === "transfer"
                          ? transaction.goalId
                            ? `${getWalletName(transaction.fromWalletId)} → Financial Goal`
                            : `${getWalletName(transaction.fromWalletId)} → ${getWalletName(transaction.toWalletId)}`
                          : transaction.type === "income"
                            ? `${getWalletName(transaction.walletId)} • ${getCategoryName(transaction.categoryId)}`
                            : `${getWalletName(transaction.walletId)} • ${getCategoryName(transaction.categoryId)}`}{" "}
                        •{" "}
                        {transaction.transactionDate
                          .toDate()
                          .toLocaleDateString("id-ID")}
                      </p>
                    </div>

                    <p
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : transaction.type === "expense"
                            ? "text-red-600"
                            : "text-blue-700"
                      }`}
                    >
                      {transaction.type === "income"
                        ? "+"
                        : transaction.type === "expense"
                          ? "-"
                          : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}
