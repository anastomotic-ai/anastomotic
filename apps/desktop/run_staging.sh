#!/bin/bash
# Run desktop app with STAGING UI + STAGING API
# UI: lite-staging.anastomotic.ai | API: lite-staging.anastomotic.ai
# This builds an unpacked app and runs it (no hot reload)

set -e

echo "Building unpacked app for staging..."
pnpm -F @anastomotic/desktop build:unpack

echo "Launching app with staging configuration..."
ANASTOMOTIC_UI_URL=https://lite-staging.anastomotic.ai \
ANASTOMOTIC_API_URL=https://lite-staging.anastomotic.ai \
open apps/desktop/release/mac-arm64/Anastomotic.app
