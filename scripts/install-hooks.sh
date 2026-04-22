#!/bin/sh
# Lance ce script une seule fois pour activer l'auto-push après chaque commit
# Usage : sh scripts/install-hooks.sh

HOOKS_DIR=".git/hooks"
SCRIPT_DIR="scripts/hooks"

cp "$SCRIPT_DIR/post-commit" "$HOOKS_DIR/post-commit"
chmod +x "$HOOKS_DIR/post-commit"
echo "✅ Hook post-commit installé — chaque commit pushera automatiquement vers GitHub."
