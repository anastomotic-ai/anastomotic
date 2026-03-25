#!/bin/bash
# Run desktop app with PRODUCTION UI + PRODUCTION API
# UI: lite.anastomotic.ai | API: lite.anastomotic.ai
# This builds an unpacked app and runs it (no hot reload)

set -e

echo "Building unpacked app for production..."
pnpm -F @anastomotic/desktop build:unpack

echo "Launching app with production configuration..."
ANASTOMOTIC_UI_URL=https://lite.anastomotic.ai \
ANASTOMOTIC_API_URL=https://lite.anastomotic.ai \
open apps/desktop/release/mac-arm64/Anastomotic.app
