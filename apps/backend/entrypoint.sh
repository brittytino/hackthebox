#!/bin/sh
set -e

echo "=== Syncing database schema ==="
npx prisma db push --accept-data-loss

echo "=== Seeding database (skips if already seeded) ==="
npx prisma db seed || echo "Seeding skipped (data may already exist)"

echo "=== Starting application ==="
node dist/src/main
