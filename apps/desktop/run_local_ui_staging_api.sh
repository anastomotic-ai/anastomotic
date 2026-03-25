#!/bin/bash
# Run desktop app with LOCAL UI (Vite hot reload) + STAGING API
# UI: localhost:5173 | API: lite-staging.anastomotic.ai
ANASTOMOTIC_UI_URL=http://localhost:3000 ANASTOMOTIC_API_URL=https://lite-staging.anastomotic.ai pnpm dev
