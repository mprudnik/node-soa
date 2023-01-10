import type { Infra } from '../../infra/types';
import type {
  Prisma,
  Account as AccountModel,
  AccountTransaction as AccountTransactionModel,
} from '@prisma/client';

interface Account {
  deposit(accountId: AccountModel['id'], amount: AccountTransactionModel['amount']): Promise<void>;
  withdraw(accountId: AccountModel['id'], amount: AccountTransactionModel['amount']): Promise<void>;
  transfer(
    fromId: AccountModel['id'],
    toId: AccountModel['id'],
    amount: AccountTransactionModel['amount'],
  ): Promise<void>;
}

export function getBalance(
  db: Infra['db'] | Prisma.TransactionClient,
  accountId: AccountModel['id'],
): Promise<number>

export function init(infra: Infra): Account;
