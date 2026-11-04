#!/usr/bin/env bash
# Fails the build on unformatted files; run `yarn prettier --write . && terraform fmt -recursive` to fix.
set -o errexit
set -o nounset
set -o pipefail

ROOT=$(git rev-parse --show-toplevel)

yarn prettier --check "$ROOT"
terraform fmt -check -recursive -diff "$ROOT"
