/**
 * Postgres Database Pool for PawReels
 */

import pg from 'pg-promise';
const pgp = pg();

export const pool = pgp({
  connectionString: process.env.DATABASE_URL,
  max: 30,
  allowExitOnIdle: true,
});

// Helper methods
export const db = {
  one: pool.one.bind(pool),
  oneOrNone: pool.oneOrNone.bind(pool),
  many: pool.many.bind(pool),
  any: pool.any.bind(pool),
  none: pool.none.bind(pool),
  result: pool.result.bind(pool),
  tx: pool.tx.bind(pool),
};

export default pool;

