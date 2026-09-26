# Credentials

**What the application restricts and what the credential allows are two different things, and both have to be written down.** An application that only ever writes to `bucket/notes/` has not been granted only that. If the key it holds carries account-wide access, then one bug, one injected path, or one leaked environment variable reaches everything that key can reach. A prefix in the code is a convention. The policy attached to the key is the boundary.

So every credential below is described twice: what the provider actually grants, and what the application chooses to do with it. When those two columns differ a lot, the gap is the risk.

## Current credentials

| Credential | Provider grants | Application restricts itself to | Rotation |
|---|---|---|---|
| `DATABASE_URL` | Full read and write on the application database, including DDL, since migrations run as this role | Everything it is granted. Nothing narrower is claimed | On exposure |
| `REDIS_URL` | Full access to the instance | Two key namespaces, `rate-limit:` and `job-dedupe:`, through `cacheKeyCreate` | On exposure |
| `RABBITMQ_URL` | Full access to the virtual host | The queues named in `QUEUE_NAME` plus their `.retry` and `.dlq` siblings | On exposure |
| `SMTP_URL` | Send as the configured account | Outbound mail only, from `MAIL_FROM` | On exposure |
| `BETTER_AUTH_SECRET` | Signs and verifies every session | Session tokens only. Refused at boot below 32 characters | On exposure, which invalidates every session |
| `METRICS_TOKEN` | Reads `/metrics` on the api: request counts and durations by route and status, plus process memory, CPU and event loop figures | Nothing else. It authorises no application route and carries no session | On exposure. Rotating it only interrupts scraping |

Object storage has no entry because **no object storage credential exists yet**. `@app/storage` is written and tested but imported by nothing, and there is no S3 environment variable in `apps/api/.env.example` or `env-schema.ts`.

## Before the first object storage key is issued

That absence is an opportunity: the policy can be written before there is anything to audit. Whoever issues the first key does it under these rules, and adds a row above.

- **One key per application per environment.** Never a shared account key, and never the same key in staging and production. A key that serves two things cannot be revoked for one of them
- **Scoped to a single bucket**, named in the policy, not implied by usage
- **Scoped to a prefix** where the application uses one. The prefix in the code and the prefix in the policy are stated together, so a reviewer can see whether they match
- **Actions limited to what the code calls.** `@app/storage` uses `GET`, `PUT`, and `DELETE` on objects, plus presigned URL generation, which needs no extra grant. It never lists buckets and never touches bucket configuration, so neither should the policy
- **No public bucket.** Presigned URLs through `getUrl` are how an object reaches a browser, and they expire

If a rule cannot be honoured, write the exception in the table above rather than leaving the row optimistic. A credential described as narrower than it is, is worse than one described accurately as broad.
