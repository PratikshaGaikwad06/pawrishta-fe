#!/usr/bin/env bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN secret is not set. Add it in the Replit Secrets tab."
  exit 1
fi

git remote set-url github "https://PratikshaGaikwad06:${GITHUB_TOKEN}@github.com/PratikshaGaikwad06/pawrishta-fe.git" 2>/dev/null || \
  git remote add github "https://PratikshaGaikwad06:${GITHUB_TOKEN}@github.com/PratikshaGaikwad06/pawrishta-fe.git"

echo "Pushing to GitHub..."
git push github HEAD:main
echo "Done! Code is live at https://github.com/PratikshaGaikwad06/pawrishta-fe"
