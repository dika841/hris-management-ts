# Backup and restore

A backup nobody has restored is not a backup. The restore drill below is the part that matters; run it on a schedule, not after an incident.

## What holds state

| Store | Backed up | Why |
|---|---|---|
| Postgres | Yes | The only source of truth. Users, roles, notes, activity log, auth sessions |
| Redis | No | Rate-limit counters and job de-duplication claims. Both are short-lived and rebuild themselves. Losing Redis costs a window of duplicate-job protection, not data |
| RabbitMQ | No, but drain before planned downtime | Queues are durable and messages persistent, so a broker restart keeps them. A destroyed volume loses in-flight and dead-lettered jobs, which is why the dead-letter queue should be drained rather than left to accumulate |
| Object storage | Not yet applicable | `@app/storage` exists but nothing uses it. Add a policy here before the first upload endpoint ships |

## Postgres backup

Nightly full dump plus continuous WAL archiving. The dump alone gives a coarse recovery point; WAL is what makes point-in-time recovery possible after a bad migration or a mistaken delete.

```sh
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" > standard-$(date -u +%Y%m%dT%H%M%SZ).dump
```

| Setting | Value | Rationale |
|---|---|---|
| Frequency | Nightly full, WAL continuous | |
| Retention | 30 daily, 12 monthly | A schema mistake is often noticed weeks later |
| Location | A different account or project from the database | A backup in the same blast radius as the thing it protects is not a backup |
| Encryption | At rest, with a key not stored alongside the backup | The dump contains password hashes and session rows |

Restrict who can read the dumps to the same set who can read production. It is the same data.

## Restore

```sh
createdb standard_restore
pg_restore --no-owner --no-acl --dbname=standard_restore standard-<timestamp>.dump
```

Then point a non-production API at it, run `pnpm --filter @app/api migrate`, and check `/ready` reports both dependencies up.

## The drill

Quarterly, and before any release that carries a destructive migration:

1. Restore the most recent nightly dump into a scratch database
2. Run the migrations against it and confirm the run is clean
3. Start an API against it and confirm `GET /ready` answers 200
4. Sign in as a seeded user and read one record from each of users, roles, notes, and the activity log
5. Record the wall-clock time from step 1 to step 4, and the age of the restored data

Step 5 is the output. Those two numbers are the real recovery time and recovery point; anything written in a plan without them is a guess.

| Objective | Target | Last measured |
|---|---|---|
| Recovery time | 1 hour | Not yet measured |
| Recovery point | 24 hours without WAL, 5 minutes with it | Not yet measured |

Fill the last column in after the first drill. An unmeasured target is a guess, and this table is deliberately honest that nobody has run it yet.
