#!/bin/bash
# Comprehensive React.FC to React 19 Pattern Converter
# Fixes all React.FC usage in the codebase

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   React 19 Migration Tool - FC Converter      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Create backup
BACKUP_DIR="./react-fc-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}📦 Creating backup in $BACKUP_DIR${NC}"

# Find all files with React.FC
FILES=$(grep -rl "React\.FC" src/ --include="*.tsx" --include="*.ts" 2>/dev/null || echo "")

if [ -z "$FILES" ]; then
  echo -e "${GREEN}✅ No React.FC usage found! Already migrated.${NC}"
  exit 0
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo -e "${YELLOW}Found $FILE_COUNT files with React.FC${NC}"
echo ""

FIXED_COUNT=0
FAILED_COUNT=0

for FILE in $FILES; do
  echo -e "${BLUE}Processing: $FILE${NC}"
  
  # Create backup
  BACKUP_PATH="$BACKUP_DIR/$FILE"
  mkdir -p "$(dirname "$BACKUP_PATH")"
  cp "$FILE" "$BACKUP_PATH"
  
  # Create temporary file
  TMP_FILE="${FILE}.tmp"
  cp "$FILE" "$TMP_FILE"
  
  # Fix Pattern 1: React.FC<Props> with destructured props
  # FROM: export const Comp: React.FC<Props> = ({ prop1, prop2 }) => {
  # TO:   export const Comp = ({ prop1, prop2 }: Props): JSX.Element => {
  sed -i.bak 's/\(const [A-Za-z0-9_]*\): React\.FC<\([^>]*\)> = (\([^)]*\))/\1 = (\3: \2): JSX.Element/' "$TMP_FILE"
  
  # Fix Pattern 2: React.FC without props
  # FROM: const Comp: React.FC = () => {
  # TO:   const Comp = (): JSX.Element => {
  sed -i.bak 's/\(const [A-Za-z0-9_]*\): React\.FC = ()/\1 = (): JSX.Element/' "$TMP_FILE"
  
  # Fix Pattern 3: FC<Props> (imported FC)
  sed -i.bak 's/\(const [A-Za-z0-9_]*\): FC<\([^>]*\)> = (\([^)]*\))/\1 = (\3: \2): JSX.Element/' "$TMP_FILE"
  
  # Check if changes were made
  if ! diff -q "$FILE" "$TMP_FILE" > /dev/null 2>&1; then
    mv "$TMP_FILE" "$FILE"
    rm -f "${FILE}.bak"
    echo -e "  ${GREEN}✓ Fixed${NC}"
    FIXED_COUNT=$((FIXED_COUNT + 1))
  else
    rm -f "$TMP_FILE" "${FILE}.bak"
    echo -e "  ${YELLOW}⚠ No changes made (manual review needed)${NC}"
    FAILED_COUNT=$((FAILED_COUNT + 1))
  fi
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Migration Complete!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ Fixed: $FIXED_COUNT files${NC}"
echo -e "${YELLOW}⚠ Manual review needed: $FAILED_COUNT files${NC}"
echo -e "${BLUE}📦 Backup saved to: $BACKUP_DIR${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Review changes: git diff"
echo "2. Type check: pnpm run type-check"
echo "3. Lint: pnpm run lint"
echo "4. Test: pnpm run test"
echo ""
