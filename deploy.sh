#!/usr/bin/env bash
# Deploy popn-medal. The bookmarklet URL is FIXED at @main and never changes.
# This pushes to main and then purges jsDelivr so @main serves the new file immediately.
set -e
cd "$(dirname "$0")"
MSG="${1:-update}"
GIT="git -c user.name=Yasukei404 -c user.email=yasukei404@gmail.com"
$GIT add -A
$GIT commit -m "$MSG" || echo "(nothing to commit)"
git push origin main
echo "purging jsDelivr @main cache..."
curl -s "https://purge.jsdelivr.net/gh/Yasukei404/popn-medal@main/medal-census.js" | head -c 300; echo
echo "done. URL stays: https://cdn.jsdelivr.net/gh/Yasukei404/popn-medal@main/medal-census.js"
