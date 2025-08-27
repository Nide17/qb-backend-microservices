#!/bin/bash

# Move into the directory containing the .js files
cd src/components

# Rename all .js files to .jsx
find . -type f -name '*.js' -exec sh -c 'mv -- "$1" "${1%.js}.jsx"' _ {} \;
