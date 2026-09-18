# Vault — Personal Cloud Drive

A full-stack, simplified Google Drive clone: authentication, folders, file
upload/download/preview, trash, search, sharing, and a storage dashboard.

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma (SQLite in dev, swap to
  Postgres for prod), JWT auth, storage abstraction (local disk or S3).
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand.

## Running it

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit JWT_ACCESS_SECRET / JWT_REFRESH_SECRET first
npm install
npx prisma migrate dev --name init   # creates dev.db and applies the schema
npm run dev
```

API runs at `http://localhost:4000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` and `/share` to the
backend (see `vite.config.ts`).

### 3. Try it

1. Open `http://localhost:5173/register`, create an account.
2. Upload a file by dragging it onto the dropzone.
3. Create a folder, drag a file onto it to move it.
4. Right-click-style "…" menu on a file → Share → creates a public link at
   `/share/:token`, copied to your clipboard automatically.
5. Delete a file → check the Trash page → restore it or delete it forever.

## Switching to S3 in production

Set in `backend/.env`:

```
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
# S3_ENDPOINT + S3_FORCE_PATH_STYLE=true if using MinIO/R2/B2 instead of AWS
```

No code changes needed — `src/storage/index.ts` picks the driver at startup.

## Switching to Postgres in production

In `backend/prisma/schema.prisma`, change:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Update `DATABASE_URL` to a Postgres connection string, delete the SQLite
migration folder, and run `npx prisma migrate dev --name init` again to
generate a Postgres-flavored migration.

## Notes on what's implemented

- Soft-delete (`deletedAt`) powers Trash for both files and folders;
  permanently deleting also removes the underlying storage object.
- Storage quota is enforced on upload and copy.
- Share links support an optional password, optional expiry, and
  view-only vs. download permission.
- Executable/script file extensions are blocked on upload as a basic
  malware-vector guard; adjust the blocklist in
  `backend/src/modules/files/files.validation.ts` if needed.
