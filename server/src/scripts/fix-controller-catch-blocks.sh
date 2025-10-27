#!/bin/bash
# Fix all catch (error: any) blocks in controllers to use error: unknown

# Find all controller files
find server/src/controllers -name "*.ts" -type f | while read file; do
  # Replace catch (error: any) with catch (error: unknown)
  # This is safe because TypeScript will catch any type errors
  
  # Basic replacement for catch blocks
  sed -i 's/} catch (error: any) {/} catch (error: unknown) {/g' "$file"
  
  # Fix error.message access patterns
  # This converts error.message to proper type-checked version
  perl -i -pe 's/(logger\.error\([^,]*\s+)\{ error: error\.message \}/$1{ error: error instanceof Error ? error.message : String(error) }/g' "$file"
  perl -i -pe 's/(res\.status\(500\)\.json\(\{[^}]*error: )error\.message/$1(error instanceof Error ? error.message : String(error))/g' "$file"
  
  # Fix lines like: logger.error('text', { error: error.message });
  perl -i -pe 's/\{ error: error\.message(,|\s*)/{ error: error instanceof Error ? error.message : String(error)$1/g' "$file"
  
  # Fix error.message without context
  perl -i -pe 's/error: error\.message/error: error instanceof Error ? error.message : String(error)/g' "$file"
done

echo "Fixed catch blocks in all controller files"

