import { getTransactions } from "./transaction";
import { getWallets } from "./wallet";

export async function getWalletBalance(
  userId: string,
  walletId: string
): Promise<number> {
  const wallets = await getWallets(userId);

  const wallet = wallets.find(
    (item) => item.id === walletId
  );

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const transactions = await getTransactions(userId);

  let balance = wallet.initialBalance;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      if (transaction.walletId === walletId) {
        balance += transaction.amount;
      }
    }

    if (transaction.type === "expense") {
      if (transaction.walletId === walletId) {
        balance -= transaction.amount;
      }
    }

    if (transaction.type === "transfer") {
      if (transaction.fromWalletId === walletId) {
        balance -= transaction.amount;
      }

      if (transaction.toWalletId === walletId) {
        balance += transaction.amount;
      }
    }
  }

  return balance;
}