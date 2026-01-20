#!/bin/sh
# Simple wait script without dependencies on env vars

set -e

host="$1"
shift
cmd="$@"

>&2 echo "Checking if Postgres is ready..."

until nc -z "$host" 5432; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

>&2 echo "Postgres is up - starting application"
exec $cmd
