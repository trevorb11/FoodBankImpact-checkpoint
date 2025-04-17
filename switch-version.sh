#!/bin/bash
# Script to switch between TypeScript and vanilla versions

MODE=$1

if [ "$MODE" == "vanilla" ]; then
  echo "Switching to vanilla HTML/CSS/JS version..."
  cp .replit.vanilla .replit
  echo "Switched to vanilla version. You can now start the app with the Start application workflow."
elif [ "$MODE" == "typescript" ]; then
  echo "Switching to TypeScript React version..."
  cp .replit.typescript .replit
  echo "Switched to TypeScript version. You can now start the app with the Start application workflow."
else
  echo "Usage: ./switch-version.sh [vanilla|typescript]"
  echo "  vanilla - Switch to vanilla HTML/CSS/JS version"
  echo "  typescript - Switch to TypeScript React version"
  exit 1
fi