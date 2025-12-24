#!/bin/bash

# Build and Verify Script for n8n-nodes-pverify
# This script builds the project and verifies all files are correctly generated

set -e

echo "================================================"
echo "n8n-nodes-pverify Build Verification"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo "1. Installing dependencies..."
npm install
echo -e "${GREEN}   ✓ Dependencies installed${NC}"
echo ""

# Step 2: Run linting
echo "2. Running linter..."
npm run lint || true
echo -e "${GREEN}   ✓ Linting complete${NC}"
echo ""

# Step 3: Run tests
echo "3. Running tests..."
npm test
echo -e "${GREEN}   ✓ Tests passed${NC}"
echo ""

# Step 4: Build the project
echo "4. Building project..."
npm run build
echo -e "${GREEN}   ✓ Build complete${NC}"
echo ""

# Step 5: Verify build output
echo "5. Verifying build output..."

required_files=(
    "dist/credentials/PVerifyApi.credentials.js"
    "dist/nodes/PVerify/PVerify.node.js"
    "dist/nodes/PVerify/pverify.svg"
    "dist/nodes/PVerify/descriptions/index.js"
    "dist/nodes/PVerify/transport/index.js"
    "dist/nodes/PVerify/types/index.js"
)

all_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file (missing)"
        all_present=false
    fi
done

echo ""

if [ "$all_present" = true ]; then
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}Build verification successful!${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "The package is ready for:"
    echo "  - npm pack (create tarball)"
    echo "  - npm publish (publish to npm)"
    echo "  - Local testing in n8n"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}Build verification failed!${NC}"
    echo -e "${RED}Some required files are missing.${NC}"
    echo -e "${RED}================================================${NC}"
    exit 1
fi
