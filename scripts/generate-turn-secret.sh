#!/usr/bin/env bash
set -euo pipefail
# Generates a 32-byte base64 secret suitable for coturn static-auth-secret
if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required. Install openssl to use this script." >&2
  exit 1
fi
secret=$(openssl rand -base64 32)
echo "Generated secret: $secret"
cat <<EOF

Add to your .env or secrets manager:
VIDEOCHAT_TURN_SECRET=$secret

(Do not commit secrets to git.)
EOF
