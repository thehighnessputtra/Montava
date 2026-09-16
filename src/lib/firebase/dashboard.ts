import { getCategories } from "./category";
import { getTransactions } from "./transaction";
import { getWallets } from "./wallet";
import { getBudgets } from "./budget";
import { getFinancialGoals } from "./financialGoal";

export interface MonthlyTrend {
  month: string;
  label: string;
  income: number;
  expense: number;
}

export interface ExpenseCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export interface DashboardGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  progress: number;
  remaining: number;
  status: "active" | "completed";
}

export interface DashboardBudget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  used: number;
  remaining: number;
  percentage: number;
}

export async function getDashboardData(userId: string) {
  /*
   * =========================
   * BASIC DATA
   * =========================
   */

  const [wallets, transactions, categories] =
    await Promise.all([
      getWallets(userId),
      getTransactions(userId),
      getCategories(userId),
    ]);

  /*
   * =========================
   * WALLET BALANCE
   * =========================
   */

  const balances: Record<string, number> = {};

  for (const wallet of wallets) {
    balances[wallet.id] = wallet.initialBalance;
  }

  for (const transaction of transactions) {
    if (
      transaction.type === "income" &&
      transaction.walletId
    ) {
      balances[transaction.walletId] =
        (balances[transaction.walletId] ?? 0) +
        transaction.amount;
    }

    if (
      transaction.type === "expense" &&
      transaction.walletId
    ) {
      balances[transaction.walletId] =
        (balances[transaction.walletId] ?? 0) -
        transaction.amount;
    }

    if (transaction.type === "transfer") {
      if (transaction.fromWalletId) {
        balances[transaction.fromWalletId] =
          (balances[transaction.fromWalletId] ?? 0) -
          transaction.amount;
      }

      if (transaction.toWalletId) {
        balances[transaction.toWalletId] =
          (balances[transaction.toWalletId] ?? 0) +
          transaction.amount;
      }
    }
  }

  const totalBalance =
    Object.values(balances).reduce(
      (total, balance) => total + balance,
      0,
    );

  /*
   * =========================
   * CURRENT MONTH
   * =========================
   */

  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  );

  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );

  let monthlyIncome = 0;
  let monthlyExpense = 0;

  const categoryMap = new Map<string, number>();

  for (const transaction of transactions) {
    const transactionDate =
      transaction.transactionDate.toDate();

    if (
      transactionDate >= startOfMonth &&
      transactionDate < endOfMonth
    ) {
      if (transaction.type === "income") {
        monthlyIncome += transaction.amount;
      }

      if (transaction.type === "expense") {
        monthlyExpense += transaction.amount;

        if (transaction.categoryId) {
          categoryMap.set(
            transaction.categoryId,
            (categoryMap.get(
              transaction.categoryId,
            ) ?? 0) + transaction.amount,
          );
        }
      }
    }
  }

  /*
   * =========================
   * EXPENSE BY CATEGORY
   * =========================
   */

  const expenseByCategory: ExpenseCategoryBreakdown[] =
    Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        categoryName:
          categories.find(
            (category) =>
              category.id === categoryId,
          )?.name ?? "Category lain",
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);

  /*
   * =========================
   * MONTHLY TREND
   * =========================
   */

  const monthlyTrend: MonthlyTrend[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - index,
      1,
    );

    const year = date.getFullYear();
    const month = date.getMonth();

    let income = 0;
    let expense = 0;

    for (const transaction of transactions) {
      const transactionDate =
        transaction.transactionDate.toDate();

      if (
        transactionDate.getFullYear() !== year ||
        transactionDate.getMonth() !== month
      ) {
        continue;
      }

      if (transaction.type === "income") {
        income += transaction.amount;
      }

      if (transaction.type === "expense") {
        expense += transaction.amount;
      }
    }

    monthlyTrend.push({
      month: `${year}-${String(
        month + 1,
      ).padStart(2, "0")}`,

      label: new Intl.DateTimeFormat(
        "id-ID",
        {
          month: "short",
        },
      ).format(date),

      income,
      expense,
    });
  }

  /*
   * =========================
   * RECENT TRANSACTIONS
   * =========================
   */

  const recentTransactions = [
    ...transactions,
  ]
    .sort(
      (a, b) =>
        b.transactionDate.toMillis() -
        a.transactionDate.toMillis(),
    )
    .slice(0, 5);

  /*
   * =========================
   * FINANCIAL GOALS
   * =========================
   */

  const goals = await getFinancialGoals(userId);

  /*
   * =========================
   * BUDGET
   * =========================
   *
   * Budget menggunakan JavaScript month:
   *
   * January  = 0
   * February = 1
   * ...
   * September = 8
   *
   * Jadi JANGAN +1 di sini.
   */

  const budgetsData = await getBudgets(
    userId,
    now.getFullYear(),
    now.getMonth(),
  );

  const budgets: DashboardBudget[] =
    budgetsData.map((budget) => ({
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: budget.categoryName,
      amount: budget.amount,
      used: budget.used,
      remaining: budget.remaining,
      percentage: budget.percentage,
    }));

  /*
   * =========================
   * RETURN DASHBOARD DATA
   * =========================
   */

  return {
    wallets,

    categories,

    transactions:
      recentTransactions,

    balances,

    totalBalance,

    monthlyIncome,

    monthlyExpense,

    expenseByCategory,

    monthlyTrend,

    goals,

    budgets,
  };
}