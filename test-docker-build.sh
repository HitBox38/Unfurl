#!/bin/bash

echo "Testing Docker build for Windows packaging..."
echo "============================================="

# Build the Docker image
echo "Building Docker image with Node.js 18..."
docker build -t unfurl:win-test -f docker/Dockerfile.windows .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    echo "Running the build inside Docker..."
    docker run --name unfurl_test_container unfurl:win-test
    
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully!"
        echo ""
        echo "Checking for output files..."
        docker cp unfurl_test_container:/app/release/ ./test-release/
        
        if [ -f "./test-release/Unfurl-Windows-Setup.exe" ]; then
            echo "✅ Windows installer found: ./test-release/Unfurl-Windows-Setup.exe"
            echo ""
            echo "Cleaning up test files..."
            rm -rf ./test-release/
        else
            echo "⚠️  Windows installer not found in release directory"
        fi
        
        # Clean up container
        docker rm unfurl_test_container > /dev/null 2>&1
    else
        echo "❌ Build failed inside Docker!"
        docker rm unfurl_test_container > /dev/null 2>&1
    fi
else
    echo "❌ Docker image build failed!"
fi 