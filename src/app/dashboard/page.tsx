"use client";

import { useEffect } from "react";
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

import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore } from "@/stores/dashboardStore";
import { Transaction } from "@/types/transaction";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (transaction: Transaction) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(transaction.transactionDate.toDate());

const formatGoalDate = (date: Date | null) => {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const PIE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function DashboardPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore(
    (state) => state.loading,
  );

  const wallets = useDashboardStore(
    (state) => state.wallets,
  );

  const categories = useDashboardStore(
    (state) => state.categories,
  );

  const transactions = useDashboardStore(
    (state) => state.transactions,
  );

  const balances = useDashboardStore(
    (state) => state.balances,
  );

  const totalBalance = useDashboardStore(
    (state) => state.totalBalance,
  );

  const monthlyIncome = useDashboardStore(
    (state) => state.monthlyIncome,
  );

  const monthlyExpense = useDashboardStore(
    (state) => state.monthlyExpense,
  );

  const monthlyTrend = useDashboardStore(
    (state) => state.monthlyTrend,
  );

  const expenseByCategory =
    useDashboardStore(
      (state) => state.expenseByCategory,
    );

  const goals = useDashboardStore(
    (state) => state.goals,
  );

  const budgets = useDashboardStore(
    (state) => state.budgets,
  );

  const loading = useDashboardStore(
    (state) => state.loading,
  );

  const error = useDashboardStore(
    (state) => state.error,
  );

  const loadDashboard =
    useDashboardStore(
      (state) => state.loadDashboard,
    );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadDashboard(user.uid);
    }
  }, [user, loadDashboard]);

  const getWalletName = (id?: string) => {
    if (!id) {
      return "-";
    }

    return (
      wallets.find(
        (wallet) => wallet.id === id,
      )?.name ?? "-"
    );
  };

  const getCategoryName = (id?: string) => {
    if (!id) {
      return "-";
    }

    return (
      categories.find(
        (category) => category.id === id,
      )?.name ?? "-"
    );
  };

  const getTransactionTitle = (
    transaction: Transaction,
  ) => {
    if (transaction.type === "transfer") {
      if (transaction.goalId) {
        return "Alokasi Financial Goal";
      }

      return `${getWalletName(
        transaction.fromWalletId,
      )} → ${getWalletName(
        transaction.toWalletId,
      )}`;
    }

    return getCategoryName(
      transaction.categoryId,
    );
  };

  const getTransactionAmount = (
    transaction: Transaction,
  ) => {
    if (transaction.type === "income") {
      return `+ ${formatCurrency(
        transaction.amount,
      )}`;
    }

    if (transaction.type === "expense") {
      return `- ${formatCurrency(
        transaction.amount,
      )}`;
    }

    return formatCurrency(
      transaction.amount,
    );
  };

  const getTransactionAmountClass = (
    transaction: Transaction,
  ) => {
    if (transaction.type === "income") {
      return "text-emerald-600";
    }

    if (transaction.type === "expense") {
      return "text-red-600";
    }

    return "text-blue-700";
  };

  const netMonthly =
    monthlyIncome - monthlyExpense;

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Ringkasan kondisi keuangan kamu.
            </p>
          </div>

          <Button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/transactions",
              )
            }
          >
            + Tambah Transaksi
          </Button>
        </div>

        {/* ERROR */}
        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </Card>
        )}

        {/* SUMMARY */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Total Saldo
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatCurrency(totalBalance)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Seluruh wallet aktif
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Pemasukan Bulan Ini
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              + {formatCurrency(monthlyIncome)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Pengeluaran Bulan Ini
            </p>

            <p className="mt-3 text-2xl font-bold text-red-600">
              - {formatCurrency(monthlyExpense)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Saldo Bersih Bulan Ini
            </p>

            <p
              className={`mt-3 text-2xl font-bold ${
                netMonthly >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {netMonthly >= 0 ? "+" : "-"}{" "}
              {formatCurrency(
                Math.abs(netMonthly),
              )}
            </p>
          </Card>
        </section>

        {/* CHARTS */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Tren Keuangan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Perbandingan pemasukan dan
                pengeluaran 6 bulan terakhir.
              </p>
            </div>

            <div className="h-80 w-full">
              {monthlyTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">
                    Belum ada data untuk
                    ditampilkan.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={monthlyTrend}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="label" />

                    <YAxis
                      tickFormatter={(value) =>
                        `Rp${Number(
                          value,
                        ).toLocaleString(
                          "id-ID",
                        )}`
                      }
                    />

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          Number(value),
                        )
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="income"
                      name="Pemasukan"
                      fill="#10b981"
                      radius={[
                        4, 4, 0, 0,
                      ]}
                    />

                    <Bar
                      dataKey="expense"
                      name="Pengeluaran"
                      fill="#ef4444"
                      radius={[
                        4, 4, 0, 0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Pengeluaran per Category
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Bulan berjalan.
              </p>
            </div>

            <div className="h-80 w-full">
              {expenseByCategory.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <p className="text-sm text-slate-500">
                    Belum ada pengeluaran
                    bulan ini.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={2}
                    >
                      {expenseByCategory.map(
                        (item, index) => (
                          <Cell
                            key={
                              item.categoryId
                            }
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(
                          Number(value),
                        )
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </section>

        {/* WALLET */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Wallet
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Ringkasan saldo setiap wallet
                aktif.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                router.push(
                  "/dashboard/wallets",
                )
              }
            >
              Kelola Wallet
            </Button>
          </div>

          {loading && wallets.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-500">
                Memuat wallet...
              </p>
            </Card>
          ) : wallets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada wallet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Buat wallet terlebih dahulu
                untuk mulai mencatat
                keuangan.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={() =>
                  router.push(
                    "/dashboard/wallets",
                  )
                }
              >
                Buat Wallet
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wallets.map((wallet) => (
                <Card
                  key={wallet.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
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

                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      Aktif
                    </span>
                  </div>

                  <p className="mt-6 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      balances[wallet.id] ??
                        wallet.initialBalance,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Saldo saat ini
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* FINANCIAL GOALS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Financial Goals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Progress target keuangan kamu.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                router.push(
                  "/financial-goals",
                )
              }
            >
              Kelola Goals
            </Button>
          </div>

          {goals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada financial goal
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Buat target keuangan untuk
                mulai menabung secara
                terarah.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={() =>
                  router.push(
                    "/financial-goals",
                  )
                }
              >
                Buat Goal
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {goals.slice(0, 3).map((goal) => (
                <Card
                  key={goal.id}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {goal.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Target{" "}
                        {formatGoalDate(
                          goal.targetDate,
                        )}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        goal.status ===
                        "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {goal.status ===
                      "completed"
                        ? "Selesai"
                        : "Aktif"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {formatCurrency(
                          goal.currentAmount,
                        )}
                      </p>

                      <p className="text-xs text-slate-400">
                        dari{" "}
                        {formatCurrency(
                          goal.targetAmount,
                        )}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-blue-600">
                      {goal.progress.toFixed(
                        0,
                      )}
                      %
                    </p>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${goal.progress}%`,
                      }}
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Sisa{" "}
                    {formatCurrency(
                      goal.remaining,
                    )}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* BUDGET */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Budget Bulan Ini
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pantau penggunaan budget
                berdasarkan category.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                router.push(
                  "/dashboard/budget",
                )
              }
            >
              Kelola Budget
            </Button>
          </div>

          {budgets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada budget bulan ini
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Atur budget agar pengeluaran
                lebih terkontrol.
              </p>

              <Button
                type="button"
                className="mt-4"
                onClick={() =>
                  router.push(
                    "/dashboard/budget",
                  )
                }
              >
                Buat Budget
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.slice(0, 6).map(
                (budget) => {
                  const isOver =
                    budget.used >
                    budget.amount;

                  return (
                    <Card
                      key={budget.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {
                              budget.categoryName
                            }
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Budget{" "}
                            {formatCurrency(
                              budget.amount,
                            )}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            isOver
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isOver
                            ? "Melebihi"
                            : `${budget.percentage.toFixed(
                                0,
                              )}%`}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(
                              budget.used,
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            Terpakai
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-semibold ${
                              isOver
                                ? "text-red-600"
                                : "text-slate-700"
                            }`}
                          >
                            {isOver
                              ? formatCurrency(
                                  budget.used -
                                    budget.amount,
                                )
                              : formatCurrency(
                                  budget.remaining,
                                )}
                          </p>

                          <p className="text-xs text-slate-400">
                            {isOver
                              ? "Over budget"
                              : "Tersisa"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver
                              ? "bg-red-500"
                              : "bg-emerald-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              budget.percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </Card>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* RECENT TRANSACTIONS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Transaksi Terbaru
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Lima transaksi terakhir
                kamu.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                router.push(
                  "/dashboard/transactions",
                )
              }
            >
              Lihat Semua
            </Button>
          </div>

          <Card className="overflow-hidden">
            {loading &&
            transactions.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  Memuat transaksi...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-medium text-slate-700">
                  Belum ada transaksi
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Transaksi yang kamu
                  buat akan muncul di
                  sini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {transactions.map(
                  (transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-slate-900">
                            {getTransactionTitle(
                              transaction,
                            )}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                              transaction.type ===
                              "income"
                                ? "bg-emerald-50 text-emerald-700"
                                : transaction.type ===
                                    "expense"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {transaction.type ===
                            "income"
                              ? "Pemasukan"
                              : transaction.type ===
                                  "expense"
                                ? "Pengeluaran"
                                : "Transfer"}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {transaction.type ===
                          "transfer" ? (
                            transaction.goalId ? (
                              <>
                                {getWalletName(
                                  transaction.fromWalletId,
                                )}{" "}
                                → Financial Goal
                              </>
                            ) : (
                              <>
                                {getWalletName(
                                  transaction.fromWalletId,
                                )}{" "}
                                →{" "}
                                {getWalletName(
                                  transaction.toWalletId,
                                )}
                              </>
                            )
                          ) : (
                            <>
                              {getWalletName(
                                transaction.walletId,
                              )}{" "}
                              •{" "}
                              {getCategoryName(
                                transaction.categoryId,
                              )}
                            </>
                          )}{" "}
                          •{" "}
                          {formatDate(
                            transaction,
                          )}
                        </div>
                      </div>

                      <p
                        className={`shrink-0 font-semibold ${getTransactionAmountClass(
                          transaction,
                        )}`}
                      >
                        {getTransactionAmount(
                          transaction,
                        )}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>
        </section>
      </div>
    </main>
  );
}