#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "============================================"
echo "   TeamSpeak 6 Accessibility Injector"
echo "============================================"
echo ""

# Ensure make is available
if ! command -v make &> /dev/null; then
    echo "Error: 'make' command not found."
    echo "Please install Xcode Command Line Tools by running: xcode-select --install"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Launching..."
# 'make run' handles setup dependencies automatically
make run

echo ""
echo "Process finished."
read -p "Press Enter to close this window..."
