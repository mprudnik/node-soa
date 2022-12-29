// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as account from './account.js';

describe('Account service', () => {
  it('transfers the money', async () => {
    const db = getDB();
    const bus = getBus();
    const service = account.init({ db, bus });

    const params = { fromId: 'from', toId: 'to', amount: 10 };
    const result = await service.transfer(params);

    assert.deepEqual(result, { transactionId });
    assert.equal(db.ledger.invokedWith.date, null);
    assert.deepEqual(db.transaction.invokedWith, { ...params, ledgerId });
    assert.equal(bus.events.length, 1);
    assert.deepEqual(bus.events[0], {
      name: 'account.transfer',
      data: { id: transactionId },
    });
  });

  const getBus = () => ({
    events: [],
    publish(name, data) {
      this.events.push({ name, data });
    },
  });

  const ledgerId = '1';
  const transactionId = '1';
  const getDB = () => ({
    ledger: {
      invokedWith: null,
      findFirst({ where }) {
        this.invokedWith = where;
        return { id: ledgerId };
      },
    },
    transaction: {
      invokedWith: null,
      create({ data }) {
        this.invokedWith = data;
        return { id: transactionId };
      },
    },
  });
});
