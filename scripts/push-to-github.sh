#!/usr/bin/env bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN secret is not set. Add it in the Replit Secrets tab."
  exit 1
fi

REMOTE_NAME="github"
REMOTE_URL="https://github.com/PratikshaGaikwad06/pawrishta-fe.git"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if git remote get-url "$REMOTE_NAME" &>/dev/null; then
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

ASKPASS_SCRIPT="$(mktemp)"
printf '#!/bin/sh\necho "%s"\n' "$GITHUB_TOKEN" > "$ASKPASS_SCRIPT"
chmod +x "$ASKPASS_SCRIPT"

echo "Pushing branch '${CURRENT_BRANCH}' to GitHub..."
GIT_ASKPASS="$ASKPASS_SCRIPT" git push "$REMOTE_NAME" "${CURRENT_BRANCH}:main"
STATUS=$?

rm -f "$ASKPASS_SCRIPT"

if [ $STATUS -eq 0 ]; then
  echo "Done! Code is live at https://github.com/PratikshaGaikwad06/pawrishta-fe"
else
  echo "Push failed with exit code $STATUS"
  exit $STATUS
fi
