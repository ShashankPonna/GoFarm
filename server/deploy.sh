#!/bin/bash
# Deploy script for Render backend

echo "Building backend for production..."
npm install

echo "Starting server on port 10000..."
npm start
