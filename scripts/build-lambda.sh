#!/bin/bash

# Build script for Lambda deployment package
# This script builds the .NET application and packages it for Lambda

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
OUTPUT_DIR="$BACKEND_DIR/publish"
LAMBDA_PACKAGE="$OUTPUT_DIR/lambda-package.zip"

echo "Building Lambda deployment package..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf "$OUTPUT_DIR"
rm -f "$LAMBDA_PACKAGE"

# Restore dependencies
echo "Restoring dependencies..."
cd "$BACKEND_DIR"
dotnet restore

# Build and publish
echo "Building and publishing application..."
dotnet publish "$BACKEND_DIR/Api" \
  --configuration Release \
  --output "$OUTPUT_DIR" \
  --self-contained false \
  /p:PublishReadyToRun=true

# Create Lambda deployment package
echo "Creating Lambda deployment package..."
cd "$OUTPUT_DIR"
zip -r "$LAMBDA_PACKAGE" . -q -x "lambda-package.zip"

echo "Lambda package created: $LAMBDA_PACKAGE"
echo "Package size: $(du -h "$LAMBDA_PACKAGE" | cut -f1)"

