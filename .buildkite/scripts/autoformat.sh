#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)

yarn prettier --write $ROOT
terraform fmt -recursive $ROOT

if [[ `git status --porcelain` ]]; then
  git config user.name "Buildkite on behalf of Wellcome Collection"
  git config user.email "wellcomedigitalplatform@wellcome.ac.uk"

  git remote add ssh-origin $BUILDKITE_REPO || true
  git fetch ssh-origin
  git checkout --track ssh-origin/$BUILDKITE_BRANCH || true

  git add --verbose --update
  git commit -m "Apply auto-formatting rules"

  git push ssh-origin HEAD:$BUILDKITE_BRANCH
  exit 1;
else
  echo "There were no changes from auto-formatting"
  exit 0;
fi
