import type { Infra } from '../../infra/types';
import type { Transaction } from '@prisma/client';

interface Wallet {
  transfer(params: Pick<Transaction, 'fromId' | 'toId' | 'amount'>): Promise<{ transactionId: string; }>;
}

export function init(infra: Infra): Wallet;
