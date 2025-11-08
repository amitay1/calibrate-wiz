#!/bin/bash

# Import Docker images from tar files
# This script loads Docker images for offline deployment

set -e

INPUT_DIR="${1:-./docker-images}"

if [ ! -d "${INPUT_DIR}" ]; then
    echo "❌ Error: Directory ${INPUT_DIR} not found"
    echo "Usage: $0 <path-to-images-directory>"
    exit 1
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Importing Docker Images from Offline Archive            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📂 Loading images from: ${INPUT_DIR}"
echo ""

for ARCHIVE in "${INPUT_DIR}"/*.tar.gz; do
    if [ -f "${ARCHIVE}" ]; then
        echo "📥 Loading $(basename "${ARCHIVE}")..."
        gunzip -c "${ARCHIVE}" | docker load
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                Import Complete! ✅                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Imported Images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
echo ""
echo "✅ You can now run: docker-compose up -d"
echo ""
