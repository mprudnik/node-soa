// @ts-nocheck
import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as auth from './auth.js';

describe('auth/sign-up', () => {
  it('works', async () => {
    const bus = getBus();
    const db = getDb();
    const service = auth.init({ db, bus });

    const params = {
      email: 'test@mail.com',
      password: 'test',
      firstName: 'max',
      lastName: 'prudnik',
    };

    const result = await service.signUp(params);

    assert.equal(result.userId, userId);
    assert.ok(result.token);

    assert.equal(bus.events.length, 1);
    assert.deepEqual(bus.events[0], {
      name: 'auth.signUp',
      data: { email: params.email },
    });
  });

  const getBus = () => ({
    events: [],
    publish(name, data) {
      this.events.push({ name, data });
    },
  });

  const userId = '1';
  const getDb = () => ({
    user: {
      findInvokedWith: null,
      createInvokedWith: null,
      findUnique({ where }) {
        this.findInvokedWith = where;
        return Promise.resolve(null);
      },
      create({ data }) {
        this.createInvokedWith = data;
        return Promise.resolve({ id: userId });
      },
    },
    session: {
      createInvokedWith: null,
      create({ data }) {
        this.createInvokedWith = data;
        return Promise.resolve();
      },
    },
  });
});
