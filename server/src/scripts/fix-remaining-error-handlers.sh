#!/bin/bash
# Script to add getErrorMessage import and replace error handling patterns

# Find all controller files
find server/src/controllers -name "*.ts" -type f -exec grep -l "catch (error: unknown)" {} \; | while read file; do
  # Check if file already imports getErrorMessage
  if ! grep -q "getErrorMessage" "$file"; then
    # Find the logger import line and add errorHandler import after it
    if grep -q "logger from" "$file" || grep -q "const logger = require" "$file"; then
      # Add import after the last import statement
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      if [ ! -z "$last_import_line" ]; then
        # Insert the import line after the last import
        sed -i "${last_import_line}a import { getErrorMessage } from '../../utils/errorHandler';" "$file"
      fi
    fi
  fi
  
  # Replace error instanceof Error ? error.message : String(error) with getErrorMessage(error)
  sed -i 's/error instanceof Error ? error\.message : String(error)/getErrorMessage(error)/g' "$file"
  sed -i 's/error instanceof Error ? error\.message : '\''Unknown error'\''/getErrorMessage(error)/g' "$file"
  
  # Replace standalone error.message in catch blocks with getErrorMessage(error)
  # This handles lines like: message: error.message
  sed -i 's/message: error\.message/message: getErrorMessage(error)/g' "$file"
  sed -i 's/\bmessage: error\b/message: getErrorMessage(error)/g' "$file"
done

echo "Fixed error handling patterns in all controller files"

