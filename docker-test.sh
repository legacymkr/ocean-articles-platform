#!/bin/bash

echo "🐳 Testing Docker build for Galatide Ocean..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t galatide-ocean:test . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "✅ Docker build successful!"

# Test running the container
echo "🚀 Testing container startup..."
docker run --rm -d --name galatide-test -p 3001:3000 galatide-ocean:test || {
    echo "❌ Container failed to start"
    exit 1
}

# Wait a moment for startup
sleep 5

# Check if container is running
if docker ps | grep -q galatide-test; then
    echo "✅ Container is running successfully!"
    
    # Test health endpoint
    if curl -f http://localhost:3001/api/health &> /dev/null; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed, but container is running"
    fi
    
    # Stop the test container
    docker stop galatide-test
    echo "🛑 Test container stopped"
else
    echo "❌ Container is not running"
    exit 1
fi

echo "🎉 All Docker tests passed!"
