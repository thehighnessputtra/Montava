"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/utils/date";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useAuthStore } from "@/stores/authStore";
import { useFinancialGoalStore } from "@/stores/financialGoalStore";
import { useWalletStore } from "@/stores/walletStore";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function FinancialGoalsPage() {
  const router = useRouter();

  // ==========================================
  // AUTH
  // ==========================================

  const user = useAuthStore(
    (state) => state.user,
  );

  const authLoading = useAuthStore(
    (state) => state.loading,
  );

  // ==========================================
  // FINANCIAL GOAL STORE
  // ==========================================

  const goals = useFinancialGoalStore(
    (state) => state.goals,
  );

  const loading = useFinancialGoalStore(
    (state) => state.loading,
  );

  const error = useFinancialGoalStore(
    (state) => state.error,
  );

  const loadGoals = useFinancialGoalStore(
    (state) => state.loadGoals,
  );

  const createGoal = useFinancialGoalStore(
  (state) => state.createGoal,
);

  const updateGoal  = useFinancialGoalStore(
    (state) => state.updateGoal,
  );

  const contribute = useFinancialGoalStore(
    (state) => state.contribute,
  );

  const archiveGoal = useFinancialGoalStore(
  (state) => state.archiveGoal,
);

  // ==========================================
  // WALLET STORE
  // ==========================================

  const wallets = useWalletStore(
    (state) => state.wallets,
  );

  const loadWallets = useWalletStore(
    (state) => state.loadWallets,
  );

  // ==========================================
  // ADD GOAL
  // ==========================================

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] =
    useState("");
  const [targetDate, setTargetDate] =
    useState("");

  // ==========================================
  // EDIT GOAL
  // ==========================================

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [editingAmount, setEditingAmount] =
    useState("");

  const [editingDate, setEditingDate] =
    useState("");

  // ==========================================
  // CONTRIBUTION
  // ==========================================

  const [contributionId, setContributionId] =
    useState<string | null>(null);

  const [contributionAmount, setContributionAmount] =
    useState("");

  const [contributionWalletId, setContributionWalletId] =
    useState("");

  // ==========================================
  // AUTH REDIRECT
  // ==========================================

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    if (user) {
      loadGoals(user.uid);
      loadWallets(user.uid);
    }
  }, [
    user,
    loadGoals,
    loadWallets,
  ]);

  // ==========================================
  // ADD GOAL
  // ==========================================

  const handleSubmit = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    if (
      !user ||
      !name.trim() ||
      !targetAmount
    ) {
      return;
    }

    const amount = Number(
      targetAmount.replace(/\D/g, ""),
    );

    if (!amount || amount <= 0) {
      return;
    }

    await createGoal(
      user.uid,
      name,
      amount,
      targetDate
        ? new Date(
            `${targetDate}T00:00:00`,
          )
        : null,
    );

    setName("");
    setTargetAmount("");
    setTargetDate("");
  };

  // ==========================================
  // EDIT GOAL
  // ==========================================

  const handleEdit = async (
    goalId: string,
  ) => {
    if (!user) {
      return;
    }

    const amount = Number(
      editingAmount.replace(/\D/g, ""),
    );

    if (
      !editingName.trim() ||
      !amount ||
      amount <= 0
    ) {
      return;
    }

    await updateGoal(
      user.uid,
      goalId,
      {
        name: editingName,
        targetAmount: amount,
        targetDate: editingDate
          ? new Date(
              `${editingDate}T00:00:00`,
            )
          : null,
      },
    );

    setEditingId(null);
  };

  // ==========================================
  // CONTRIBUTION
  // ==========================================

  const handleContribution = async (
    goalId: string,
  ) => {
    if (!user) {
      return;
    }

    if (!contributionWalletId) {
      return;
    }

    const amount = Number(
      contributionAmount.replace(/\D/g, ""),
    );

    if (!amount || amount <= 0) {
      return;
    }

    await contribute(
      user.uid,
      goalId,
      contributionWalletId,
      amount,
    );

    setContributionId(null);
    setContributionAmount("");
    setContributionWalletId("");

    // Refresh wallet data
    await loadWallets(user.uid);
  };

  // ==========================================
  // ARCHIVE
  // ==========================================

  const handleArchive = async (
    goalId: string,
  ) => {
    if (!user) {
      return;
    }

    if (
      !window.confirm(
        "Arsipkan financial goal ini?",
      )
    ) {
      return;
    }

    await archiveGoal(
      user.uid,
      goalId,
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

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

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Perencanaan masa depan
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Financial Goals
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Pantau target keuangan dan perkembangan tabunganmu.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              router.push("/dashboard")
            }
          >
            ← Dashboard
          </Button>
        </header>

        {/* ERROR */}

        {error && (
          <Card className="border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </Card>
        )}

        {/* ADD GOAL */}

        <Card className="p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">
              Tambah Financial Goal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Buat target tanpa mengurangi saldo wallet secara otomatis.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3"
          >
            <Input
              label="Nama tujuan"
              id="goalName"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Contoh: Dana Nikah"
              required
            />

            <Input
              label="Target nominal"
              id="goalAmount"
              type="number"
              min="1"
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(
                  event.target.value,
                )
              }
              placeholder="50000000"
              required
            />

            <Input
              label="Target tanggal"
              id="goalDate"
              type="date"
              value={targetDate}
              onChange={(event) =>
                setTargetDate(
                  event.target.value,
                )
              }
            />

            <div className="md:col-span-3">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !name ||
                  !targetAmount
                }
              >
                Tambah Goal
              </Button>
            </div>
          </form>
        </Card>

        {/* GOALS */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Target Keuangan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {goals.length} goal aktif.
            </p>
          </div>

          {loading && goals.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-500">
                Memuat financial goals...
              </p>
            </Card>
          ) : goals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-medium text-slate-700">
                Belum ada financial goal
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tambahkan tujuan keuangan pertamamu.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className="p-6"
                >

                  {/* EDIT */}

                  {editingId === goal.id ? (
                    <div className="space-y-4">

                      <Input
                        label="Nama tujuan"
                        id={`edit-name-${goal.id}`}
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(
                            event.target.value,
                          )
                        }
                      />

                      <Input
                        label="Target nominal"
                        id={`edit-amount-${goal.id}`}
                        type="number"
                        min="1"
                        value={editingAmount}
                        onChange={(event) =>
                          setEditingAmount(
                            event.target.value,
                          )
                        }
                      />

                      <Input
                        label="Target tanggal"
                        id={`edit-date-${goal.id}`}
                        type="date"
                        value={editingDate}
                        onChange={(event) =>
                          setEditingDate(
                            event.target.value,
                          )
                        }
                      />

                      <div className="flex gap-2">

                        <Button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              goal.id,
                            )
                          }
                          disabled={loading}
                        >
                          Simpan
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setEditingId(null)
                          }
                        >
                          Batal
                        </Button>

                      </div>
                    </div>
                  ) : (
                    <>
                      {/* HEADER GOAL */}

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {goal.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Target{" "}
                            {formatDate(
                              goal.targetDate,
                            )}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            goal.status ===
                            "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {goal.status ===
                          "completed"
                            ? "Tercapai"
                            : "Berjalan"}
                        </span>

                      </div>

                      {/* AMOUNT */}

                      <div className="mt-5">

                        <div className="flex items-end justify-between gap-4">

                          <div>
                            <p className="text-xs text-slate-500">
                              Terkumpul
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-900">
                              {formatCurrency(
                                goal.currentAmount,
                              )}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              Target
                            </p>

                            <p className="mt-1 font-semibold text-slate-700">
                              {formatCurrency(
                                goal.targetAmount,
                              )}
                            </p>
                          </div>

                        </div>

                        {/* PROGRESS */}

                        <div className="mt-4">

                          <div className="mb-2 flex justify-between text-xs text-slate-500">

                            <span>
                              {Math.round(
                                goal.progress,
                              )}
                              %
                            </span>

                            <span>
                              Kurang{" "}
                              {formatCurrency(
                                goal.remaining,
                              )}
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.min(
                                  goal.progress,
                                  100,
                                )}%`,
                              }}
                            />

                          </div>
                        </div>
                      </div>

                      {/* CONTRIBUTION */}

                      {contributionId ===
                      goal.id ? (

                        <div className="mt-5 space-y-4">

                          {/* WALLET */}

                          <Select
                            label="Dari Wallet"
                            id={`contribution-wallet-${goal.id}`}
                            value={
                              contributionWalletId
                            }
                            onChange={(event) =>
                              setContributionWalletId(
                                event.target.value,
                              )
                            }
                          >
                            <option value="">
                              Pilih wallet
                            </option>

                            {wallets.map(
                              (wallet) => (
                                <option
                                  key={wallet.id}
                                  value={wallet.id}
                                >
                                  {wallet.name}
                                </option>
                              ),
                            )}
                          </Select>

                          {/* AMOUNT */}

                          <Input
                            label="Nominal kontribusi"
                            id={`contribution-${goal.id}`}
                            type="number"
                            min="1"
                            value={
                              contributionAmount
                            }
                            onChange={(event) =>
                              setContributionAmount(
                                event.target.value,
                              )
                            }
                            placeholder="1000000"
                          />

                          <div className="flex gap-2">

                            <Button
                              type="button"
                              onClick={() =>
                                handleContribution(
                                  goal.id,
                                )
                              }
                              disabled={
                                loading ||
                                !contributionWalletId ||
                                !contributionAmount
                              }
                            >
                              Tambahkan
                            </Button>

                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setContributionId(
                                  null,
                                );

                                setContributionAmount(
                                  "",
                                );

                                setContributionWalletId(
                                  "",
                                );
                              }}
                            >
                              Batal
                            </Button>

                          </div>

                        </div>

                      ) : (

                        <div className="mt-5 flex flex-wrap gap-2">

                          <Button
                            type="button"
                            onClick={() => {
                              setContributionId(
                                goal.id,
                              );

                              setContributionAmount(
                                "",
                              );

                              setContributionWalletId(
                                "",
                              );
                            }}
                            disabled={
                              goal.status ===
                              "completed"
                            }
                          >
                            + Kontribusi
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setEditingId(
                                goal.id,
                              );

                              setEditingName(
                                goal.name,
                              );

                              setEditingAmount(
                                String(
                                  goal.targetAmount,
                                ),
                              );

                              const dateValue =
                                goal.targetDate
                                  ? goal.targetDate
                                      .toISOString()
                                      .split(
                                        "T",
                                      )[0]
                                  : "";

                              setEditingDate(
                                dateValue,
                              );
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="danger"
                            onClick={() =>
                              handleArchive(
                                goal.id,
                              )
                            }
                          >
                            Arsipkan
                          </Button>

                        </div>
                      )}
                    </>
                  )}
                </Card>
              ))}

            </div>
          )}
        </section>
      </div>
    </main>
  );
}