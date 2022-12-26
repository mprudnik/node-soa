import type { Infra } from '../../infra/types';

interface Wallet {
  transfer(params: {
    fromAccount: string;
    toAccount: string;
    amount: number;
  }): Promise<{ transactionId: string; }>;
}

export function init(infra: Infra): Wallet;
