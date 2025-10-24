#!/bin/bash
# Script to systematically fix React component types
# Created: October 11, 2025

# Text formatting
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== React Component Type Fixer ===${NC}"
echo "Converting React components to proper TypeScript patterns..."
echo ""

# Find files with components
echo -e "${YELLOW}Finding React components...${NC}"
COMPONENT_FILES=$(find ./src -name "*.tsx" | xargs grep -l "props\:" | sort)
FILE_COUNT=$(echo "$COMPONENT_FILES" | wc -l | tr -d ' ')

echo -e "${GREEN}Found $FILE_COUNT files with component definitions${NC}"

# Create backup directory
BACKUP_DIR="./component-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}Creating backup in $BACKUP_DIR${NC}"

# Process each file
COUNT=0
FIXED=0

for FILE in $COMPONENT_FILES; do
  COUNT=$((COUNT+1))
  RELATIVE_PATH=${FILE#./}
  BACKUP_PATH="$BACKUP_DIR/$RELATIVE_PATH"
  
  # Create directory structure for backup
  mkdir -p "$(dirname "$BACKUP_PATH")"
  cp "$FILE" "$BACKUP_PATH"
  
  echo -e "${BLUE}[$COUNT/$FILE_COUNT] Processing ${RELATIVE_PATH}${NC}"
  
  # Fix patterns:
  # 1. Replace React.FC<Props> with (props: Props): JSX.Element
  # 2. Replace FC<Props> with (props: Props): JSX.Element
  # 3. Add explicit children type to Props interfaces that don't have it
  # 4. Add explicit return type ': JSX.Element' to arrow functions
  
  # Pattern 1: React.FC<Props> => (props: Props): JSX.Element
  if grep -q "React.FC<" "$FILE"; then
    sed -i'.bak' 's/React\.FC<\([^>]*\)>[[:space:]]*=[[:space:]]*(\({[^}]*}\))/(\2: \1): JSX.Element/g' "$FILE"
    sed -i'.bak' 's/React\.FC<\([^>]*\)>[[:space:]]*=[[:space:]]*function[[:space:]]*(\({[^}]*}\))/function(\2: \1): JSX.Element/g' "$FILE"
    FIXED=$((FIXED+1))
    echo "  - Fixed React.FC pattern"
  fi
  
  # Pattern 2: FC<Props> => (props: Props): JSX.Element
  if grep -q "FC<" "$FILE"; then
    sed -i'.bak' 's/FC<\([^>]*\)>[[:space:]]*=[[:space:]]*(\({[^}]*}\))/(\2: \1): JSX.Element/g' "$FILE"
    FIXED=$((FIXED+1))
    echo "  - Fixed FC pattern"
  fi
  
  # Cleanup backup files
  rm -f "$FILE.bak"
done

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Processed $COUNT files${NC}"
echo -e "${GREEN}Fixed $FIXED component patterns${NC}"
echo -e "${YELLOW}Backups saved to $BACKUP_DIR${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run 'pnpm run type-check' to verify fixes"
echo "2. Run 'pnpm exec eslint src --fix' to clean up code style"
echo "3. Run tests to verify functionality"
echo ""
