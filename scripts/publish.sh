#!/bin/bash

set -e

# Check if LICENSE file exists in the root directory
if [ ! -f LICENSE ]; then
  echo "LICENSE file not found in the root directory."
  exit 1
fi

# Check if .gitignore file exists
if [ ! -f .gitignore ]; then
  echo ".gitignore file not found in the root directory."
  exit 1
fi

# Read .gitignore into an array, ignoring comments and empty lines
gitignore_patterns=()
while IFS= read -r line; do
  # Ignore comments and empty lines
  [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
  gitignore_patterns+=("$line")
done <.gitignore

# Create an array to keep track of created LICENSE files
created_files=()

# Function to check if a path matches any .gitignore pattern
is_ignored() {
  local path=$1
  for pattern in "${gitignore_patterns[@]}"; do
    if [[ $path == $pattern || $path == $pattern/* ]]; then
      return 0
    fi
  done
  return 1
}

# Find all directories containing a package.json file
while IFS= read -r -d '' package_json; do
  dir=$(dirname "$package_json")
  # Check if directory is ignored
  if ! is_ignored "$dir"; then
    # Check if LICENSE file already exists in the directory
    if [ ! -f "$dir/LICENSE" ]; then
      # Copy the LICENSE file to the directory
      cp LICENSE "$dir"
      created_files+=("$dir/LICENSE")
      echo "Copied LICENSE to $dir"
    fi
  fi
done < <(find . -name package.json -type f -not -path "*/node_modules/*" -print0)

yarn workspaces foreach -At --no-private npm publish --provenance --access public --tolerate-republish
yarn changeset tag

# Delete only the created LICENSE files
for file in "${created_files[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "Deleted $file"
  fi
done
