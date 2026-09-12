#!/bin/bash
set -e

echo "Testing Docker build for Windows packaging..."
echo "============================================="

# Build the image
docker build -t unfurl:win-test -f docker/Dockerfile.windows .
echo "Docker image built successfully."

# Run the build inside the container
docker run --name unfurl_test_container unfurl:win-test

# Pull the release artifacts back out
docker cp unfurl_test_container:/app/release/ ./test-release/

if [ -f "./test-release/Unfurl-Windows-Setup.exe" ]; then
    echo "Windows installer found: ./test-release/Unfurl-Windows-Setup.exe"
    rm -rf ./test-release/
else
    echo "Windows installer not found in release directory" >&2
    exit 1
fi

docker rm unfurl_test_container >/dev/null 2>&1
