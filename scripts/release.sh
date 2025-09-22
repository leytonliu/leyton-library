#!/usr/bin/env bash

set -euo pipefail

# Usage: scripts/release.sh [patch|minor|major] [--tag TAG]
# Examples:
#   scripts/release.sh patch
#   scripts/release.sh minor --tag beta

###############################################
# Config (can be overridden by env variables) #
###############################################
REGISTRY_URL=${REGISTRY_URL:-"https://registry.npmjs.org/"}
PROXY_HTTP=${PROXY_HTTP:-""}
PROXY_HTTPS=${PROXY_HTTPS:-""}
PROXY_ALL=${PROXY_ALL:-""}

###############################################
# Args                                         #
###############################################
VERSION_BUMP="${1:-patch}"
PUBLISH_TAG="latest"
if [[ "${2:-}" == "--tag" ]]; then
  PUBLISH_TAG="${3:-latest}"
fi

###############################################
# Helpers                                     #
###############################################
step() { echo "\n[release] $1"; }
fail() { echo "[release][ERROR] $1" >&2; exit 1; }

###############################################
# Pre-checks                                  #
###############################################
step "Checking git working tree is clean"
if [[ -n "$(git status --porcelain)" ]]; then
  step "Working directory not clean. Auto-committing changes..."
  git add .
  git commit -m "chore: auto-commit before release"
fi

step "Ensuring Node and npm are available"
command -v node >/dev/null 2>&1 || fail "node not found"
command -v npm >/dev/null 2>&1 || fail "npm not found"

step "Setting (optional) proxy env"
if [[ -n "$PROXY_HTTP" ]]; then export http_proxy="$PROXY_HTTP"; fi
if [[ -n "$PROXY_HTTPS" ]]; then export https_proxy="$PROXY_HTTPS"; fi
if [[ -n "$PROXY_ALL" ]]; then export all_proxy="$PROXY_ALL"; fi

step "Setting npm registry to $REGISTRY_URL"
npm config set registry "$REGISTRY_URL"

step "Checking npm auth"
if ! npm whoami >/dev/null 2>&1; then
  fail "Not logged in to npm. Run: npm login --registry=$REGISTRY_URL"
fi

###############################################
# Build                                       #
###############################################
step "Building project"
npm run build

###############################################
# Version bump                                #
###############################################
step "Bumping version: $VERSION_BUMP"
# 手动更新子包版本
for pkg in packages/*/package.json; do
  if [ -f "$pkg" ]; then
    pkg_dir=$(dirname "$pkg")
    echo "Updating version in $pkg_dir"
    cd "$pkg_dir"
    npm version "$VERSION_BUMP" --no-git-tag-version
    cd - > /dev/null
  fi
done
# 更新主包版本
npm version "$VERSION_BUMP" -m "release: %s"

###############################################
# Push changes                                #
###############################################
step "Pushing commits and tags"
git push
git push --tags

###############################################
# Publish                                     #
###############################################
step "Publishing to $REGISTRY_URL with tag $PUBLISH_TAG"
npm publish --workspaces --access public --tag "$PUBLISH_TAG" --registry="$REGISTRY_URL"

step "Release completed successfully"