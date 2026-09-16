"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useAuthStore } from "@/stores/authStore";
import { useBudgetStore } from "@/stores/budgetStore";
import { useCategoryStore } from "@/stores/categoryStore";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) {
    return "bg-red-500";
  }

  if (percentage >= 80) {
    return "bg-amber-500";
  }

  return "bg-emerald-500";
};

const getStatus = (percentage: number) => {
  if (percentage >= 100) {
    return {
      label: "Melebihi limit",
      className: "bg-red-50 text-red-700",
    };
  }

  if (percentage >= 80) {
    return {
      label: "Mendekati limit",
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Aman",
    className: "bg-emerald-50 text-emerald-700",
  };
};

export default function BudgetsPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const categories = useCategoryStore((state) => state.categories);
  const loadCategories = useCategoryStore(
    (state) => state.loadCategories,
  );

  const budgets = useBudgetStore((state) => state.budgets);
  const year = useBudgetStore((state) => state.year);
  const month = useBudgetStore((state) => state.month);
  const loading = useBudgetStore((state) => state.loading);
  const error = useBudgetStore((state) => state.error);

  const loadBudgets = useBudgetStore(
    (state) => state.loadBudgets,
  );
  const addBudget = useBudgetStore(
    (state) => state.addBudget,
  );
  const editBudget = useBudgetStore(
    (state) => state.editBudget,
  );
  const archive = useBudgetStore(
    (state) => state.archive,
  );
  const setPeriod = useBudgetStore(
    (state) => state.setPeriod,
  );

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [editingAmount, setEditingAmount] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadCategories(user.uid);
      loadBudgets(user.uid, year, month);
    }
  }, [user, year, month, loadCategories, loadBudgets]);

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

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const availableCategories = expenseCategories.filter(
    (category) =>
      !budgets.some(
        (budget) => budget.categoryId === category.id,
      ),
  );

  const totalBudget = budgets.reduce(
    (total, budget) => total + budget.amount,
    0,
  );

  const totalUsed = budgets.reduce(
    (total, budget) => total + budget.used,
    0,
  );

  const totalRemaining = totalBudget - totalUsed;

  const handlePeriodChange = (value: string) => {
    const [selectedYear, selectedMonth] = value
      .split("-")
      .map(Number);

    setPeriod(selectedYear, selectedMonth);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user || !categoryId || !amount) {
      return;
    }

    const numericAmount = Number(amount.replace(/\D/g, ""));

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    await addBudget(
      user.uid,
      categoryId,
      year,
      month,
      numericAmount,
    );

    setCategoryId("");
    setAmount("");
  };

  const handleEdit = async (budgetId: string) => {
    if (!user) {
      return;
    }

    const numericAmount = Number(
      editingAmount.replace(/\D/g, ""),
    );

    if (!numericAmount || numericAmount <= 0) {
      return;
    }

    await editBudget(
      user.uid,
      budgetId,
      numericAmount,
    );

    setEditingId(null);
    setEditingAmount("");
  };

  const handleArchive = async (budgetId: string) => {
    if (!user) {
      return;
    }

    const confirmed = window.confirm(
      "Arsipkan budget ini?",
    );

    if (!confirmed) {
      return;
    }

    await archive(user.uid, budgetId);
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

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Perencanaan keuangan
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Budget
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Atur batas pengeluaran berdasarkan category setiap bulan.
            </p>
          </div>

          <Select
            label=""
            id="budgetPeriod"
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
        </header>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Total Budget
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {formatCurrency(totalBudget)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Sudah Terpakai
            </p>

            <p className="mt-3 text-2xl font-bold text-red-600">
              {formatCurrency(totalUsed)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-slate-500">
              Sisa Budget
            </p>

            <p
              className={`mt-3 text-2xl font-bold ${
                totalRemaining >= 0
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(totalRemaining)}
            </p>
          </Card>
        </section>

        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Tambah Budget
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Budget hanya dapat dibuat untuk category pengeluaran.
            </p>
          </div>

          {availableCategories.length === 0 ? (
            <p className="text-sm text-slate-500">
              Semua category pengeluaran sudah memiliki budget pada periode ini.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
            >
              <Select
                label="Category"
                id="budgetCategory"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                required
              >
                <option value="">Pilih category</option>

                {availableCategories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Limit Budget"
                id="budgetAmount"
                type="number"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="Contoh: 1000000"
                required
              />

              <Button
                type="submit"
                disabled={
                  loading ||
                  !categoryId ||
                  !amount
                }
              >
                Tambah Budget
              </Button>
            </form>
          )}
        </Card>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Budget Category
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pantau penggunaan budget pada periode terpilih.
            </p>
          </div>

          {loading && budgets.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-500">
                Memuat budget...
              </p>
            </Card>
          ) : budgets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada budget
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tambahkan budget untuk mulai mengontrol pengeluaran.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {budgets.map((budget) => {
                const status = getStatus(
                  budget.percentage,
                );

                return (
                  <Card
                    key={budget.id}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {budget.categoryName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Terpakai {formatCurrency(budget.used)} dari{" "}
                          {formatCurrency(budget.amount)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs text-slate-500">
                        <span>
                          {Math.round(budget.percentage)}%
                        </span>

                        <span>
                          Sisa{" "}
                          {formatCurrency(budget.remaining)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${getProgressColor(
                            budget.percentage,
                          )}`}
                          style={{
                            width: `${Math.min(
                              budget.percentage,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {editingId === budget.id ? (
                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <Input
                          label="Limit baru"
                          id={`edit-${budget.id}`}
                          type="number"
                          min="1"
                          value={editingAmount}
                          onChange={(event) =>
                            setEditingAmount(
                              event.target.value,
                            )
                          }
                        />

                        <div className="flex items-end gap-2">
                          <Button
                            type="button"
                            onClick={() =>
                              handleEdit(budget.id)
                            }
                            disabled={loading}
                          >
                            Simpan
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(null);
                              setEditingAmount("");
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            setEditingId(budget.id);
                            setEditingAmount(
                              String(budget.amount),
                            );
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() =>
                            handleArchive(budget.id)
                          }
                        >
                          Arsipkan
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
