/** @typedef {import('./wallet').init} init */

/** @type init */
export const init = ({ db, bus }) => ({
  transfer: async ({ fromAccount, toAccount, amount }) => {
    const transaction = await db.transaction.create({
      data: {
        fromId: fromAccount,
        toId: toAccount,
        amount,
        type: 'TRANSFER',
      },
    });

    bus.publish('wallet.transfer', transaction);

    return { transactionId: transaction.id };
  },
});
