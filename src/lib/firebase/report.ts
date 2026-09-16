import { getCategories } from "./category";
import { getTransactions } from "./transaction";

export interface ReportSummary {
  income: number;
  expense: number;
  net: number;
}

export interface ReportCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface ReportData {
  summary: ReportSummary;
  categories: ReportCategory[];
  transactions: Awaited<ReturnType<typeof getTransactions>>;
}

export async function getFinancialReport(
  userId: string,
  year: number,
  month: number,
): Promise<ReportData> {
  const [transactions, categories] = await Promise.all([
    getTransactions(userId),
    getCategories(userId),
  ]);

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = transaction.transactionDate.toDate();

    return date >= startDate && date < endDate;
  });

  let income = 0;
  let expense = 0;

  const categoryAmounts = new Map<string, number>();

  for (const transaction of monthlyTransactions) {
    if (transaction.type === "income") {
      income += transaction.amount;
    }

    if (transaction.type === "expense") {
      expense += transaction.amount;

      if (transaction.categoryId) {
        categoryAmounts.set(
          transaction.categoryId,
          (categoryAmounts.get(transaction.categoryId) ?? 0) +
            transaction.amount,
        );
      }
    }
  }

  const categoriesReport = Array.from(categoryAmounts.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName:
        categories.find((category) => category.id === categoryId)?.name ??
        "Category lain",
      amount,
      percentage: expense > 0 ? (amount / expense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    summary: {
      income,
      expense,
      net: income - expense,
    },
    categories: categoriesReport,
    transactions: [...monthlyTransactions].sort(
      (a, b) =>
        b.transactionDate.toMillis() - a.transactionDate.toMillis(),
    ),
  };
}
