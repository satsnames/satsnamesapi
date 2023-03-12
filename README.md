# Sats Names API

[Documentation](https://docs.sats.id)

This repo is the codebase for the Sats Names API, which is available at [api.sats.id](https://api.sats.id).

## Local Development

Install dependencies:

```bash
pnpm install
```

Create a `.env` file with `DATABASE_URL` pointing to a Postgres database URL.

```dotenv
DATABASE_URL="postgresql://localhost:5432/sats-api-dev"
```

Finally, run the server with:

```pnpm
pnpm dev
```

## Hosting the API

Running a hosted version of the API requires a Postgres instance available at the `DATABASE_URL` environment variable.

A `Dockerfile` is provided, which can be used to easily deploy the project.

## Project architecture

A few notes about the tech stack of the Sats Names API:

- All code is in TypeScript
- Fastify as the server framework
- Prisma as the database ORM

Included in the codebase is a small "worker" architecture, which is used to constantly stay in sync with the Ordinals network. When running the server, a scheduled job is configured to sync with any newly minted Ordinals.

To run the server without running the worker, set the environment variable `RUN_SYNC` to `"false"`. This allows for running a typical worker/server setup.
