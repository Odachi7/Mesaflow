#!/bin/sh
# Startup script for production

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔄 Running database migrations..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
  
  if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully!"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️  Migration failed, retrying in 5 seconds..."
      sleep 5
    else
      echo "❌ Migrations failed after $MAX_RETRIES attempts"
      echo "⚠️  Continuing anyway - app will attempt to connect..."
    fi
  fi
done

echo "🚀 Starting application..."
node dist/main

