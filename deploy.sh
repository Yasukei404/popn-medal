#!/usr/bin/env bash
# Deploy popn-medal. The bookmarklet URL is FIXED at @main and never changes.
# Push to main, then purge jsDelivr so @main serves the new file immediately.
# NOTE: purge must run AFTER GitHub has propagated the push to jsDelivr's origin,
# otherwise the purge re-caches the OLD file. We wait, then purge twice.
set -e
cd "$(dirname "$0")"
MSG="${1:-update}"
GIT="git -c user.name=Yasukei404 -c user.email=yasukei404@gmail.com"
$GIT add -A
$GIT commit -m "$MSG" || echo "(nothing to commit)"
git push origin main
echo "waiting for GitHub->jsDelivr propagation..."
sleep 10
for i in 1 2 3; do
  echo "purge attempt $i:"
  curl -s "https://purge.jsdelivr.net/gh/Yasukei404/popn-medal@main/medal-census.js" | grep -o '"status":[^,]*' || true
  sleep 4
done
echo "done. URL stays: https://cdn.jsdelivr.net/gh/Yasukei404/popn-medal@main/medal-census.js"
