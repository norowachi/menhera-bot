#!/bin/bash

# Hide user input
stty -echo

# Check if ts-node command exists
if command -v ts-node &> /dev/null; then
    # ts-node exists
   # ts-node src/register.ts
tsc
else
    # ts-node does not exist
    echo "Warning: ts-node is not installed, using tsc && node instead"
    # Check if tsc and node commands exist
    if command -v tsc &> /dev/null && command -v node &> /dev/null; then
        # tsc and node commands exist
        tsc src/register.ts && node dist/register.js
    else
        echo "Error: ts-node, or tsc and node commands are not installed."
    fi
fi

# Wait for user input to exit
read -p "Press Enter to exit..."

exit
