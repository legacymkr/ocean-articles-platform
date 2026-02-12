#!/bin/sh

echo "Starting Galatide Ocean application..."

# Debug: List current directory contents
echo "Current directory contents:"
ls -la

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "Error: server.js not found in $(pwd)"
    echo "Available files:"
    find . -name "*.js" -type f | head -10
    exit 1
fi

echo "Found server.js, starting application..."

# Start the Next.js server
exec node server.js
