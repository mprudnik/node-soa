/** @typedef {import('./account').init} init */
import { AppError } from '../../lib/error.js';

/** @type init */
export const init = ({ db, bus }) => ({
  transfer: async ({ fromId, toId, amount }) => {
    const ledger = await db.ledger.findFirst({ where: { date: null } });
    if (!ledger) throw new AppError('Missing current ledger');

    const transaction = await db.transaction.create({
      data: {
        fromId,
        toId,
        amount,
        ledgerId: ledger.id,
      },
    });

    bus.publish('account.transfer', transaction);

    return { transactionId: transaction.id };
  },
});
