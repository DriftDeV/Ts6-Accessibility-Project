#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "============================================"
echo "   TeamSpeak 6 Accessibility Injector"
echo "============================================"
echo ""

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: 'python3' command not found."
    echo "Please install Python 3 from https://www.python.org/downloads/ or via Homebrew."
    read -p "Press Enter to exit..."
    exit 1
fi

VENV_DIR="ts_venv"

# Check if venv exists, if not create it
if [ ! -d "$VENV_DIR" ]; then
    echo "Virtual environment not found. Creating '$VENV_DIR'..."
    python3 -m venv "$VENV_DIR"
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment."
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    echo "Installing dependencies..."
    "$VENV_DIR/bin/pip" install --upgrade pip
    "$VENV_DIR/bin/pip" install -e .
    
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies."
        read -p "Press Enter to exit..."
        exit 1
    fi
    
    echo "Setup complete."
else
    echo "Virtual environment found."
fi

echo "Launching..."
"$VENV_DIR/bin/python" src/ts_master.py

echo ""
echo "Process finished."
read -p "Press Enter to close this window..."
