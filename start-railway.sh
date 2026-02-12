#!/bin/bash

# Railway start script - ensures PORT is set correctly
echo "🚂 Starting Railway deployment..."
echo "📍 PORT: ${PORT:-8080}"
echo "🌍 Environment: ${NODE_ENV}"

# Set default PORT if not provided
export PORT=${PORT:-8080}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "🚀 Starting Next.js standalone server..."

# Start the Next.js standalone server
exec node .next/standalone/server.js
