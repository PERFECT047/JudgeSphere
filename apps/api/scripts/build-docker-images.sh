#!/bin/bash
# build-docker-images.sh
# Builds all Docker judge images for code execution
# Usage: ./build-docker-images.sh

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/../docker"

# Image name prefix
PREFIX="judgesphere"

echo "🚀 Building Judge Docker Images..."
echo "================================"

# Build each language image
build_image() {
    local lang_id="$1"
    local dockerfile_name="$2"
    local image_name="${PREFIX}/${lang_id}-runner:latest"

    echo ""
    echo "📦 Building $lang_id ($image_name)..."

    if docker build \
        -t "$image_name" \
        -f "$DOCKER_DIR/Dockerfile.$dockerfile_name" \
        "$DOCKER_DIR" 2>&1; then
        echo "✅ Successfully built $image_name"
    else
        echo "❌ Failed to build $image_name"
        exit 1
    fi
}

build_image "c" "c"
build_image "cpp" "cpp"
build_image "java" "java"
build_image "python" "python"
build_image "javascript" "javascript"
build_image "typescript" "typescript"
build_image "go" "go"
build_image "rust" "rust"

echo ""
echo "================================"
echo "✅ All Docker images built successfully!"
echo ""
echo "Images created:"
echo "  - ${PREFIX}/c-runner:latest"
echo "  - ${PREFIX}/cpp-runner:latest"
echo "  - ${PREFIX}/java-runner:latest"
echo "  - ${PREFIX}/python-runner:latest"
echo "  - ${PREFIX}/javascript-runner:latest"
echo "  - ${PREFIX}/typescript-runner:latest"
echo "  - ${PREFIX}/go-runner:latest"
echo "  - ${PREFIX}/rust-runner:latest"