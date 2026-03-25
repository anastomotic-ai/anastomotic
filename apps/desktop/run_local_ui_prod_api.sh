#!/bin/bash
# Run desktop app with LOCAL UI (Vite hot reload) + PRODUCTION API
# UI: localhost:5173 | API: lite.anastomotic.ai
ANASTOMOTIC_UI_URL=http://localhost:3000 ANASTOMOTIC_API_URL=https://lite.anastomotic.ai pnpm dev
