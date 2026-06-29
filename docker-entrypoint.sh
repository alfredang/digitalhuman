#!/bin/sh
# Apply migrations with retries (the DB may take a moment to accept connections),
# then start the server. We don't hard-exit on migrate failure so the container
# stays up and surfaces logs instead of crash-looping.
echo "→ Applying database migrations…"
n=0
until ./node_modules/.bin/prisma migrate deploy; do
  n=$((n + 1))
  if [ "$n" -ge 12 ]; then
    echo "⚠ migrate still failing after $n attempts — starting server anyway."
    break
  fi
  echo "migrate attempt $n failed; retrying in 5s…"
  sleep 5
done

echo "→ Starting Next.js…"
exec node server.js
