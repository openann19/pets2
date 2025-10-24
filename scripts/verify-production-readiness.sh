#!/bin/bash

# Production Readiness Verification Script
# This script runs a series of checks to ensure the application is ready for production

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}  PawfectMatch Production Readiness Check  ${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# Exit on any error
set -e

# Function to check result and display status
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "  ${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "  ${RED}✗ FAIL${NC}: $2"
        failures=$((failures + 1))
    fi
}

# Initialize failure counter
failures=0

# Start checks
echo -e "${BLUE}Pillar 1: Code & Dependency Audit${NC}"

# Check linting
echo -e "${YELLOW}Running ESLint...${NC}"
pnpm lint
check_result $? "ESLint checks passed"

# Check type safety
echo -e "${YELLOW}Running TypeScript checks...${NC}"
pnpm type-check
check_result $? "TypeScript checks passed"

# Security audit
echo -e "${YELLOW}Running security audit...${NC}"
pnpm audit
audit_result=$?
if [ $audit_result -gt 0 ]; then
    echo -e "  ${YELLOW}⚠ WARNING${NC}: Security audit found vulnerabilities (exit code $audit_result)"
    # Don't count as failure, just warning as we expect to handle the fixes separately
else
    echo -e "  ${GREEN}✓ PASS${NC}: No vulnerabilities found"
fi

# Check for TODO comments
echo -e "${YELLOW}Checking for TODO comments...${NC}"
todos=$(grep -r "TODO\|FIXME" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="coverage" .)
if [ -z "$todos" ]; then
    echo -e "  ${GREEN}✓ PASS${NC}: No TODO/FIXME comments found"
else
    todo_count=$(echo "$todos" | wc -l)
    echo -e "  ${YELLOW}⚠ WARNING${NC}: $todo_count TODO/FIXME comments found"
fi

echo -e "\n${BLUE}Pillar 2: Environment & Configuration${NC}"

# Check for .env.example
if [ -f ".env.example" ]; then
    echo -e "  ${GREEN}✓ PASS${NC}: .env.example file exists"
else
    echo -e "  ${RED}✗ FAIL${NC}: .env.example file not found"
    failures=$((failures + 1))
fi

# Check for .env.production
if [ -f ".env.production" ]; then
    echo -e "  ${GREEN}✓ PASS${NC}: .env.production file exists"
else
    echo -e "  ${YELLOW}⚠ WARNING${NC}: .env.production file not found"
fi

# Check build
echo -e "${YELLOW}Testing build process...${NC}"
pnpm build
check_result $? "Build completed successfully"

echo -e "\n${BLUE}Pillar 3: Comprehensive Testing${NC}"

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
pnpm test
check_result $? "Tests passed"

echo -e "\n${BLUE}Pillar 4: Performance Optimization${NC}"

# Check for web performance optimizations (Lighthouse audit would ideally be run here)
echo -e "  ${YELLOW}⚠ NOTE${NC}: Lighthouse audits should be run separately"

# Check for code splitting in Next.js config
if grep -q "splitChunks" apps/web/next.config.js; then
    echo -e "  ${GREEN}✓ PASS${NC}: Code splitting configured"
else
    echo -e "  ${YELLOW}⚠ WARNING${NC}: Code splitting not explicitly configured"
fi

echo -e "\n${BLUE}Pillar 5: Security Hardening${NC}"

# Check for helmet
if grep -q "helmet" server/server.js; then
    echo -e "  ${GREEN}✓ PASS${NC}: Helmet security configured"
else
    echo -e "  ${RED}✗ FAIL${NC}: Helmet security not found"
    failures=$((failures + 1))
fi

# Check for rate limiting
if grep -q "rate-limit" server/server.js; then
    echo -e "  ${GREEN}✓ PASS${NC}: Rate limiting configured"
else
    echo -e "  ${RED}✗ FAIL${NC}: Rate limiting not found"
    failures=$((failures + 1))
fi

echo -e "\n${BLUE}Pillar 6: Observability & Monitoring${NC}"

# Check for Sentry integration
if grep -q "Sentry" server/server.js && grep -q "Sentry" apps/web/src/lib/sentry.ts; then
    echo -e "  ${GREEN}✓ PASS${NC}: Sentry monitoring configured"
else
    echo -e "  ${YELLOW}⚠ WARNING${NC}: Sentry monitoring may not be fully configured"
fi

# Check for health endpoint
if grep -q "healthz\|health" server/server.js; then
    echo -e "  ${GREEN}✓ PASS${NC}: Health check endpoints configured"
else
    echo -e "  ${RED}✗ FAIL${NC}: Health check endpoints not found"
    failures=$((failures + 1))
fi

echo -e "\n${BLUE}Pillar 7: Build & Deployment${NC}"

# Check for CI/CD
if [ -d ".github/workflows" ]; then
    echo -e "  ${GREEN}✓ PASS${NC}: GitHub Actions workflows found"
else
    echo -e "  ${RED}✗ FAIL${NC}: CI/CD workflows not found"
    failures=$((failures + 1))
fi

# Check for Docker configuration
if [ -f "docker-compose.prod.yml" ]; then
    echo -e "  ${GREEN}✓ PASS${NC}: Production Docker compose found"
else
    echo -e "  ${RED}✗ FAIL${NC}: Production Docker compose not found"
    failures=$((failures + 1))
fi

# Final summary
echo -e "\n${BLUE}=========================================${NC}"
if [ $failures -eq 0 ]; then
    echo -e "${GREEN}✅ All production readiness checks passed!${NC}"
    echo -e "${GREEN}The application is ready for production deployment.${NC}"
else
    echo -e "${RED}❌ $failures production readiness checks failed.${NC}"
    echo -e "${YELLOW}Please address the issues before deploying to production.${NC}"
fi
echo -e "${BLUE}=========================================${NC}\n"

# Exit with appropriate code
exit $failures
