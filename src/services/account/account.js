/** @typedef {import('./account').init} init */

/** @type init */
export const init = ({ db, bus }) => ({
  transfer: async ({ fromId, toId, amount }) => {
    const ledger = await db.ledger.findFirst({ where: { date: null } });
    if (!ledger) throw new Error('Missing current ledger');

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
