#!/bin/bash

# Export Docker images for offline transfer
# This script saves all required Docker images to tar files

set -e

OUTPUT_DIR="${1:-./docker-images}"
mkdir -p "${OUTPUT_DIR}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Exporting Docker Images for Offline Deployment          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

IMAGES=(
    "supabase/postgres:15.1.0.147"
    "supabase/studio:20231123-64a766a"
    "kong:2.8.1"
    "supabase/gotrue:v2.99.0"
    "postgrest/postgrest:v11.2.0"
    "supabase/realtime:v2.25.35"
    "supabase/storage-api:v0.40.4"
    "supabase/postgres-meta:v0.68.0"
    "nginx:alpine"
    "node:20-alpine"
)

echo "📦 Pulling latest images..."
for IMAGE in "${IMAGES[@]}"; do
    echo "   Pulling ${IMAGE}..."
    docker pull "${IMAGE}"
done

echo ""
echo "💾 Saving images to ${OUTPUT_DIR}..."

for IMAGE in "${IMAGES[@]}"; do
    # Convert image name to filename (replace / and : with -)
    FILENAME=$(echo "${IMAGE}" | sed 's/[\/:]/-/g')
    OUTPUT_FILE="${OUTPUT_DIR}/${FILENAME}.tar"
    
    echo "   Saving ${IMAGE} to ${FILENAME}.tar..."
    docker save -o "${OUTPUT_FILE}" "${IMAGE}"
    
    # Compress the tar file
    echo "   Compressing ${FILENAME}.tar..."
    gzip "${OUTPUT_FILE}"
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                Export Complete! ✅                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📂 Images saved to: ${OUTPUT_DIR}"
echo ""
echo "📦 Files:"
ls -lh "${OUTPUT_DIR}"
echo ""
echo "📝 To load images on offline machine:"
echo "   1. Transfer ${OUTPUT_DIR} directory to target machine"
echo "   2. Run: scripts/import-images.sh ${OUTPUT_DIR}"
echo ""
