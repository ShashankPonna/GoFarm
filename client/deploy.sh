#!/bin/bash
# Deploy script for Vercel frontend

echo "Building frontend for production..."
cd client
npm install
npm run build

echo "Build complete! Upload the 'build' folder to Vercel"
