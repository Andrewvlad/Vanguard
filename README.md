# Vanguard Backend Take-Home

Barebones NestJS + BullMQ + AWS + Postgres pipeline

1. `POST /plates` enqueues a job
2. A separate worker process picks it up
3. Lambda is called to read the plate
4. Finally, Postgres is written to

## Stack

- NestJS (pnpm)
- Postgres w/ TypeORM
- BullMQ + Redis (ioredis)
- AWS SDK v3 (S3 + Lambda)

## Running

```bash
pnpm install
cp .env.example .env
pnpm build
node dist/main.js
node dist/consumers/worker/main.js
```

## Endpoints

| Method | Path       | Query                                   | Description                                     | Body                        | Status | Response                               |
| ------ | ---------- | --------------------------------------- | ----------------------------------------------- | --------------------------- | ------ |----------------------------------------|
| `POST` | `/uploads` | —                                       | Generates a presigned S3 upload URL for a JPEG  | —                           | `201`  | `{url, key, expiresIn}`                |
| `POST` | `/plates`  | —                                       | Enqueues a `plate-processing` job               | `{paymentId, plate, lotId}` | `202`  | `{jobId}`                              |
| `GET`  | `/plates`  | `lotId` (required), `take` (default 50) | Recent enforcements for a lot with their photos | —                           | `200`  | `Enforcement[]` (each with `Photos[]`) |

Note - for `POST /plates`, `plate` refers to the S3 object key from `POST /uploads` (e.g. `uploads/<uuid>.jpg`)

## Where each task lives

Each task had its own labeled commit that can easily be found in the commit log, as well as in its appropriate file.
SQL-specific tasks were added to their own `.sql` files within `sql/`

## Self-review

Things I'd flag in a code review of my own work -

### Assumptions

- Heavily mirrored patterns in NestJS documentation and code samples
- Much of the schema and implementation
- Preserved as many incongruencies to parity match the assignment (such as `POST /plates` actually writing a record to Enforcements)

### Things I'd change with more time

- Proper discussion of desired schema and services
- Minimal logging/observability
- Request schema validation using Zod
- Decide on how best to leverage .env
- Add tests, test, and deploy
- More error-path resilience
- Less hard-coded values derived from the assignment
- Add restore-case (ex. skip lambda if plate was already processed and cached)
- Incremental writes to Postgres during pipeline progression
- Connection pooling
- Swap to `createPresignedPost` from `PutObjectCommand`
- Swap `POST /uploads` to `GET`
- Use snake_case between DB and API responses
