#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx prisma db seed || echo "Seeding skipped (may already exist)"

echo "Starting application..."
node dist/src/main
