#!/bin/bash

# Check if ts-node command exists
if command -v ts-node &> /dev/null; then
    # ts-node exists
    ts-node src/registerCommands.ts
else
    # ts-node does not exist
    echo "Warning: ts-node is not installed, using tsc && node instead"
    # Check if tsc and node commands exist
    if command -v tsc &> /dev/null && command -v node &> /dev/null; then
        # tsc and node commands exist
        tsc && node dist/registerCommands.js
    else
        echo "Error: ts-node, or tsc and node commands are not installed."
    fi
fi

# Hide user input
stty -echo

# Wait for user input to exit
read -p "Press Enter to exit..."

exit
