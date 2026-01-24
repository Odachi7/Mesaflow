#!/bin/sh
# Startup script for production

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🚀 Starting application..."
node dist/main
